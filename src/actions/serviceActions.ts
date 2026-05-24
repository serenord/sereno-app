"use server";

import { createClient } from "@/utils/supabase/server";

export async function requestServiceAction(payload: {
  beneficiaryId: string;
  serviceType: string;
  scheduledDate: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("No autenticado");
  }

  const emisorId = userData.user.id;

  // 1. Calculate penalty
  const scheduledTime = new Date(payload.scheduledDate).getTime();
  const hoursUntil = (scheduledTime - Date.now()) / (1000 * 60 * 60);
  const penaltyApplied = hoursUntil < 48;

  // 2. Insert into services_requests
  const { data: requestData, error: reqError } = await supabase.from("services_requests").insert({
    emisor_id: emisorId,
    beneficiary_id: payload.beneficiaryId,
    service_type: payload.serviceType,
    service_name: payload.notes || payload.serviceType,
    status: "activo",
    scheduled_for: payload.scheduledDate,
    penalty_applied: penaltyApplied,
  }).select().single();

  if (reqError) {
    throw new Error(`Error creando solicitud: ${reqError.message}`);
  }

  // 3. Insert audit log
  const { error: auditError } = await supabase.from("service_audit_logs").insert({
    service_id: requestData.id,
    action: "creado",
    action_by: emisorId
  });

  if (auditError) {
    console.error("Failed to insert audit log:", auditError);
  }

  // 4. Send email to support
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: "smtp.titan.email", // Using standard Titan/Hostinger SMTP, adjust if Sereno uses a different host
      port: 465,
      secure: true,
      auth: {
        user: "notificaciones@serenoapp.org",
        pass: "Prueba01*",
      },
    });

    await transporter.sendMail({
      from: '"SERENO Notificaciones" <notificaciones@serenoapp.org>',
      to: "soporte@serenoapp.org",
      subject: `[NUEVO SERVICIO] - Emisor: ${emisorId}`,
      text: `Se ha solicitado un nuevo servicio.\n\nTipo: ${payload.serviceType}\nDescripción: ${payload.notes}\nFecha Programada: ${payload.scheduledDate}\nPaciente ID: ${payload.beneficiaryId}\nEmisor ID: ${emisorId}`,
    });
  } catch (emailError) {
    console.error("Error enviando correo de notificación:", emailError);
  }

  // 5. Generate WhatsApp URL
  const { data: benData } = await supabase
    .from("beneficiaries")
    .select("full_name")
    .eq("id", payload.beneficiaryId)
    .single();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", emisorId)
    .single();

  const benName = benData?.full_name || "su familiar";
  const emisorName = profileData?.full_name || "Emisor";
  
  const shortEmisor = `EMI-${emisorId.split('-')[0].toUpperCase()}`;
  const shortBen = `PAC-${payload.beneficiaryId.split('-')[0].toUpperCase()}`;
  const shortRef = requestData.id.split('-')[0].toUpperCase();

  const text = `Hola, soy el emisor ${emisorName} (${shortEmisor}). Acabo de solicitar el servicio '${payload.serviceType}' para ${benName} (ID Paciente: ${shortBen}) pautado para el ${new Date(payload.scheduledDate).toLocaleString('es-DO', { dateStyle: 'short', timeStyle: 'short' })}. Referencia de servicio: ${shortRef}`;
  
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/18292847990?text=${encodedText}`;

  return { success: true, whatsappUrl, penaltyApplied };
}
