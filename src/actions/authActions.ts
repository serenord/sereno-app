"use server";

import { createClient } from "@/utils/supabase/server";

export async function signUpAction(formData: any, beneficiaryData: any) {
  const supabase = await createClient();

  // 1. Signup Emisor
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { full_name: formData.full_name, phone: formData.phone },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
    }
  });

  if (authError) {
    if (authError.message.includes('rate limit')) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Error al crear usuario.');
  }

  // 2. Imperial → Metric conversions
  const lbs = parseFloat(beneficiaryData.weight_lbs) || 0;
  const ft = parseFloat(beneficiaryData.height_ft) || 0;
  const inches = parseFloat(beneficiaryData.height_in) || 0;
  const weightKg = lbs > 0 ? parseFloat((lbs / 2.20462).toFixed(2)) : null;
  const heightCm = (ft > 0 || inches > 0) ? Math.round(((ft * 12) + inches) * 2.54) : null;

  // 3. Atomic insert with all clinical fields
  const { error: benError } = await supabase.from("beneficiaries").insert({
    emisor_id: authData.user.id,
    full_name: beneficiaryData.full_name,
    birth_date: beneficiaryData.birth_date || null,
    gender: beneficiaryData.gender || "Femenino",
    government_id: beneficiaryData.government_id || null,
    address: beneficiaryData.phone ? `Tel: ${beneficiaryData.phone}` : "No provisto",
    city: beneficiaryData.city || "Santo Domingo",
    blood_type: beneficiaryData.blood_type || "O+",
    weight_kg: weightKg,
    height_cm: heightCm,
    diagnosis_notes: beneficiaryData.current_diagnoses || null,
    takes_medication: !!(beneficiaryData.medications),
    medical_background_app: beneficiaryData.current_diagnoses || null,
    dietary_restrictions: beneficiaryData.allergies ? `Alergias: ${beneficiaryData.allergies}` : null,
    ars_provider: beneficiaryData.ars_provider || null,
    ars_card_number: beneficiaryData.ars_card_number || null,
    trusted_doctor_info: beneficiaryData.trusted_doctor_info || null,
    daily_limitations: beneficiaryData.daily_limitations
      ? `${beneficiaryData.daily_limitations}${beneficiaryData.emergency_contact ? ` | Contacto emergencia: ${beneficiaryData.emergency_contact}` : ""}${beneficiaryData.medications ? ` | Medicamentos que reporta tomar: ${beneficiaryData.medications}` : ""}`
      : (beneficiaryData.medications ? `Medicamentos que reporta tomar: ${beneficiaryData.medications}` : null),
    relationship_to_emisor: beneficiaryData.relationship_to_emisor || "Familiar",
    current_plan_tier: beneficiaryData.plan || "esencial",
    is_in_crisis: false,
  });

  if (benError) {
    throw new Error(`Error vinculando beneficiario: ${benError.message}`);
  }

  if (authData.user.identities && authData.user.identities.length === 0) {
    return { success: true, needsEmailVerification: true };
  }

  return { success: true, needsEmailVerification: true };
}

export async function resetPasswordAction(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/update-password`,
  });

  if (error) {
    if (error.message.includes('rate limit')) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    throw new Error(error.message);
  }

  return { success: true };
}

export async function updatePasswordAction(password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
