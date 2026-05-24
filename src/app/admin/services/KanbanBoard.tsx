'use client'

import { useState } from 'react'
import { QuoteModal } from './QuoteModal'
import { CompleteServiceModal } from './CompleteServiceModal'
import { FileText, Play, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'

interface ServiceRequest {
  id: string
  service_type: string
  status: string
  created_at?: string
  requested_at?: string
  scheduled_for?: string
  beneficiaries: {
    full_name: string
  } | {
    full_name: string
  }[] | null
}

interface KanbanBoardProps {
  services: ServiceRequest[]
}

export function KanbanBoard({ services }: KanbanBoardProps) {
  const [selectedQuoteService, setSelectedQuoteService] = useState<ServiceRequest | null>(null)
  const [selectedCompleteService, setSelectedCompleteService] = useState<ServiceRequest | null>(null)

  const getBeneficiaryName = (service: ServiceRequest | null) => {
    if (!service) return 'tu beneficiario';
    const ben = service.beneficiaries;
    return Array.isArray(ben) ? ben[0]?.full_name : ben?.full_name || 'tu beneficiario';
  };

  // Map to 4 logical columns
  const cols = {
    pendiente: services.filter(s => ['pendiente', 'en_revision'].includes(s.status)),
    cotizado: services.filter(s => ['cotizado', 'esperando_aprobacion'].includes(s.status)),
    aprobado: services.filter(s => ['aprobado', 'en_ejecucion'].includes(s.status)),
    completado: services.filter(s => ['completado', 'verificado'].includes(s.status))
  }

  const renderCard = (service: ServiceRequest, actionButton?: React.ReactNode) => {
    const rawDate = service.created_at || service.requested_at;
    const formattedCreatedDate = rawDate 
      ? new Date(rawDate).toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })
      : 'Sin fecha';
    const beneficiaryName = getBeneficiaryName(service);

    return (
      <div key={service.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium capitalize font-sans">
            {service.service_type.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-500">
            {formattedCreatedDate}
          </span>
        </div>
        <h4 className="font-semibold text-gray-900 mt-2">{beneficiaryName}</h4>
        
        {service.scheduled_for && (
          <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md mt-1.5 w-fit font-medium">
            <Calendar size={13} />
            <span>Prog: {new Date(service.scheduled_for + 'T00:00:00').toLocaleDateString('es-DO', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        )}

        <p className="text-xs text-gray-500 mb-4 mt-2">Status: <span className="font-medium capitalize">{service.status.replace('_', ' ')}</span></p>
        
        {actionButton && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {actionButton}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Columna: Pendiente */}
        <div className="bg-slate-50 rounded-xl p-4 min-h-[500px]">
          <div className="flex items-center mb-4">
            <AlertCircle size={18} className="text-orange-500 mr-2" />
            <h3 className="font-bold text-gray-700 font-sans">Pendiente</h3>
            <span className="ml-auto bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{cols.pendiente.length}</span>
          </div>
          {cols.pendiente.map(s => renderCard(s, (
            <button 
              onClick={() => setSelectedQuoteService(s)}
              className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Cotizar
            </button>
          )))}
        </div>

        {/* Columna: Cotizado */}
        <div className="bg-slate-50 rounded-xl p-4 min-h-[500px]">
          <div className="flex items-center mb-4">
            <FileText size={18} className="text-blue-500 mr-2" />
            <h3 className="font-bold text-gray-700 font-sans">Cotizado</h3>
            <span className="ml-auto bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{cols.cotizado.length}</span>
          </div>
          {cols.cotizado.map(s => renderCard(s, (
            <span className="text-xs text-gray-500 block text-center italic">
              Esperando aprobación del Emisor
            </span>
          )))}
        </div>

        {/* Columna: Aprobado / En Ejecución */}
        <div className="bg-slate-50 rounded-xl p-4 min-h-[500px]">
          <div className="flex items-center mb-4">
            <Play size={18} className="text-purple-500 mr-2" />
            <h3 className="font-bold text-gray-700 font-sans">Aprobado / Ejecución</h3>
            <span className="ml-auto bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{cols.aprobado.length}</span>
          </div>
          {cols.aprobado.map(s => renderCard(s, (
            <button 
              onClick={() => setSelectedCompleteService(s)}
              className="w-full bg-purple-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Finalizar Servicio
            </button>
          )))}
        </div>

        {/* Columna: Completado */}
        <div className="bg-slate-50 rounded-xl p-4 min-h-[500px]">
          <div className="flex items-center mb-4">
            <CheckCircle2 size={18} className="text-green-500 mr-2" />
            <h3 className="font-bold text-gray-700 font-sans">Completado</h3>
            <span className="ml-auto bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{cols.completado.length}</span>
          </div>
          {cols.completado.map(s => renderCard(s))}
        </div>

      </div>

      {selectedQuoteService && (
        <QuoteModal
          serviceId={selectedQuoteService.id}
          serviceName={`${selectedQuoteService.service_type.replace('_', ' ')} para ${getBeneficiaryName(selectedQuoteService)}`}
          onClose={() => setSelectedQuoteService(null)}
        />
      )}

      {selectedCompleteService && (
        <CompleteServiceModal
          serviceId={selectedCompleteService.id}
          serviceName={`${selectedCompleteService.service_type.replace('_', ' ')} para ${getBeneficiaryName(selectedCompleteService)}`}
          onClose={() => setSelectedCompleteService(null)}
        />
      )}
    </>
  )
}
