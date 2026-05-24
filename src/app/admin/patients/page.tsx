import { createClient } from '@/utils/supabase/server'
import { UserPlus, ArrowLeft, Activity, MapPin, Search } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0;

export default async function AdminPatientsPage() {
  const supabase = await createClient()
  const { data: patients, error } = await supabase
    .from('beneficiaries')
    .select('*, emisor:users!beneficiaries_emisor_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error("Error fetching patients:", error)
  }

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Volver
          </Link>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
            <UserPlus color="#10b981" /> Pacientes (RD)
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Buscar ID o nombre..." style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
        </div>
      </div>

      {!patients || patients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b' }}>No hay pacientes registrados en el sistema.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {patients.map(p => {
            const shortId = `PAC-${p.id.split('-')[0].toUpperCase()}`;
            
            return (
              <Link href={`/admin/patients/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
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
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981', backgroundColor: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '4px', letterSpacing: '0.05em' }}>
                        {shortId}
                      </span>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0.5rem 0 0.25rem 0' }}>{p.full_name}</h2>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {p.city || 'Ubicación pendiente'}
                      </div>
                    </div>
                    {p.is_in_crisis && (
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 0 4px #fee2e2' }} title="Crisis Activa" />
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 'bold' }}>Emisor Vinculado</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#334155', fontWeight: 500, fontSize: '0.9rem' }}>{p.emisor?.full_name || 'Desconocido'}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {p.relationship?.toUpperCase() || 'FAMILIAR'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={14} color="#3b82f6" />
                      Plan {p.current_plan_tier ? p.current_plan_tier.charAt(0).toUpperCase() + p.current_plan_tier.slice(1) : 'Vital'}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#047857' }}>
                      {p.consultations_rolled_over || 0} Rollover
                    </span>
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
