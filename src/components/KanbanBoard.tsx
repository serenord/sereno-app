'use client'

import { useState } from 'react'
import { Clock, DollarSign, CheckCircle, ShieldCheck } from 'lucide-react'

// Definimos los 4 estados principales del sistema Kanban
const COLUMNS = [
  { id: 'pendiente', label: 'Pendiente', icon: Clock, color: 'border-slate-200 bg-slate-50' },
  { id: 'cotizado', label: 'Cotizado', icon: DollarSign, color: 'border-blue-200 bg-blue-50' },
  { id: 'aprobado', label: 'Aprobado', icon: CheckCircle, color: 'border-emerald-200 bg-emerald-50' },
  { id: 'verificado', label: 'Verificado', icon: ShieldCheck, color: 'border-purple-200 bg-purple-50' }
]

export default function KanbanBoard({ initialTickets }: { initialTickets: any[] }) {
  // En una versión más avanzada se usaría DnD (Drag and Drop), 
  // por ahora agrupamos los tickets por status para visualización y gestión.
  const [tickets, setTickets] = useState(initialTickets)

  const getTicketsByStatus = (statusId: string) => {
    // Manejamos alias para que encaje en las 4 columnas
    return tickets.filter(t => {
      if (statusId === 'pendiente') return ['pendiente', 'esperando_informacion'].includes(t.status)
      if (statusId === 'cotizado') return ['cotizado', 'esperando_aprobacion'].includes(t.status)
      if (statusId === 'aprobado') return ['aprobado', 'en_ejecucion'].includes(t.status)
      if (statusId === 'verificado') return ['verificado', 'completado'].includes(t.status)
      return false
    })
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 pt-4 h-full">
      {COLUMNS.map((col) => {
        const colTickets = getTicketsByStatus(col.id)
        const Icon = col.icon

        return (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
            {/* Cabecera Columna */}
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${col.color}`}>
              <Icon size={18} className="text-slate-700" />
              <h3 className="font-semibold text-slate-800 uppercase tracking-wide text-sm">{col.label}</h3>
              <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                {colTickets.length}
              </span>
            </div>

            {/* Lista de Tickets */}
            <div className="flex-1 flex flex-col gap-3 min-h-[200px] rounded-xl bg-slate-50/50 p-2 border border-dashed border-slate-200">
              {colTickets.length === 0 ? (
                <div className="text-center text-slate-400 text-sm mt-8 italic">Vacio</div>
              ) : (
                colTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {ticket.service_type.replace('_', ' ')}
                      </span>
                      {ticket.priority === 'emergencia' && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">SOS</span>
                      )}
                    </div>
                    <p className="text-slate-800 font-medium text-sm mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      {/* Asumiendo que el JOIN de Supabase trae el nombre */}
                      <span className="font-semibold truncate max-w-[120px]">{ticket.beneficiaries?.full_name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
