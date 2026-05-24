import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import HealthMonitoringDashboard from './HealthMonitoringDashboard';
import type { VitalSign, LatestVitalSign } from '@/utils/types/database.types';

export const dynamic = 'force-dynamic'

export default async function TelemetryPage() {
  const supabase = await createClient();
  
  // 1. Verificar autenticación
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect('/auth/login');
  
  // 2. Obtener beneficiario activo del Emisor
  const { data: beneficiary, error: beneficiaryError } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('emisor_id', authData.user.id)
    .single(); // en V1 usamos single porque asume 1 emisor = 1 beneficiario
  
  if (beneficiaryError || !beneficiary) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center bg-white p-12 rounded-3xl border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No hay beneficiarios activos
          </h2>
          <p className="text-gray-600 mb-6">
            Completa el onboarding o contacta a soporte para comenzar a monitorear la salud de tus seres queridos.
          </p>
          <a href="/dashboard/onboarding" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium">Ir al Registro</a>
        </div>
      </div>
    );
  }
  
  // 3. Fetch últimas mediciones (vista optimizada)
  const { data: latestVitals } = await supabase
    .from('latest_vital_signs')
    .select('*')
    .eq('beneficiary_id', beneficiary.id);
  
  // 4. Fetch historial (últimos 30 días para gráficos)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: vitalsHistory } = await supabase
    .from('vital_signs')
    .select('*')
    .eq('beneficiary_id', beneficiary.id)
    .gte('measured_at', thirtyDaysAgo.toISOString())
    .order('measured_at', { ascending: false });
  
  // 5. Fetch alertas activas (últimas 24 horas)
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  const { data: activeAlerts } = await supabase
    .from('vital_signs')
    .select('*')
    .eq('beneficiary_id', beneficiary.id)
    .eq('is_alert', true)
    .gte('measured_at', twentyFourHoursAgo.toISOString())
    .order('measured_at', { ascending: false });
  
  // 6. Fetch adherencia a medicación (últimos 7 días)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: adherenceData } = await supabase
    .from('medication_adherence')
    .select(`
      *,
      medication_schedule:medication_schedules(
        medication_name,
        dosage,
        frequency
      )
    `)
    .eq('beneficiary_id', beneficiary.id)
    .gte('scheduled_time', sevenDaysAgo.toISOString());
  
  // 7. Fetch horarios de medicación activos
  const { data: medicationSchedules } = await supabase
    .from('medication_schedules')
    .select('*')
    .eq('beneficiary_id', beneficiary.id)
    .eq('is_active', true);
  
  // 8. Transformar datos para el componente
  const transformedData = transformDataForDashboard(
    beneficiary,
    latestVitals || [],
    vitalsHistory || [],
    activeAlerts || [],
    adherenceData || [],
    medicationSchedules || []
  );
  
  return <HealthMonitoringDashboard data={transformedData} />;
}

// Función helper para transformar datos de Supabase al formato del componente
function transformDataForDashboard(
  beneficiary: any,
  latestVitals: LatestVitalSign[],
  vitalsHistory: VitalSign[],
  activeAlerts: VitalSign[],
  adherenceData: any[],
  medicationSchedules: any[]
) {
  // Helper: obtener última medición por tipo
  const getLatestVital = (type: string) => 
    latestVitals.find(v => v.measurement_type === type);
  
  // Helper: obtener historial por tipo (últimos 7 días para sparkline)
  const getHistory = (type: string) => 
    vitalsHistory
      .filter(v => v.measurement_type === type)
      .slice(0, 7)
      .reverse();
  
  // Calcular adherencia
  const totalScheduled = adherenceData.length;
  const totalTaken = adherenceData.filter(a => a.taken_at !== null).length;
  const adherencePercentage = totalScheduled > 0 
    ? Math.round((totalTaken / totalScheduled) * 100)
    : 100; // si no hay scheduled, asumimos 100% o 0
  
  // Agrupar medicamentos con su cumplimiento
  const medications = medicationSchedules.map(schedule => {
    const scheduledDoses = adherenceData.filter(
      a => a.medication_schedule_id === schedule.id
    );
    const takenDoses = scheduledDoses.filter(a => a.taken_at !== null);
    
    return {
      name: schedule.medication_name,
      dosage: schedule.dosage,
      frequency: schedule.frequency,
      taken: takenDoses.length,
      scheduled: Math.max(scheduledDoses.length, 1) // evitar 0
    };
  });
  
  // Próxima dosis (placeholder o real basado en los schedules)
  const nextDose = medicationSchedules[0] ? {
    medication: medicationSchedules[0].medication_name,
    scheduledFor: new Date(Date.now() + 4 * 60 * 60 * 1000) // Placeholder for V1
  } : null;
  
  return {
    beneficiary: {
      name: beneficiary.full_name,
      relationship: beneficiary.relationship
    },
    lastUpdate: vitalsHistory[0]?.measured_at 
      ? new Date(vitalsHistory[0].measured_at)
      : null,
    alerts: activeAlerts.map(alert => ({
      type: alert.measurement_type,
      message: alert.alert_reason || 'Alerta detectada',
      detectedAt: new Date(alert.measured_at)
    })),
    vitals: {
      bloodPressure: transformVitalData(
        getLatestVital('blood_pressure'),
        getHistory('blood_pressure'),
        'blood_pressure'
      ),
      bloodGlucose: transformVitalData(
        getLatestVital('blood_glucose'),
        getHistory('blood_glucose'),
        'blood_glucose'
      ),
      heartRate: transformVitalData(
        getLatestVital('heart_rate'),
        getHistory('heart_rate'),
        'heart_rate'
      ),
      oxygenSaturation: transformVitalData(
        getLatestVital('oxygen_saturation'),
        getHistory('oxygen_saturation'),
        'oxygen_saturation'
      )
    },
    medication: {
      adherencePercentage,
      medications,
      nextDose
    }
  };
}

function transformVitalData(
  latest: LatestVitalSign | undefined,
  history: VitalSign[],
  type: string
) {
  if (!latest) {
    return {
      current: null,
      status: 'noData' as const,
      lastMeasured: null,
      history: []
    };
  }
  
  const status = latest.is_alert ? 'alert' : 'normal';
  
  // Transformar historial para gráficos
  const historyData = history.map(h => {
    const date = new Date(h.measured_at).toISOString().split('T')[0];
    
    switch (type) {
      case 'blood_pressure':
        return {
          date,
          systolic: (h.value as any).systolic,
          diastolic: (h.value as any).diastolic
        };
      case 'blood_glucose':
        return {
          date,
          value: (h.value as any).value
        };
      case 'heart_rate':
        return {
          date,
          bpm: (h.value as any).bpm
        };
      case 'oxygen_saturation':
        return {
          date,
          percentage: (h.value as any).percentage
        };
      default:
        return { date };
    }
  });
  
  return {
    current: latest.value,
    status,
    lastMeasured: new Date(latest.measured_at),
    history: historyData
  };
}
