'use client'

import { useState, useTransition } from 'react'
import { completeServiceAction } from './actions'
import { Loader2, X, MapPin, Camera } from 'lucide-react'
// Removed client side supabase to enforce Server Action bypassing RLS

interface CompleteServiceModalProps {
  serviceId: string
  serviceName: string
  onClose: () => void
}

export function CompleteServiceModal({ serviceId, serviceName, onClose }: CompleteServiceModalProps) {
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por tu navegador")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      () => {
        alert("No se pudo obtener la ubicación.")
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('serviceId', serviceId);
        formData.append('notes', notes);
        if (gpsLocation) formData.append('gpsLocation', JSON.stringify(gpsLocation));
        
        for (const file of files) {
          formData.append('files', file);
        }

        await completeServiceAction(formData)
        onClose()
      } catch (error: any) {
        alert("Error: " + error.message)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Finalizar Servicio</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Verificando ejecución de: <span className="font-semibold text-gray-800">{serviceName}</span>
            </p>
          </div>

          {/* Fotos de Evidencia */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fotos de Evidencia</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition">
              <div className="space-y-1 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Subir archivos</span>
                    <input id="file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={(e) => {
                      if(e.target.files) setFiles(Array.from(e.target.files))
                    }} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">{files.length} archivo(s) seleccionado(s)</p>
              </div>
            </div>
          </div>

          {/* GPS Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación (GPS)</label>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={handleCaptureGPS}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
              >
                <MapPin size={16} /> {gpsLocation ? 'Ubicación Capturada' : 'Capturar Ubicación'}
              </button>
              {gpsLocation && (
                <span className="text-xs text-green-600 font-medium">✓ Registrado</span>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notas del Proveedor/Enfermero</label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej. Medicamento entregado sin novedades al paciente."
            />
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="animate-spin" size={16} />}
              {isPending ? 'Finalizando...' : 'Finalizar y Verificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
