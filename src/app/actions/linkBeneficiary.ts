"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function linkBeneficiaryByShortId(emisorId: string, shortId: string) {
  try {
    const cleanId = shortId.replace(/^PAC-/i, "").trim().toUpperCase();

    // Utilizamos la cuenta de servicio (admin) para saltar el RLS de la tabla beneficiaries
    // y encontrar a los pacientes "huérfanos".
    const { data: allPatients, error: findError } = await supabaseAdmin
      .from("beneficiaries")
      .select("id, emisor_id");
      
    if (findError) throw findError;
    
    // Buscamos coincidencia con el ID Corto (primeros 8 caracteres o coincidencia exacta de inicio)
    const patient = allPatients?.find(p => p.id.toUpperCase().startsWith(cleanId));
      
    if (!patient) {
      return { success: false, error: "No se encontró ningún paciente con ese ID. Verifica e intenta de nuevo." };
    }

    if (patient.emisor_id) {
      return { success: false, error: "Este paciente ya está vinculado a un emisor." };
    }

    // Vincular usando supabaseAdmin
    const { error: updateError } = await supabaseAdmin
      .from("beneficiaries")
      .update({ emisor_id: emisorId })
      .eq("id", patient.id);

    if (updateError) throw updateError;
    
    revalidatePath("/dashboard");
    revalidatePath("/admin/users/[id]");
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error interno al vincular." };
  }
}
