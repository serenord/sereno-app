'use client'

import { useState, useTransition } from 'react'
import { recordVitalSignAction } from '@/app/admin/actions'
import { Loader2, X, Heart, Droplet, Activity, Wind } from 'lucide-react'

interface RecordVitalsModalProps {
  beneficiaryId: string
  beneficiaryName: string
  onClose: () => void
}

type MeasurementType = 'blood_pressure' | 'blood_glucose' | 'heart_rate' | 'oxygen_saturation';

export function RecordVitalsModal({ beneficiaryId, beneficiaryName, onClose }: RecordVitalsModalProps) {
  const [measurementType, setMeasurementType] = useState<MeasurementType>('blood_pressure')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  // Valores según el tipo
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [glucose, setGlucose] = useState('')
  const [isFasting, setIsFasting] = useState(true)
  const [heartRate, setHeartRate] = useState('')
  const [oxygen, setOxygen] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let valuePayload: any = {}

    if (measurementType === 'blood_pressure') {
      if (!systolic || !diastolic) return alert("Ingresa presión sistólica y diastólica")
      valuePayload = { systolic: Number(systolic), diastolic: Number(diastolic), unit: 'mmHg' }
    } else if (measurementType === 'blood_glucose') {
      if (!glucose) return alert("Ingresa el nivel de glucosa")
      valuePayload = { value: Number(glucose), unit: 'mg/dL', fasting: isFasting }
    } else if (measurementType === 'heart_rate') {
      if (!heartRate) return alert("Ingresa la frecuencia cardíaca")
      valuePayload = { bpm: Number(heartRate) }
    } else if (measurementType === 'oxygen_saturation') {
      if (!oxygen) return alert("Ingresa la saturación de oxígeno")
      valuePayload = { percentage: Number(oxygen) }
    }

    startTransition(async () => {
      try {
        await recordVitalSignAction(beneficiaryId, measurementType, valuePayload, notes)
        alert("¡Signos vitales registrados con éxito! Las alertas (si aplican) han sido enviadas al familiar.")
        onClose()
      } catch (error: any) {
        alert("Error: " + error.message)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Registrar Signos Vitales</h2>
            <p className="text-sm text-gray-500 mt-1">Paciente: <span className="font-semibold text-gray-900">{beneficiaryName}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-2 bg-gray-50 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selector de Tipo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">¿Qué deseas registrar?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMeasurementType('blood_pressure')}
                className={`p-3 rounded-xl border flex items-center gap-2 transition ${measurementType === 'blood_pressure' ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Heart size={18} /> Presión Arterial
              </button>
              <button
                type="button"
                onClick={() => setMeasurementType('blood_glucose')}
                className={`p-3 rounded-xl border flex items-center gap-2 transition ${measurementType === 'blood_glucose' ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Droplet size={18} /> Glucosa
              </button>
              <button
                type="button"
                onClick={() => setMeasurementType('heart_rate')}
                className={`p-3 rounded-xl border flex items-center gap-2 transition ${measurementType === 'heart_rate' ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Activity size={18} /> Frec. Cardíaca
              </button>
              <button
                type="button"
                onClick={() => setMeasurementType('oxygen_saturation')}
                className={`p-3 rounded-xl border flex items-center gap-2 transition ${measurementType === 'oxygen_saturation' ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Wind size={18} /> Oxigenación
              </button>
            </div>
          </div>

          {/* Formulario Dinámico según Tipo */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            {measurementType === 'blood_pressure' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sistólica</label>
                  <div className="relative">
                    <input type="number" required value={systolic} onChange={e => setSystolic(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold" placeholder="120" />
                    <span className="absolute right-3 top-4 text-sm text-gray-400">mmHg</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Diastólica</label>
                  <div className="relative">
                    <input type="number" required value={diastolic} onChange={e => setDiastolic(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold" placeholder="80" />
                    <span className="absolute right-3 top-4 text-sm text-gray-400">mmHg</span>
                  </div>
                </div>
              </div>
            )}

            {measurementType === 'blood_glucose' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nivel de Glucosa</label>
                  <div className="relative">
                    <input type="number" required value={glucose} onChange={e => setGlucose(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold" placeholder="95" />
                    <span className="absolute right-3 top-4 text-sm text-gray-400">mg/dL</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isFasting} onChange={e => setIsFasting(e.target.checked)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Medición en ayunas</span>
                </label>
              </div>
            )}

            {measurementType === 'heart_rate' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Frecuencia Cardíaca</label>
                <div className="relative">
                  <input type="number" required value={heartRate} onChange={e => setHeartRate(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold" placeholder="72" />
                  <span className="absolute right-3 top-4 text-sm text-gray-400">bpm</span>
                </div>
              </div>
            )}

            {measurementType === 'oxygen_saturation' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Saturación de Oxígeno</label>
                <div className="relative">
                  <input type="number" required value={oxygen} onChange={e => setOxygen(e.target.value)} max="100" min="0" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold" placeholder="98" />
                  <span className="absolute right-3 top-4 text-sm text-gray-400">%</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas del especialista (Opcional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              placeholder="Escribe alguna observación..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isPending && <Loader2 className="animate-spin" size={18} />}
              {isPending ? 'Guardando...' : 'Guardar y Alertar si aplica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
