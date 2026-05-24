'use client'

import React from 'react'
import { Heart, Droplet, Activity, Wind, Pill, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

// --- HELPER FUNC ---
function getRelativeTime(date: Date) {
  if (!date) return 'Sin datos'
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Hace un momento'
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`
  return `Hace ${Math.floor(seconds / 86400)} días`
}

function Sparkline({ data, dataKey, color }: { data: any[], dataKey: string, color: string }) {
  if (!data || data.length === 0) {
    return <div className="h-12 w-full mt-4 flex items-end text-xs text-gray-400">Sin historial</div>
  }
  return (
    <div className="h-12 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2} 
            dot={{ r: 2, fill: color }} 
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function VitalCard({ title, icon, value, status, lastMeasured, sparklineData, dataKey, extraInfo }: any) {
  const isAlert = status === 'alert'
  const isNoData = status === 'noData' || !value
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isAlert ? 'bg-red-50 text-red-600' : isNoData ? 'bg-gray-50 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
            {icon}
          </div>
          <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>
        
        {isAlert ? (
          <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
            <AlertTriangle size={12} /> Alerta
          </span>
        ) : isNoData ? (
          <span className="bg-gray-50 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
            Sin Datos
          </span>
        ) : (
          <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
            <CheckCircle2 size={12} /> Normal
          </span>
        )}
      </div>

      <div>
        <div className="flex items-end gap-2">
          <span className={`text-3xl font-bold ${isNoData ? 'text-gray-300' : 'text-gray-900'}`}>
            {isNoData ? '--' : value}
          </span>
          {extraInfo && !isNoData && <span className="text-sm text-gray-500 mb-1">{extraInfo}</span>}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2 font-medium">
          <Clock size={12} /> {getRelativeTime(lastMeasured)}
        </div>
      </div>

      <Sparkline 
        data={sparklineData} 
        dataKey={dataKey} 
        color={isAlert ? '#dc2626' : isNoData ? '#9ca3af' : '#2563eb'} 
      />
    </div>
  )
}

export default function HealthMonitoringDashboard({ data }: { data: any }) {
  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Salud y Monitoreo - {data.beneficiary.name}
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            Última actualización: {getRelativeTime(data.lastUpdate)}
          </p>
        </div>
      </header>

      {/* ALERT BANNER */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm sticky top-20 z-10">
          <div className="p-2 bg-red-100 text-red-600 rounded-full mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-red-800">Atención Requerida</h3>
            <ul className="mt-1 space-y-1">
              {data.alerts.map((alert: any, i: number) => (
                <li key={i} className="text-sm text-red-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {alert.message} <span className="opacity-75">({getRelativeTime(alert.detectedAt)})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* VITALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VitalCard
          title="Presión Arterial"
          icon={<Heart size={20} />}
          value={data.vitals.bloodPressure.current ? `${data.vitals.bloodPressure.current.systolic}/${data.vitals.bloodPressure.current.diastolic}` : null}
          extraInfo="mmHg"
          status={data.vitals.bloodPressure.status}
          lastMeasured={data.vitals.bloodPressure.lastMeasured}
          sparklineData={data.vitals.bloodPressure.history}
          dataKey="systolic"
        />

        <VitalCard
          title="Glucosa"
          icon={<Droplet size={20} />}
          value={data.vitals.bloodGlucose.current?.value}
          extraInfo={data.vitals.bloodGlucose.current?.fasting ? "mg/dL (En ayunas)" : "mg/dL"}
          status={data.vitals.bloodGlucose.status}
          lastMeasured={data.vitals.bloodGlucose.lastMeasured}
          sparklineData={data.vitals.bloodGlucose.history}
          dataKey="value"
        />

        <VitalCard
          title="Frecuencia Cardíaca"
          icon={<Activity size={20} />}
          value={data.vitals.heartRate.current?.bpm}
          extraInfo="bpm"
          status={data.vitals.heartRate.status}
          lastMeasured={data.vitals.heartRate.lastMeasured}
          sparklineData={data.vitals.heartRate.history}
          dataKey="bpm"
        />

        <VitalCard
          title="Oxigenación"
          icon={<Wind size={20} />}
          value={data.vitals.oxygenSaturation.current ? `${data.vitals.oxygenSaturation.current.percentage}%` : null}
          status={data.vitals.oxygenSaturation.status}
          lastMeasured={data.vitals.oxygenSaturation.lastMeasured}
          sparklineData={data.vitals.oxygenSaturation.history}
          dataKey="percentage"
        />
      </div>

      {/* MEDICATION ADHERENCE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Pill size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Adherencia a Medicación</h3>
          </div>
          <span className="text-sm font-medium text-gray-500">Últimos 7 días</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-700">Tasa de Cumplimiento</span>
            <span className="font-bold text-gray-900">{data.medication.adherencePercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div 
              className={`${getAdherenceColor(data.medication.adherencePercentage)} h-3 rounded-full transition-all duration-1000`}
              style={{ width: `${data.medication.adherencePercentage}%` }}
            />
          </div>
        </div>

        {/* List & Next Dose Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Medicamentos Actuales</h4>
            {data.medication.medications.length === 0 ? (
              <p className="text-sm text-gray-500">No hay medicación programada.</p>
            ) : (
              <ul className="space-y-4">
                {data.medication.medications.map((med: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{med.name} <span className="text-gray-500 font-normal">{med.dosage}</span></p>
                      <p className="text-xs text-gray-500 mt-1">{med.frequency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">{med.taken}/{med.scheduled}</span>
                      {med.taken >= med.scheduled ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <AlertTriangle size={18} className="text-yellow-500" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Próxima Toma Programada</h4>
            {data.medication.nextDose ? (
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100 p-6 flex flex-col justify-center items-center text-center">
                <Clock size={32} className="text-blue-500 mb-3" />
                <p className="text-gray-600 mb-1 font-medium">Recordatorio para</p>
                <h5 className="text-xl font-bold text-blue-900 mb-2">{data.medication.nextDose.medication}</h5>
                {data.medication.nextDose.scheduledFor > new Date() && (
                  <span className="inline-block bg-blue-600 text-white font-bold py-1.5 px-4 rounded-full shadow-sm text-sm">
                    En {Math.max(1, Math.floor((data.medication.nextDose.scheduledFor.getTime() - Date.now()) / (1000 * 60 * 60)))} horas
                  </span>
                )}
              </div>
            ) : (
              <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col justify-center items-center text-center text-gray-400">
                <Pill size={32} className="mb-3 opacity-50" />
                <p>No hay tomas pendientes</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
