'use client'

import { useState, useTransition } from 'react'
import { ClipboardList, Plus, Loader2 } from 'lucide-react'
import { createServiceTicket } from '../../actions'

export default function BeneficiaryServices({ beneficiaryId }: { beneficiaryId: string }) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  
  const [serviceType, setServiceType] = useState('visita_enfermeria')
  const [description, setDescription] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await createServiceTicket({
          beneficiaryId,
          serviceType,
          description
        })
        setIsOpen(false)
        setDescription('')
        alert('Ticket creado y enviado al Kanban exitosamente')
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="text-blue-500" size={18} /> Historial de Servicios
        </h3>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition text-sm font-medium flex items-center gap-1"
        >
          <Plus size={16} /> Crear Ticket
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleCreate} className="p-6 bg-slate-50 border-b border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Tipo de Servicio</label>
              <select 
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="visita_enfermeria">Visita de Enfermería</option>
                <option value="entrega_medicamentos">Entrega de Medicamentos</option>
                <option value="toma_muestras">Toma de Muestras</option>
                <option value="curacion_heridas">Curación de Heridas</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 mb-1 block">Descripción del Requerimiento</label>
              <textarea 
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detalles sobre lo que se necesita hacer..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button 
              disabled={isPending}
              type="submit" 
              className="bg-blue-600 text-white font-bold text-sm px-6 py-2 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Crear y Enviar a Kanban'}
            </button>
          </div>
        </form>
      )}

      <div className="p-12 text-center text-sm text-slate-400 flex flex-col items-center gap-3">
        <ClipboardList size={32} className="text-slate-300" />
        <div>
          <p>Los tickets creados aquí viajan directamente a la vista del Kanban.</p>
          <p className="text-xs mt-1">Podrás gestionar el flujo operativo desde /admin/services.</p>
        </div>
      </div>
    </div>
  )
}
