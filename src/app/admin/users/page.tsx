import { createClient } from '@/utils/supabase/server'
import { Users, ArrowLeft, Search, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users, error } = await supabase
    .from('users')
    .select('*, subscriptions(*)')
    .eq('role', 'emisor')
    .order('created_at', { ascending: false })
    
  if (error) console.error("Error fetching users:", error);

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Volver
          </Link>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
            <Users color="#2563eb" /> Emisores Diáspora
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Buscar ID o nombre..." style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
          <Link href="/admin/users/new" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            + Nuevo Emisor
          </Link>
        </div>
      </div>

      {!users || users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b' }}>No hay emisores registrados en el sistema.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {users.map(u => {
            const shortId = `EMI-${u.id.split('-')[0].toUpperCase()}`;
            const sub = Array.isArray(u.subscriptions) ? u.subscriptions[0] : u.subscriptions;
            const planStatus = sub?.status || 'sin_plan';
            const isActive = planStatus === 'activo';
            const planType = sub?.plan_tier || 'Ninguno';
            
            return (
              <Link href={`/admin/users/${u.id}`} key={u.id} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '1rem', 
                  border: '1px solid #e2e8f0', 
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px', letterSpacing: '0.05em' }}>
                        {shortId}
                      </span>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0.5rem 0 0.25rem 0' }}>{u.full_name || 'Emisor sin nombre'}</h2>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        Registro: {new Date(u.created_at).toLocaleDateString('es-DO')}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Plan Actual</span>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{planType}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 'bold', color: isActive ? '#047857' : '#64748b', backgroundColor: isActive ? '#ecfdf5' : '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '999px' }}>
                      {isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {planStatus.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
