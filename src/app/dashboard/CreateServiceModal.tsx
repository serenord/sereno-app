'use client'

import { useState, useTransition } from 'react'
import { createServiceRequestAction } from './actions'
import { Loader2, X } from 'lucide-react'

interface CreateServiceModalProps {
  beneficiaryId: string
  beneficiaryName: string
  onClose: () => void
}

export function CreateServiceModal({ beneficiaryId, beneficiaryName, onClose }: CreateServiceModalProps) {
  const [serviceType, setServiceType] = useState('consulta_medica')
  const [description, setDescription] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await createServiceRequestAction(beneficiaryId, serviceType, description, scheduledFor || undefined)
        onClose()
      } catch (error: any) {
        alert("Error: " + error.message)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Solicitar Servicio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <p className="text-sm text-gray-600">
              Servicio para: <span className="font-semibold text-gray-900">{beneficiaryName}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Servicio</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="consulta_medica">Consulta Médica</option>
              <option value="entrega_medicamento">Entrega de Medicamentos</option>
              <option value="analisis_laboratorio">Análisis de Laboratorio</option>
              <option value="enfermeria_domicilio">Enfermería a Domicilio</option>
              <option value="transporte_medico">Transporte Médico</option>
              <option value="equipo_iot">Equipamiento / Monitoreo</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha Programada (Opcional)</label>
            <input
              type="date"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción de la necesidad</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              placeholder="Por favor describe brevemente qué necesitas..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="animate-spin" size={18} />}
              {isPending ? 'Enviando solicitud...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
