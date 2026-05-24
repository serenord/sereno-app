"use client";

import React, { useState } from "react";
import { Activity, Printer, Calendar, ShieldAlert, Droplet, Heart, Filter } from "lucide-react";

const SERVICE_TYPES = ["Todos", "control_presion", "glucosa", "peso", "consulta", "oximetria", "ekg"];
const LABELS: Record<string, string> = {
  "Todos": "Todos",
  "control_presion": "Presión",
  "glucosa": "Glucosa",
  "peso": "Peso",
  "consulta": "Consulta",
  "oximetria": "Oximetría",
  "ekg": "EKG",
};

const C = {
  bg: '#020617', surface: '#0f172a', border: '#1e293b',
  gray: '#94a3b8', text: '#f1f5f9', white: '#ffffff',
  green: '#10b981', greenDim: 'rgba(16,185,129,0.12)',
  red: '#ef4444', redDim: 'rgba(239,68,68,0.12)',
  blue: '#38bdf8', blueDim: 'rgba(56,189,248,0.12)', 
  amber: '#f59e0b', amberDim: 'rgba(245,158,11,0.12)',
};

export default function TelemetryClient({ logs, beneficiary }: { logs: any[], beneficiary: any }) {
  const [filterDate, setFilterDate] = useState("");
  const [filterType, setFilterType] = useState("Todos");

  const filteredLogs = logs
    .filter(log => {
      const dateOk = filterDate
        ? new Date(log.created_at).toISOString().split("T")[0] === filterDate
        : true;
      return dateOk;
    })
    .slice(0, 5);

  const handlePrint = () => window.print();

  let bmi: number | null = null;
  let bmiLabel = "N/A";
  let bmiColor = C.gray;
  if (beneficiary.weight_kg && beneficiary.height_cm) {
    const h = beneficiary.height_cm / 100;
    bmi = parseFloat((beneficiary.weight_kg / (h * h)).toFixed(1));
    if (bmi < 18.5) { bmiLabel = "Bajo Peso"; bmiColor = C.blue; }
    else if (bmi <= 24.9) { bmiLabel = "Normal"; bmiColor = C.green; }
    else if (bmi <= 29.9) { bmiLabel = "Sobrepeso"; bmiColor = C.amber; }
    else { bmiLabel = "Obesidad"; bmiColor = C.red; }
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, padding: '2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div className="hide-on-print" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', borderBottom: `1px solid ${C.border}`, paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: C.blue, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Historial Clínico</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: C.white, margin: '0.25rem 0 0' }}>Signos Vitales</h1>
            <p style={{ color: C.gray, fontSize: '0.875rem', marginTop: '0.25rem' }}>{beneficiary.full_name} — Últimos 5 registros por filtro</p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {/* BMI Pill */}
            {bmi && (
              <div style={{ 
                background: bmiColor === C.green ? C.greenDim : bmiColor === C.amber ? C.amberDim : bmiColor === C.red ? C.redDim : C.blueDim, 
                border: `1px solid ${bmiColor}40`, borderRadius: '0.6rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' 
              }}>
                <span style={{ fontSize: '0.7rem', color: C.gray, fontWeight: 700, textTransform: 'uppercase' }}>IMC</span>
                <span style={{ fontSize: '0.9rem', color: bmiColor, fontWeight: 800 }}>{bmi}</span>
                <span style={{ fontSize: '0.75rem', color: bmiColor, fontWeight: 600 }}>{bmiLabel}</span>
              </div>
            )}

            {/* Date filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.6rem', padding: '0.45rem 0.75rem' }}>
              <Calendar size={15} color={C.gray} />
              <input
                type="date"
                style={{ background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: '0.85rem', cursor: 'pointer' }}
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
              />
              {filterDate && (
                <button onClick={() => setFilterDate("")} style={{ background: 'none', border: 'none', color: C.gray, cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
              )}
            </div>

            {/* Print button */}
            <button
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: C.green, color: C.bg, border: 'none', borderRadius: '0.6rem', padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'opacity 0.2s' }}
            >
              <Printer size={16} />
              Descargar PDF
            </button>
          </div>
        </div>

        {/* Print-only header */}
        <div className="print-only" style={{ display: 'none', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.6rem', margin: '0 0 0.5rem 0' }}>SERENO — Reporte Clínico</h2>
              <p style={{ color: '#475569', margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>
                <strong style={{ color: '#0f172a' }}>Paciente:</strong> {beneficiary.full_name} 
                {beneficiary.age ? ` (${beneficiary.age} años)` : ''} 
                {beneficiary.gender ? ` · ${beneficiary.gender}` : ''}
              </p>
              <p style={{ color: '#475569', margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>
                <strong style={{ color: '#0f172a' }}>Seguro (ARS):</strong> {beneficiary.ars_provider || 'No registrado'}
              </p>
              <p style={{ color: '#64748b', margin: '0', fontSize: '0.85rem' }} suppressHydrationWarning>Generado el: {new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div style={{ textAlign: 'right', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#475569' }}><strong style={{ color: '#0f172a' }}>Plan Activo:</strong> {beneficiary.current_plan_tier || 'Esencial'}</p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#475569' }}><strong style={{ color: '#0f172a' }}>Facturación:</strong> ${beneficiary.total_amount_spent?.toFixed(2) || '0.00'} USD</p>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#dc2626', fontWeight: 'bold' }}>Cargos Pendientes: ${beneficiary.totalPending?.toFixed(2) || '0.00'} USD</p>
            </div>
          </div>
        </div>

        {/* Records table */}
        <div className="print-section" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '1rem', overflow: 'hidden' }}>
          {filteredLogs.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: C.gray }}>
              <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.2, display: 'block' }} />
              <p>No hay registros disponibles para los filtros seleccionados.</p>
              <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>Los registros son ingresados por el personal SERENO en RD.</p>
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={log.id} style={{
                padding: '1.5rem',
                borderBottom: idx < filteredLogs.length - 1 ? `1px solid ${C.border}` : 'none',
                display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start',
              }}>
                {/* Date & Status */}
                <div style={{ minWidth: 140 }}>
                  <div style={{ fontSize: '0.8rem', color: C.gray }} suppressHydrationWarning>{new Date(log.created_at).toLocaleString('es-DO')}</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem',
                    padding: '0.2rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                    background: log.is_critical ? C.redDim : C.greenDim,
                    color: log.is_critical ? C.red : C.green,
                    border: `1px solid ${log.is_critical ? C.red : C.green}40`,
                  }}>
                    {log.is_critical ? <ShieldAlert size={11} /> : null}
                    {log.is_critical ? 'Alerta' : 'Normal'}
                  </div>
                </div>

                {/* Vitals grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem', flex: 1 }}>
                  {[
                    { icon: <Heart size={11} />, label: 'Tensión', value: log.systolic && log.diastolic ? `${log.systolic}/${log.diastolic}` : null, color: C.red },
                    { icon: <Activity size={11} />, label: 'Pulso', value: log.pulse ? `${log.pulse} lpm` : null, color: C.blue },
                    { icon: <Droplet size={11} />, label: 'Oximetría', value: log.oxygen_saturation ? `${log.oxygen_saturation}%` : null, color: C.blue },
                    { icon: null, label: 'Glucosa', value: log.glucose ? `${log.glucose} mg/dL` : null, color: C.amber },
                    { icon: null, label: 'Peso', value: log.weight_kg ? `${log.weight_kg} kg` : null, color: C.text },
                    { icon: null, label: 'Estado', value: log.mood_status, color: C.text },
                  ].filter(v => v.value).map(v => (
                    <div key={v.label} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.68rem', color: C.gray, textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
                        {v.icon}{v.label}
                      </div>
                      <div style={{ fontWeight: 700, color: v.color, fontSize: '1rem' }}>{v.value}</div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {log.notes && (
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.82rem', color: C.gray, minWidth: 160 }}>
                    <div style={{ fontSize: '0.68rem', color: C.gray, textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Notas del Técnico</div>
                    {log.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-only { display: block !important; visibility: visible !important; }
          .print-section {
            position: absolute; left: 0; top: 80px; width: 100%;
            border: none !important; border-radius: 0 !important; background: white !important;
          }
          .hide-on-print { display: none !important; }
          aside, header, nav { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      ` }} />
    </div>
  );
}
