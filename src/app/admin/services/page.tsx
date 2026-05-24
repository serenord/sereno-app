import { supabaseAdmin } from '@/utils/supabase/admin'
import { KanbanBoard } from './KanbanBoard'

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  // Fetch active service requests joined with beneficiaries
  const { data: services, error } = await supabaseAdmin
    .from('service_requests')
    .select(`
      id,
      service_type,
      status,
      created_at,
      scheduled_for,
      beneficiaries(full_name)
    `)
    .not('status', 'eq', 'cancelado')
    .not('status', 'eq', 'rechazado')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching services:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Servicios (Kanban)</h1>
        <p className="text-gray-500 mt-1">Cotiza y supervisa las solicitudes de los beneficiarios en tiempo real.</p>
      </div>

      <div className="mt-8">
        <KanbanBoard services={services || []} />
      </div>
    </div>
  )
}
