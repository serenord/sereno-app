import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BeneficiaryCard } from './BeneficiaryCard'
import { ServiceHistoryFeed } from './ServiceHistoryFeed'
import { ShieldCheck, HeartPulse } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Verificar autenticación
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    redirect('/auth/login')
  }
  const userId = authData.user.id

  console.log("🛠️ [Dashboard] Auth User ID:", userId)

  const [
    { data: subscriptionList, error: subError },
    { data: beneficiaryList, error: benError },
    { data: services, error: servError },
    { data: emisorProfile }
  ] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('emisor_id', userId).order('created_at', { ascending: false }).limit(1),
    supabase.from('beneficiaries').select('*').eq('emisor_id', userId).order('created_at', { ascending: false }).limit(1),
    supabase.from('service_requests').select('*').eq('emisor_id', userId).order('created_at', { ascending: false }),
    supabase.from('users').select('phone').eq('id', userId).maybeSingle()
  ])

  const subscription = subscriptionList?.[0] || null
  const beneficiary = beneficiaryList?.[0] || null

  console.log("🛠️ [Dashboard] Beneficiary Data:", beneficiary || "Ninguno encontrado")
  if (subError) console.error(`Error fetching subscription: [${subError.code}] ${subError.message} (Details: ${subError.details})`)
  if (benError) console.error(`Error fetching beneficiary: [${benError.code}] ${benError.message} (Details: ${benError.details})`)
  if (servError) console.error(`Error fetching services: [${servError.code}] ${servError.message} (Details: ${servError.details})`)

  // 3. Graceful Fallback (Estado Vacío)
  if (!beneficiary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <HeartPulse size={32} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Tu cuenta está casi lista</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Bienvenido. Aún estamos configurando tu perfil y conectando los datos. Si acabas de registrarte, nuestro equipo médico validará la información y se pondrá en contacto contigo muy pronto.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 font-medium mb-6">
            Recibirás una notificación cuando tu panel esté 100% activo.
          </div>
          <a 
            href="/dashboard/onboarding" 
            className="w-full inline-flex justify-center items-center py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm"
          >
            Completar Ficha de Familiar
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tu Paz Mental</h1>
          <p className="text-gray-500 mt-1">Gestiona la salud y el bienestar de tus seres queridos desde cualquier lugar.</p>
        </div>
      </div>

      {/* Tarjeta de Beneficiario */}
      <BeneficiaryCard
        beneficiaryId={beneficiary.id}
        fullName={beneficiary.full_name}
        relationship={beneficiary.relationship}
        status={beneficiary.account_status}
        planName={subscription?.plan_tier || 'Plan Pendiente'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Feed Principal de Servicios */}
        <div className="lg:col-span-2 space-y-6">
          <ServiceHistoryFeed 
            services={services || []} 
            subscriptionId={subscription?.id || ''}
            emisorPhone={emisorProfile?.phone || ''}
          />
        </div>

        {/* Sidebar del Emisor (Resumen) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Información del Seguro</h3>
            {beneficiary.has_ars ? (
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Proveedor ARS</span>
                  <p className="text-sm font-medium text-gray-900">{beneficiary.ars_provider}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Número de Póliza</span>
                  <p className="text-sm font-mono text-gray-900">{beneficiary.ars_policy_number}</p>
                </div>
                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg mt-2">
                  Tus cotizaciones aplicarán automáticamente la cobertura de tu seguro.
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No tienes seguro registrado. Los servicios se cotizarán al 100% de su valor privado.
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 text-white shadow-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" />
              Soporte Concierge
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              ¿Tienes una emergencia o necesitas un servicio que no está en la lista? Nuestro equipo médico está disponible 24/7.
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition backdrop-blur-sm border border-white/10">
              Contactar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
