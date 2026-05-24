'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createServiceRequestAction(beneficiaryId: string, serviceType: string, description: string, scheduledFor?: string) {
  if (!beneficiaryId || !serviceType || !description) throw new Error("Datos incompletos")

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    throw new Error("No estás autenticado")
  }

  const { error } = await supabase.from('service_requests').insert([{
    emisor_id: authData.user.id,
    beneficiary_id: beneficiaryId,
    service_type: serviceType,
    description: description,
    scheduled_for: scheduledFor || null,
    status: 'pendiente'
  }])

  if (error) {
    throw new Error("Error creando ticket: " + error.message)
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function approveCopayAction(serviceId: string, copayAmount: number, subscriptionId: string) {
  if (!serviceId) throw new Error("ID de servicio requerido")

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    throw new Error("No estás autenticado")
  }

  // En la V1 simulamos el cobro de PayPal/Stripe exitoso.
  // 1. Insertamos el pago aprobado en payments
  const { error: paymentError } = await supabase.from('payments').insert([{
    emisor_id: authData.user.id,
    subscription_id: subscriptionId, // Para que conste a qué plan pertenece el gasto (opcional)
    service_request_id: serviceId,
    payment_type: 'copago',
    amount: copayAmount,
    status: 'validado' // Al ser digital por pasarela asume validación inmediata
  }])

  if (paymentError) {
    throw new Error("Error procesando pago: " + paymentError.message)
  }

  // 2. Actualizamos el status del ticket a aprobado
  const { error: updateError } = await supabase.from('service_requests').update({
    status: 'aprobado',
    approved_at: new Date().toISOString()
  }).eq('id', serviceId)

  if (updateError) {
    throw new Error("Error aprobando servicio: " + updateError.message)
  }

  // 3. Enviar correo de notificación a soporte
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: "smtp.titan.email",
      port: 465,
      secure: true,
      auth: {
        user: "notificaciones@serenoapp.org",
        pass: "Prueba01*",
      },
    });

    let emisorName = 'Emisor';
    let emisorPhone = '';

    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name, phone')
      .eq('id', authData.user.id)
      .single();

    if (userProfile) {
      emisorName = userProfile.full_name || emisorName;
      emisorPhone = userProfile.phone || '';
    }

    // Query service and beneficiary details
    let serviceType = 'Desconocido';
    let serviceDesc = '';
    let beneficiaryId = '';
    let beneficiaryName = 'Desconocido';

    const { data: serviceReq } = await supabase
      .from('service_requests')
      .select('service_type, description, beneficiary_id, beneficiaries(full_name)')
      .eq('id', serviceId)
      .single();

    if (serviceReq) {
      serviceType = serviceReq.service_type || serviceType;
      serviceDesc = serviceReq.description || serviceDesc;
      beneficiaryId = serviceReq.beneficiary_id || '';
      beneficiaryName = (serviceReq.beneficiaries as any)?.full_name || beneficiaryName;
    }

    // Generate WhatsApp and Admin profile links
    const cleanPhone = emisorPhone.replace(/\D/g, '');
    const emisorWhatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : 'No disponible';
    const adminProdUrl = `https://sereno-app.vercel.app/admin/patients/${beneficiaryId}`;
    const adminLocalUrl = `http://localhost:3000/admin/patients/${beneficiaryId}`;

    await transporter.sendMail({
      from: '"SERENO Notificaciones" <notificaciones@serenoapp.org>',
      to: "soporte@serenoapp.org",
      subject: `[COPAGO AUTORIZADO] - Servicio ID: ${serviceId}`,
      text: `Se ha autorizado un copago de servicio.

[INFORMACIÓN DEL PAGO]
- ID del Servicio: ${serviceId}
- Monto Copago: $${copayAmount} USD
- Suscripción ID: ${subscriptionId || 'No especificada'}

[EMISOR (Quien paga)]
- Nombre: ${emisorName}
- ID del Emisor: ${authData.user.id}
- Teléfono: ${emisorPhone || 'No registrado'}
- Contacto Directo WhatsApp: ${emisorWhatsappUrl}

[PACIENTE (Beneficiario del servicio)]
- Nombre del Paciente: ${beneficiaryName}
- ID del Paciente: ${beneficiaryId}
- Servicio Solicitado: ${serviceType.replace('_', ' ').toUpperCase()}
- Descripción de Necesidad: ${serviceDesc}

[ENLACES DE GESTIÓN (Soporte)]
- Enlace al Perfil del Paciente (Producción): ${adminProdUrl}
- Enlace al Perfil del Paciente (Local): ${adminLocalUrl}
- Chat de WhatsApp con Emisor: ${emisorWhatsappUrl}`,
    });
  } catch (emailError) {
    console.error("Error enviando correo de copago autorizado:", emailError);
  }

  revalidatePath('/dashboard')
  return { success: true }
}
