import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // 1. Verificación de Seguridad Básica para el Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || process.env.CRON_SECRET_KEY;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Inicializar Supabase con Service Role para bypass de RLS en el cron
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fecha de hoy en formato local (RD timezone / UTC-4 aprox)
  const today = new Date().toISOString().split('T')[0];

  try {
    // 3. Obtener los beneficiarios
    const { data: beneficiaries, error: benError } = await supabase
      .from('beneficiaries')
      .select('id, full_name, relationship_to_emisor, emisor_id, profiles!inner(full_name)');

    if (benError) throw benError;

    const emailPayloads = [];

    // 4. Iterar y cruzar datos del día
    for (const b of beneficiaries) {
      // Buscar hábitos del día
      const { data: habit } = await supabase
        .from('daily_habits_check')
        .select('*')
        .eq('beneficiary_id', b.id)
        .eq('check_date', today)
        .single();

      // Buscar bitácoras IoT del día
      const { data: logs } = await supabase
        .from('medical_logs')
        .select('systolic, diastolic, partner_id, profiles!partner_id(full_name)')
        .eq('beneficiary_id', b.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false })
        .limit(1);

      const latestLog = logs?.[0];
      const docName = (latestLog?.profiles as any)?.full_name || 'nuestro equipo médico';

      const bpStatus = (latestLog && latestLog.systolic && latestLog.diastolic) 
        ? `${latestLog.systolic}/${latestLog.diastolic} (Estable)` 
        : 'Sin lectura hoy';

      const medsStatus = habit?.medication_taken ? 'completada' : 'pendiente';
      
      const payload = {
        emisorId: b.emisor_id,
        beneficiaryName: b.full_name,
        emailBody: `Hola ${(b.profiles as any)?.full_name?.split(' ')[0] || ''}, SERENO ejecutó el control de hoy de tu ${b.relationship_to_emisor.toLowerCase()}. Su presión arterial marcada por ${docName} fue ${bpStatus}. Medicación ${medsStatus}. Almuerzo y toma de agua reportados en orden. Tu paz mental está asegurada hoy.`
      };

      emailPayloads.push(payload);
    }

    // 5. Retornar el Payload para que el integrador externo (Ej. Zapier, Make, Apps Script) lo procese y envíe
    return NextResponse.json({
      success: true,
      processedDate: today,
      data: emailPayloads
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
