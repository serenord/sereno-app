'use client'

import { useTransition, useState } from 'react'
import { approveCopayAction } from './actions'
import { Loader2, FileText, CheckCircle2, Clock, MapPin, X } from 'lucide-react'

interface ServiceHistoryFeedProps {
  services: any[]
  subscriptionId: string
  emisorPhone?: string
}

export function ServiceHistoryFeed({ services, subscriptionId, emisorPhone }: ServiceHistoryFeedProps) {
  const [isPending, startTransition] = useTransition()

  const [showConfirm, setShowConfirm] = useState<{id: string, copay: number} | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [evidenceService, setEvidenceService] = useState<any | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4000)
  }

  const handleApproveAndPay = () => {
    if (!showConfirm) return;
    
    startTransition(async () => {
      try {
        await approveCopayAction(showConfirm.id, showConfirm.copay, subscriptionId)
        
        showToast("¡Pago procesado con éxito!")
        setShowConfirm(null)

        // WhatsApp redirect para notificar que pagó
        const phoneSuffix = emisorPhone ? ` (Teléfono del Emisor: ${emisorPhone})` : '';
        const waMsg = encodeURIComponent(`Hola SERENO, acabo de autorizar el pago de $${showConfirm.copay} USD para mi servicio con ID: ${showConfirm.id}${phoneSuffix}.`)
        window.open(`https://wa.me/18292847990?text=${waMsg}`, '_blank')

      } catch (error: any) {
        alert("Error procesando pago: " + error.message)
      }
    })
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
      case 'en_revision':
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><Clock size={12} /> Revisando</span>
      case 'en_ejecucion':
        return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">En Ejecución</span>
      case 'verificado':
      case 'completado':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Completado</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium capitalize">{status.replace('_', ' ')}</span>
    }
  }

  if (!services || services.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
        <p>No tienes servicios solicitados aún.</p>
        <p className="text-sm mt-1">Haz clic en "Solicitar Servicio" para comenzar.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Historial de Servicios</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {services.map((service) => (
          <div key={service.id} className="p-6 hover:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900 capitalize">{service.service_type.replace('_', ' ')}</span>
                {renderStatusBadge(service.status)}
              </div>
              <span className="text-sm text-gray-400">
                {(() => {
                  const rawDate = service.created_at || service.requested_at;
                  if (!rawDate) return 'Sin fecha';
                  const d = new Date(rawDate);
                  return isNaN(d.getTime()) ? 'Sin fecha' : d.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
                })()}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{service.description}</p>

            {service.scheduled_for && (
              <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg mt-1 mb-3 w-fit font-medium">
                <Clock size={13} className="text-blue-500" />
                <span>Programado para: {new Date(service.scheduled_for + 'T00:00:00').toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            )}

            {/* Estado: Esperando Aprobación (Cotizado) */}
            {service.status === 'esperando_aprobacion' || service.status === 'cotizado' ? (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Cotización Disponible</h4>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs">Costo Total</span>
                      <span className="font-medium text-gray-900">${service.estimated_cost?.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Cobertura ARS</span>
                      <span className="font-medium text-green-600">-${service.ars_coverage?.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 block text-xs font-bold">A Pagar (Copago)</span>
                      <span className="font-bold text-blue-900 text-lg">${service.copay_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirm({ id: service.id, copay: service.copay_amount })}
                  disabled={isPending}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm hover:shadow"
                >
                  Autorizar y Método de Pago
                </button>
              </div>
            ) : null}

            {/* Estado: Verificado (Evidencia disponible) */}
            {service.status === 'verificado' && (
              <div className="mt-4 flex gap-3">
                <button 
                  onClick={() => setEvidenceService(service)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition"
                >
                  <FileText size={16} /> Ver Evidencia y Notas
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Elegant Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 right-10 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <CheckCircle2 size={20} />
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Confirm Payment Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Autorizar Pago</h3>
              <p className="text-slate-500 text-sm mb-6">
                ¿Deseas autorizar el copago de <span className="font-bold text-slate-900">${showConfirm.copay} USD</span> con tu método de pago actual? Se te redirigirá a soporte si requieres ayuda.
              </p>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleApproveAndPay}
                  disabled={isPending}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                >
                  {isPending ? <Loader2 className="animate-spin" size={18} /> : 'Sí, Autorizar Pago'}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={isPending}
                  className="w-full bg-slate-100 text-slate-600 font-medium py-3 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {evidenceService && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={20} />
                Reporte de Servicio
              </h3>
              <button onClick={() => setEvidenceService(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Notas del Profesional</h4>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 text-sm italic">
                  "{evidenceService.evidence_notes || 'No se dejaron notas.'}"
                </div>
              </div>

              {evidenceService.evidence_gps_location && (
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Ubicación Confirmada</h4>
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100 w-fit">
                    <MapPin size={16} /> Coordenadas Registradas Seguras
                  </div>
                </div>
              )}

              {evidenceService.evidence_photos && evidenceService.evidence_photos.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Evidencia Fotográfica</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {evidenceService.evidence_photos.map((photo: string, idx: number) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                        <img src={photo} alt={`Evidencia ${idx + 1}`} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button onClick={() => setEvidenceService(null)} className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-lg font-medium hover:bg-slate-100 transition-colors shadow-sm">
                 Cerrar Reporte
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
