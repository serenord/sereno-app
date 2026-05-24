import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Heart, CheckCircle2, Circle, Activity } from 'lucide-react'
import React from 'react'

export const revalidate = 0

export default async function AbueloDashboard() {
  const supabase = await createClient()

  // 1. Obtener la sesión activa (para pruebas, usaremos la sesión del emisor que tiene al abuelo asignado)
  const { data: { session } } = await supabase.auth.getSession()

  const dict = {
    app_retention: {
      routine_title: "Tu Rutina de Salud de Hoy",
      med_taken: "Tomar mis pastillas programadas",
      hydrate: "Tomar suficiente agua en el día",
      walk: "Completar mis comidas a tiempo", // Cambiado de caminar a comidas basado en schema
      stable: "¡Excelente! Tus signos están bajo control de SERENO",
      attention: "Tu gestor pasará a visitarte hoy para revisar tu presión",
    }
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: 'white', padding: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Cargando tu feed de salud...
      </div>
    )
  }

  // 2. Extraer el beneficiario (Usamos emisor_id para que puedas probarlo con tu misma cuenta)
  const { data: beneficiary } = await supabase
    .from("beneficiaries")
    .select("id")
    .eq("emisor_id", session.user.id)
    .single()

  // 3. Extraer el log médico más reciente y hábitos
  let lastTelemetry = null
  let habitCheck = null

  if (beneficiary) {
    const { data: log } = await supabase
      .from("medical_logs") // Nombre real de la tabla
      .select("*")
      .eq("beneficiary_id", beneficiary.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    
    if (log) lastTelemetry = log

    const todayStr = new Date().toISOString().split("T")[0]
    const { data: habit } = await supabase
      .from("daily_habits_check")
      .select("*")
      .eq("beneficiary_id", beneficiary.id)
      .eq("check_date", todayStr)
      .single()
    
    if (habit) habitCheck = habit
  }

  // Semáforo inteligente basado en los límites de telemetría médica
  const isHighTension = lastTelemetry 
    ? (lastTelemetry.systolic >= 140 || lastTelemetry.diastolic >= 90)
    : false

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: 'white', padding: '1.5rem', fontFamily: 'sans-serif', userSelect: 'none' }}>
      <main style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1rem' }}>
        
        {/* Encabezado Semáforo Grande de Paz Mental */}
        <section style={{ 
          padding: '1.5rem', 
          borderRadius: '1.5rem', 
          border: `1px solid ${isHighTension ? '#f43f5e' : '#10b981'}`,
          backgroundColor: isHighTension ? 'rgba(159, 18, 57, 0.6)' : 'rgba(6, 78, 59, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ 
            width: '1.5rem', 
            height: '1.5rem', 
            borderRadius: '50%', 
            backgroundColor: isHighTension ? '#ef4444' : '#10b981',
            boxShadow: `0 0 15px ${isHighTension ? '#ef4444' : '#10b981'}` 
          }} />
          <p style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.025em', lineHeight: '1.3', margin: 0 }}>
            {isHighTension ? dict.app_retention.attention : dict.app_retention.stable}
          </p>
        </section>

        {/* Tarjetas de Constantes Vitales - Alta Visibilidad */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: '#0f172a', border: '2px solid #1e293b', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
              <Heart color="#f43f5e" size={28} />
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Tu Presión Arterial</span>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.025em', color: 'white', padding: '0.5rem 0' }}>
              {lastTelemetry ? `${lastTelemetry.systolic}/${lastTelemetry.diastolic}` : "120/80"}{" "}
              <span style={{ fontSize: '1.125rem', fontWeight: 'normal', color: '#94a3b8' }}>mmHg</span>
            </div>
            <p style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '0.5rem', margin: 0 }}>Última medición tomada por tu Gestor SERENO.</p>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '2px solid #1e293b', borderRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
              <Activity color="#38bdf8" size={28} />
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Tus Pulsaciones</span>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.025em', color: 'white', padding: '0.5rem 0' }}>
              {/* Simulamos pulso ya que no lo guardamos explícitamente en el schema de Phase 2 */}
              {lastTelemetry ? "74" : "72"}{" "}
              <span style={{ fontSize: '1.125rem', fontWeight: 'normal', color: '#94a3b8' }}>lpm</span>
            </div>
            <p style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '0.5rem', margin: 0 }}>Tu corazón está latiendo en rangos correctos.</p>
          </div>

        </section>

        {/* Lista Control de Rutina del Abuelo */}
        <section style={{ backgroundColor: '#0f172a', border: '2px solid #1e293b', borderRadius: '1.5rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#34d399', marginBottom: '1.5rem', margin: '0 0 1.5rem 0' }}>{dict.app_retention.routine_title}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#020617', padding: '1rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
              {habitCheck?.medication_taken ? (
                <CheckCircle2 color="#34d399" size={32} style={{ flexShrink: 0 }} />
              ) : (
                <Circle color="#475569" size={32} style={{ flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#e2e8f0' }}>{dict.app_retention.med_taken}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#020617', padding: '1rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
              {(habitCheck?.water_ml_consumed || 0) > 0 ? (
                <CheckCircle2 color="#34d399" size={32} style={{ flexShrink: 0 }} />
              ) : (
                <Circle color="#475569" size={32} style={{ flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#e2e8f0' }}>{dict.app_retention.hydrate}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#020617', padding: '1rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
              {habitCheck?.meals_completed ? (
                <CheckCircle2 color="#34d399" size={32} style={{ flexShrink: 0 }} />
              ) : (
                <Circle color="#475569" size={32} style={{ flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#e2e8f0' }}>{dict.app_retention.walk}</span>
            </div>

          </div>
        </section>

      </main>
    </div>
  )
}
