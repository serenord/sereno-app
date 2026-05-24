import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { HeartPulse, Activity, Wind, ShieldAlert, CheckCircle2, PhoneCall } from 'lucide-react'

export const revalidate = 0;

export default async function AbueloDashboard() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // En un mundo real, el login del abuelo nos daría su propio profile_id,
  // pero asumiendo que un beneficiario no tiene auth.users, el "emisor" o una cuenta genérica
  // lo vería. O tal vez el abuelo sí tiene un profile_id en la BD (phase 2).
  // Vamos a buscar al beneficiario donde la sesión es el emisor, o donde el ID coincide.
  // Para la prueba asumo que el emisor inicia sesión y le pasa la tablet al abuelo,
  // o el abuelo tiene su propia cuenta que mapea como 'emisor_id' también.
  const { data: beneficiary } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("emisor_id", session.user.id)
    .single()

  if (!beneficiary) {
    return (
      <div style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <h2>No hay perfil de paciente configurado.</h2>
      </div>
    )
  }

  // Traer última métrica
  const { data: latestLog } = await supabase
    .from("medical_logs")
    .select("*")
    .eq("beneficiary_id", beneficiary.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (beneficiary.is_in_crisis) {
    return (
      <div style={{ backgroundColor: '#7f1d1d', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'white', textAlign: 'center' }}>
        <ShieldAlert size={120} color="#fca5a5" style={{ marginBottom: '2rem', animation: 'pulse 2s infinite' }} />
        <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 1rem 0' }}>¡MANTÉN LA CALMA!</h1>
        <p style={{ fontSize: '1.5rem', maxWidth: '600px', lineHeight: '1.5', color: '#fecaca' }}>
          Hemos detectado una anomalía en tus métricas. Nuestro equipo médico y tu familiar han sido notificados. 
        </p>
        <div style={{ marginTop: '3rem', backgroundColor: '#991b1b', padding: '2rem', borderRadius: '1.5rem', border: '4px solid #f87171' }}>
          <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            <PhoneCall size={40} /> PROTOCOLO DE AYUDA
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.5rem', textAlign: 'left', margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>1. Siéntate en un lugar cómodo.</li>
            <li>2. Respira profundo por la nariz.</li>
            <li>3. Espera la llamada de SERENO en 2 minutos.</li>
          </ul>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
        `}} />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: '900', margin: '0 0 0.5rem 0' }}>
            Hola, {beneficiary.full_name.split(' ')[0]}
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.75rem 1.5rem', borderRadius: '999px', fontSize: '1.25rem', fontWeight: 'bold' }}>
            <CheckCircle2 size={24} /> Todo está en orden hoy
          </div>
        </header>

        {!latestLog ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '2rem', color: '#64748b' }}>Aún no hay lecturas médicas hoy.</h2>
            <p style={{ fontSize: '1.5rem', color: '#94a3b8' }}>Espera a que el técnico realice la toma.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#475569', textAlign: 'center', margin: 0 }}>
              Tu última medición: {new Date(latestLog.created_at).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
            </h2>

            {/* Presión Arterial GIGANTE */}
            <div style={{ backgroundColor: 'white', borderRadius: '2rem', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '2px solid #e2e8f0' }}>
              <HeartPulse size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Presión Arterial</div>
              <div style={{ fontSize: '6rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>
                {latestLog.systolic}/{latestLog.diastolic}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Pulso */}
              <div style={{ backgroundColor: 'white', borderRadius: '2rem', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '2px solid #e2e8f0' }}>
                <Activity size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                <div style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Pulso</div>
                <div style={{ fontSize: '4rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>
                  {latestLog.pulse || '--'} <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>lpm</span>
                </div>
              </div>

              {/* Oxígeno */}
              <div style={{ backgroundColor: 'white', borderRadius: '2rem', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '2px solid #e2e8f0' }}>
                <Wind size={48} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                <div style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Oxígeno</div>
                <div style={{ fontSize: '4rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>
                  {latestLog.oxygen_saturation || '--'} <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
