'use client'

import { useState, useTransition } from 'react'
import { DollarSign, Plus, Loader2 } from 'lucide-react'
import { addManualCharge } from '../../actions'

export default function BeneficiaryCharges({ beneficiaryId }: { beneficiaryId: string }) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  
  const [amount, setAmount] = useState('')
  const [concept, setConcept] = useState('')

  const handleCharge = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await addManualCharge(beneficiaryId, Number(amount), concept)
        setIsOpen(false)
        setAmount('')
        setConcept('')
        alert('Cargo manual registrado en payments exitosamente')
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <DollarSign className="text-emerald-500" size={18} /> Cargos Adicionales
        </h3>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-100 text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition"
        >
          <Plus size={16} />
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleCharge} className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Concepto del Cargo</label>
            <input 
              type="text" 
              required
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="Ej: Curitas extra"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Monto (USD)</label>
            <input 
              type="number" 
              required
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button 
            disabled={isPending}
            type="submit" 
            className="w-full bg-emerald-600 text-white font-bold text-sm py-2 rounded-lg hover:bg-emerald-700 transition flex justify-center items-center gap-2"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Registrar Cargo Manual'}
          </button>
        </form>
      )}

      <div className="p-6 text-center text-sm text-slate-400">
        <p>Los pagos e invoices se listarán aquí consultando la tabla payments.</p>
      </div>
    </div>
  )
}
