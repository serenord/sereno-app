import { createClient } from '@/utils/supabase/server'
import { ArrowLeft, Users, Shield, Calendar, Mail, CheckCircle2, XCircle, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EmisorActionsClient from './EmisorActionsClient'
import LinkBeneficiaryAdmin from './LinkBeneficiaryAdmin'

export default async function EmisorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()

  // 1. Obtener datos del Emisor
  const { data: emisor } = await supabase
    .from('users')
    .select('*, subscriptions(*)')
    .eq('id', id)
    .single()

  if (!emisor) return notFound()

  // 2. Obtener Beneficiarios vinculados a este emisor
  const { data: beneficiaries } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('emisor_id', id)

  // 3. Obtener Beneficiarios NO vinculados (para poder enlazarlos)
  const { data: unlinkedBeneficiaries } = await supabase
    .from('beneficiaries')
    .select('id, full_name, government_id')
    .is('emisor_id', null)

  const shortId = `EMI-${emisor.id.split('-')[0].toUpperCase()}`;
  const sub = Array.isArray(emisor.subscriptions) ? emisor.subscriptions[0] : emisor.subscriptions;
  const planStatus = sub?.status || 'sin_plan';
  const isActive = planStatus === 'activo';
  const planType = sub?.plan_tier || 'Ninguno';

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/users" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Volver a Emisores
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Columna Izquierda: Datos y Beneficiarios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Header Emisor */}
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.3rem 0.75rem', borderRadius: '4px', letterSpacing: '0.05em', display: 'inline-block', marginBottom: '1rem' }}>
                {shortId}
              </span>
              <h1 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '2rem' }}>{emisor.full_name || 'Sin nombre'}</h1>
              <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={16} /> Registrado el {new Date(emisor.created_at).toLocaleDateString('es-DO')}</span>
              </div>
            </div>
            
            <div style={{ textAlign: 'right', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem' }}>Estatus de Suscripción</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', fontWeight: 'bold', color: isActive ? '#047857' : '#64748b', marginBottom: '0.25rem' }}>
                {isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {planStatus.replace('_', ' ').toUpperCase()}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#0f172a', textTransform: 'capitalize', fontWeight: 600 }}>Plan {planType}</div>
            </div>
          </div>

          {/* Beneficiarios Vinculados */}
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <Users size={18} color="#10b981" /> Pacientes (Beneficiarios) Vinculados
            </h3>
            {!beneficiaries || beneficiaries.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Este emisor no tiene familiares registrados aún.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {beneficiaries.map((b: any) => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '0.5rem', background: '#f8fafc' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>{b.full_name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Relación: {b.relationship} | Ciudad: {b.city}</div>
                    </div>
                    <Link href={`/admin/patients/${b.id}`} style={{ background: '#e2e8f0', color: '#334155', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Ver Perfil
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Módulo de Vinculación Manual */}
          <LinkBeneficiaryAdmin emisorId={emisor.id} unlinkedBeneficiaries={unlinkedBeneficiaries || []} />

        </div>

        {/* Columna Derecha: Sidebar (Acciones) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <EmisorActionsClient emisorId={emisor.id} currentPlan={planType} />
          
          <div style={{ background: '#fffbeb', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #fde68a' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontSize: '1rem' }}>
              <CreditCard size={16} /> Pagos Automáticos
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5 }}>
              Actualmente los pagos recurrentes se gestionan vía Stripe/PayPal externamente. El estatus aquí debe reflejar si el pago mensual entró correctamente.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
