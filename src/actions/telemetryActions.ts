"use server";

import { createClient } from "@/utils/supabase/server";

export async function addVitalSignsAction(payload: {
  beneficiaryId: string;
  sys: number;
  dia: number;
  pulse: number;
  oxi: number;
  gluc?: number;
}) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("No autenticado");
  }

  // 1. Evaluate logic
  const isCrisis = 
    (payload.sys < 90 || payload.sys >= 140) ||
    (payload.dia < 60 || payload.dia >= 90) ||
    (payload.oxi <= 90) ||
    (payload.pulse < 50 || payload.pulse > 120) ||
    (payload.gluc != null && (payload.gluc < 60 || payload.gluc >= 180));

  // 2. Insert into medical_logs
  const { error: logError } = await supabase.from("medical_logs").insert({
    beneficiary_id: payload.beneficiaryId,
    systolic: payload.sys,
    diastolic: payload.dia,
    pulse: payload.pulse,
    oxygen_saturation: payload.oxi,
    glucose: payload.gluc || null,
    is_critical: isCrisis,
  });

  if (logError) {
    throw new Error(`Error registrando signos vitales: ${logError.message}`);
  }

  // 3. Update beneficiary if in crisis
  if (isCrisis) {
    const { error: updateError } = await supabase
      .from("beneficiaries")
      .update({ is_in_crisis: true })
      .eq("id", payload.beneficiaryId);
      
    if (updateError) {
      console.error("Failed to update beneficiary crisis status:", updateError);
    }
  }

  return { success: true, isCrisis };
}
