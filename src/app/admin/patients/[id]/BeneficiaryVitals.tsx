import { supabaseAdmin } from '@/utils/supabase/admin'
import { Activity } from 'lucide-react'

export default async function BeneficiaryVitals({ beneficiaryId }: { beneficiaryId: string }) {
  const { data: vitals, error } = await supabaseAdmin
    .from('vital_signs')
    .select('*')
    .eq('beneficiary_id', beneficiaryId)
    .order('recorded_at', { ascending: false })
    .limit(5)

  if (error) {
    return <div className="text-red-500 text-sm">Error cargando signos vitales</div>
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Activity className="text-blue-500" size={18} /> Telemetría Reciente
        </h3>
      </div>
      <div className="p-0">
        {!vitals || vitals.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400 italic">No hay registros recientes.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {vitals.map(v => (
              <div key={v.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                <div>
                  <span className="font-semibold text-slate-700 capitalize">{(v.type || v.measurement_type || '').replace('_', ' ')}</span>
                  <p className="text-xs text-slate-400 mt-1">{new Date(v.recorded_at).toLocaleString()}</p>
                </div>
                <div className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  {v.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
