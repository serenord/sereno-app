import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ServicesClient from './ServicesClient'

export const revalidate = 0;

export default async function ServicesPage() {
  const supabase = await createClient()

  // 1. Obtener la sesión activa
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // 2. Traer todos los beneficiarios del emisor para el Dropdown
  const { data: beneficiaries } = await supabase
    .from("beneficiaries")
    .select("id, full_name")
    .eq("emisor_id", session.user.id)

  if (!beneficiaries || beneficiaries.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 min-h-screen bg-slate-950">
        <h2>Debes agregar un paciente primero antes de solicitar servicios.</h2>
      </div>
    )
  }

  // 3. Traer los servicios activos e inactivos de este emisor
  const { data: services } = await supabase
    .from("services_requests")
    .select("*")
    .eq("emisor_id", session.user.id)
    .order("created_at", { ascending: false })

  return (
    <ServicesClient 
      services={services || []} 
      beneficiaries={beneficiaries} 
      emisorId={session.user.id} 
    />
  )
}
