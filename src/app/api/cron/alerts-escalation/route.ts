import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.CRON_SECRET_KEY;

  // Verificación estricta de seguridad
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();

    // 1. Consultar el inventario activo real de medicamentos
    const { data: medications, error: mError } = await supabaseAdmin
      .from("medication_inventory")
      .select("id, beneficiary_id, medication_name, scheduled_time")
      .gt("pills_remaining", 0);

    if (mError) throw mError;
    if (!medications || medications.length === 0) {
      return NextResponse.json({ message: "Inventario limpio. Nada que auditar." });
    }

    let logsCreated = 0;

    for (const med of medications) {
      // 2. Revisar si ya marcó el check de medicina hoy
      const { data: habit } = await supabaseAdmin
        .from("daily_habits_check")
        .select("medication_taken")
        .eq("beneficiary_id", med.beneficiary_id)
        .eq("check_date", todayStr)
        .maybeSingle();

      if (habit && habit.medication_taken) continue; // Adherencia perfecta, saltar alerta

      // 3. Comparar hora programada con hora actual en RD
      // scheduled_time puede ser null si no se configuró aún (columna opcional)
      const scheduledTimeStr: string = med.scheduled_time || "08:00:00";
      const [schHour, schMin] = scheduledTimeStr.split(":").map(Number);
      const scheduledDate = new Date();
      scheduledDate.setHours(schHour, schMin, 0, 0);

      const diffInMinutes = Math.floor((now.getTime() - scheduledDate.getTime()) / (1000 * 60));

      // Si aún no es la hora de la toma (o es muy reciente), saltar
      if (diffInMinutes <= 15) continue;

      // Determinar el nivel de escalamiento dinámico de SERENO
      let escalation: "normal_push" | "llamada_simulada" | "alerta_hijo" | "crisis_admin" = "normal_push";
      if (diffInMinutes > 60) escalation = "crisis_admin";
      else if (diffInMinutes > 45) escalation = "alerta_hijo";
      else if (diffInMinutes > 30) escalation = "llamada_simulada";

      // 4. Insertar la alerta con el esquema de columnas exacto de la base de datos
      // Columnas reales: id, beneficiary_id, medication_inventory_id, scheduled_time, current_escalation, is_resolved, created_at
      await supabaseAdmin.from("medication_alerts_log").insert([
        {
          beneficiary_id: med.beneficiary_id,
          medication_inventory_id: med.id,
          scheduled_time: scheduledTimeStr,
          current_escalation: escalation,
          is_resolved: false,
        }
      ]);

      if (escalation === "crisis_admin") {
        await supabaseAdmin
          .from("beneficiaries")
          .update({ is_in_crisis: true })
          .eq("id", med.beneficiary_id);
      }

      logsCreated++;
    }

    return NextResponse.json({ success: true, alerts_generated: logsCreated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
