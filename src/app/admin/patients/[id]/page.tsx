import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'
import { ArrowLeft, UserCircle } from 'lucide-react'
import BeneficiaryVitals from './BeneficiaryVitals'
import BeneficiaryCharges from './BeneficiaryCharges'
import BeneficiaryServices from './BeneficiaryServices'
import MedicationAdherence from '@/components/MedicationAdherence'

export const revalidate = 0;

export default async function PatientProfilePage({ params }: { params: { id: string } }) {
  // Fetching minimal: solo datos de identificación
  const { data: patient, error } = await supabaseAdmin
    .from('beneficiaries')
    .select('id, full_name, account_status, emisor:users(full_name, id)')
    .eq('id', params.id)
    .single()

  if (error || !patient) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold text-red-600 mb-4">Error cargando paciente</h2>
        <Link href="/admin/users" className="text-blue-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver a Emisores y Pacientes
        </Link>
      </div>
    )
  }

  const emisorData = patient.emisor as any

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {patient.full_name}
            {patient.account_status === 'activo' ? (
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Activo</span>
            ) : (
              <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Inactivo</span>
            )}
          </h2>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <UserCircle size={16} /> Emisor vinculado: {emisorData?.full_name || 'Desconocido'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div className="xl:col-span-1 flex flex-col gap-6">
          <BeneficiaryVitals beneficiaryId={patient.id} />
          <BeneficiaryCharges beneficiaryId={patient.id} />
        </div>
        <div className="xl:col-span-2 flex flex-col gap-6">
          <BeneficiaryServices beneficiaryId={patient.id} />
          <MedicationAdherence beneficiaryId={patient.id} />
        </div>
      </div>
    </div>
  )
}
