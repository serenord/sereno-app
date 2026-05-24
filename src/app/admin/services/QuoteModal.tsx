'use client'

import { useState, useTransition } from 'react'
import { quoteServiceRequest } from './actions'
import { Loader2, X } from 'lucide-react'

interface QuoteModalProps {
  serviceId: string
  serviceName: string
  onClose: () => void
}

export function QuoteModal({ serviceId, serviceName, onClose }: QuoteModalProps) {
  const [estimatedCost, setEstimatedCost] = useState<number | ''>('')
  const [arsCoverage, setArsCoverage] = useState<number | ''>('')
  const [isPending, startTransition] = useTransition()

  // Calcular el copago automáticamente (no puede ser menor a 0)
  const cost = Number(estimatedCost) || 0
  const coverage = Number(arsCoverage) || 0
  const copayAmount = Math.max(0, cost - coverage)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cost <= 0) {
      alert("El costo estimado debe ser mayor a 0")
      return
    }

    startTransition(async () => {
      try {
        await quoteServiceRequest(serviceId, cost, coverage, copayAmount)
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
          <h2 className="text-xl font-bold text-gray-800">Cotizar Servicio</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Cotizando: <span className="font-semibold text-gray-800">{serviceName}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Costo Estimado (Total)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || '')}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="100.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cobertura ARS (Seguro)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={arsCoverage}
                onChange={(e) => setArsCoverage(parseFloat(e.target.value) || '')}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
            <div className="flex justify-between items-center text-sm mb-1 text-gray-600">
              <span>Costo Total:</span>
              <span>${cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2 text-gray-600">
              <span>Cobertura:</span>
              <span className="text-green-600">-${coverage.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg text-blue-900 border-t border-blue-200 pt-2">
              <span>Copago del Emisor:</span>
              <span>${copayAmount.toFixed(2)}</span>
            </div>
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
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="animate-spin" size={16} />}
              {isPending ? 'Guardando...' : 'Guardar Cotización'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
