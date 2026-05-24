"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function onboardBeneficiaryAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("No autenticado.");

  const lbs = parseFloat(formData.get("weight_lbs") as string) || 0;
  const ft = parseFloat(formData.get("height_ft") as string) || 0;
  const inches = parseFloat(formData.get("height_in") as string) || 0;
  const weightKg = lbs > 0 ? parseFloat((lbs / 2.20462).toFixed(2)) : null;
  const heightCm = (ft > 0 || inches > 0) ? Math.round(((ft * 12) + inches) * 2.54) : null;

  const diagnoses = formData.getAll("diagnoses") as string[];
  const otherDiagnoses = formData.get("other_diagnoses") as string;
  const allDiagnoses = [...diagnoses, otherDiagnoses].filter(Boolean).join(", ");

  const dailyLimitations = formData.get("daily_limitations") as string;
  const emergencyContact = formData.get("emergency_contact") as string;

  const { error } = await supabase.from("beneficiaries").insert({
    emisor_id: user.id,
    full_name: formData.get("full_name") as string,
    birth_date: formData.get("birth_date") as string || null,
    gender: formData.get("gender") as string || "Femenino",
    government_id: formData.get("government_id") as string || null,
    city: formData.get("city") as string || "Santo Domingo",
    address: formData.get("phone") ? `Tel: ${formData.get("phone")}` : "No provisto",
    blood_type: formData.get("blood_type") as string || "O+",
    weight_kg: weightKg,
    height_cm: heightCm,
    diagnosis_notes: allDiagnoses || null,
    takes_medication: !!(formData.get("medications")),
    medical_background_app: allDiagnoses || null,
    dietary_restrictions: formData.get("allergies") ? `Alergias: ${formData.get("allergies")}` : null,
    ars_provider: formData.get("ars_provider") as string || null,
    ars_card_number: formData.get("ars_card_number") as string || null,
    trusted_doctor_info: formData.get("trusted_doctor_info") as string || null,
    daily_limitations: dailyLimitations
      ? `${dailyLimitations}${emergencyContact ? ` | Contacto emergencia: ${emergencyContact}` : ""}${formData.get("medications") ? ` | Medicamentos reportados: ${formData.get("medications") as string}` : ""}`
      : (formData.get("medications") ? `Medicamentos reportados: ${formData.get("medications") as string}` : null),
    relationship_to_emisor: formData.get("relationship_to_emisor") as string || "Familiar",
    current_plan_tier: "esencial",
    is_in_crisis: false,
  });

  if (error) throw new Error(`Error guardando beneficiario: ${error.message}`);
  redirect("/dashboard");
}
