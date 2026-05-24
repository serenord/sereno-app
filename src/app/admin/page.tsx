import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'
import {
  CreditCard,
  ClipboardList,
  Users,
  Activity,
  ArrowRight
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // Fetch stats concurrently for performance
  const [
    { count: pendingPayments },
    { count: pendingTickets },
    { count: activeBeneficiaries }
  ] = await Promise.all([
    supabaseAdmin
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendiente_validacion'),
      
    supabaseAdmin
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendiente'),
      
    supabaseAdmin
      .from('beneficiaries')
      .select('*', { count: 'exact', head: true })
      .eq('account_status', 'activo')
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general de las operaciones de Sereno.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pagos Pendientes Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pagos por Validar</h3>
            <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
              <CreditCard size={24} />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900">{pendingPayments || 0}</div>
            <p className="text-sm text-gray-500 mt-1">Esperando aprobación manual</p>
          </div>
          <Link href="/admin/payments" className="mt-6 flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
            Ir a validar pagos <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Tickets Pendientes Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tickets Pendientes</h3>
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <ClipboardList size={24} />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900">{pendingTickets || 0}</div>
            <p className="text-sm text-gray-500 mt-1">Solicitudes esperando cotización</p>
          </div>
          <Link href="/admin/services" className="mt-6 flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
            Gestionar tickets <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Cuentas Activas Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Beneficiarios Activos</h3>
            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
              <Users size={24} />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900">{activeBeneficiaries || 0}</div>
            <p className="text-sm text-gray-500 mt-1">Con planes operativos</p>
          </div>
          <Link href="/admin/users" className="mt-6 flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
            Ver directorio <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
      
      {/* Actividad Reciente o Gráficos podrían ir aquí */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="flex items-center mb-4">
          <Activity className="text-gray-400 mr-2" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Estado del Sistema</h2>
        </div>
        <p className="text-sm text-gray-600">
          El sistema está monitoreando correctamente los Service Requests y Pagos.
          El panel lateral (Sidebar) de la izquierda te permite navegar por todos los módulos del Administrador.
        </p>
      </div>
    </div>
  )
}
