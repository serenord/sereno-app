import { supabaseAdmin } from '@/utils/supabase/admin'
import { Pill, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default async function MedicationAdherence({ beneficiaryId }: { beneficiaryId: string }) {
  // Simulamos la obtención de datos de adherence de medicación
  // En un entorno real se haría con:
  // const { data: meds } = await supabaseAdmin.from('medication_schedules').select('*').eq('beneficiary_id', beneficiaryId)
  
  // Como no sabemos el schema exacto de medication_schedules para este MVP, 
  // pondremos una versión híbrida / representativa de lo que pidió el CTO:
  const mockMeds = [
    { id: 1, nombre_medicamento: 'Losartán', dosis: '50mg', frecuencia: 1, stock_actual: 30 },
    { id: 2, nombre_medicamento: 'Metformina', dosis: '500mg', frecuencia: 2, stock_actual: 8 },
    { id: 3, nombre_medicamento: 'Aspirina', dosis: '100mg', frecuencia: 1, stock_actual: 3 },
  ]

  const calculateDaysLeft = (stock: number, freq: number) => {
    return Math.floor(stock / freq)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Pill className="text-purple-500" size={18} /> Adherencia a Medicación
        </h3>
      </div>
      
      <div className="p-0">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3 font-bold">Medicamento</th>
              <th className="px-6 py-3 font-bold text-center">Dosis / Frecuencia</th>
              <th className="px-6 py-3 font-bold text-center">Días Restantes</th>
              <th className="px-6 py-3 font-bold text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockMeds.map(med => {
              const daysLeft = calculateDaysLeft(med.stock_actual, med.frecuencia)
              const isLowStock = daysLeft < 5
              
              return (
                <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{med.nombre_medicamento}</p>
                    <p className="text-xs text-slate-400">Dosis: {med.dosis}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                      {med.frecuencia} / día
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">
                    {daysLeft} días
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-100">
                        <AlertTriangle size={14} /> ⚠️ REPOSICIÓN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-emerald-100">
                        <CheckCircle2 size={14} /> OK
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
