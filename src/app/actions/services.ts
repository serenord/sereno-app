"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function manageServiceAction(serviceId: string, action: "suspendido" | "eliminado") {
  try {
    // 1. Obtener la solicitud
    const { data: service, error: fetchError } = await supabaseAdmin
      .from("services_requests")
      .select("*")
      .eq("id", serviceId)
      .single();

    if (fetchError || !service) throw new Error("Servicio no encontrado.");

    // 2. Calcular penalidad
    const scheduledDate = new Date(service.scheduled_for || service.created_at);
    const now = new Date();
    
    // Diferencia en horas
    const diffTime = scheduledDate.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 3600);

    let penaltyFee = 0.00;
    let penaltyApplied = false;

    // Si es menor a 48h (incluso si ya pasó), se cobra 5 USD
    if (diffHours < 48) {
      penaltyFee = 5.00;
      penaltyApplied = true;
    }

    // 3. Actualizar el servicio
    const { error: updateError } = await supabaseAdmin
      .from("services_requests")
      .update({ 
        status: action,
        penalty_applied: penaltyApplied 
      })
      .eq("id", serviceId);

    if (updateError) throw updateError;

    // 4. Registrar en Audit Log y crear cargo
    const { error: logError } = await supabaseAdmin
      .from("service_audit_logs")
      .insert([
        {
          service_id: serviceId,
          action: action,
          penalty_fee: penaltyFee
        }
      ]);

    if (logError) throw logError;

    if (penaltyApplied) {
      const { error: fundingError } = await supabaseAdmin
        .from("funding_requests")
        .insert([
          {
            beneficiary_id: service.beneficiary_id,
            concept: `Penalidad logística por servicio ${action} (< 48h)`,
            net_cost: penaltyFee,
            status: "pendiente_aprobacion",
          }
        ]);
      if (fundingError) console.error("Error creando cargo de penalidad:", fundingError);
    }

    revalidatePath("/dashboard/services");

    return { 
      success: true, 
      penaltyFee, 
      message: penaltyApplied 
        ? `Acción realizada con penalidad de $${penaltyFee} USD.`
        : `Acción realizada sin penalidad.`
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al procesar la acción." };
  }
}
