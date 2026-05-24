'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, ShieldAlert } from 'lucide-react'
import { createEmisorAction } from '@/app/admin/actions'

export default function NewEmisorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      await createEmisorAction(formData)
      router.push('/admin/users')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error desconocido creando el usuario.')
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingBottom: '3rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/users" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Volver
        </Link>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a' }}>
          <UserPlus color="#3b82f6" /> Nuevo Emisor
        </h1>
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem', display: 'flex', gap: '0.75rem', color: '#1e40af' }}>
          <ShieldAlert size={20} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            <strong>Permiso Administrativo:</strong> Crear un usuario desde aquí omite la validación de correo y genera la cuenta activa instantáneamente.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="full_name" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Nombre Completo *</label>
            <input 
              id="full_name" 
              name="full_name" 
              type="text" 
              required 
              placeholder="Ej: Juan Pérez"
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Correo Electrónico *</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              placeholder="ejemplo@correo.com"
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="phone" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Teléfono</label>
            <input 
              id="phone" 
              name="phone" 
              type="tel" 
              placeholder="+1 809 123 4567"
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Contraseña Temporal *</label>
            <input 
              id="password" 
              name="password" 
              type="text" 
              required 
              placeholder="Min. 6 caracteres"
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <Link href="/admin/users" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', color: '#475569', background: '#f1f5f9', textDecoration: 'none', fontWeight: 600 }}>
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '0.75rem 1.5rem', borderRadius: '0.5rem', color: 'white', background: '#3b82f6', border: 'none', fontWeight: 600,
                opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creando Usuario...' : 'Crear Emisor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
