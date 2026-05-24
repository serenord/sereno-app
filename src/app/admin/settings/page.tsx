import { Settings, ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function AdminSettingsPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Volver al Panel
        </Link>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings color="#64748b" /> Configuración SERENO
        </h1>
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '50%' }}>
            <ShieldCheck size={32} color="#0f172a" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>Modo Concierge Activo (Fase 1)</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Todas las configuraciones y operaciones están centralizadas en el panel general.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#0f172a' }}>Integraciones Activas</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 500 }}>Motor Anti-Olvido (Cron)</span>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.8rem' }}>CONECTADO</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 500 }}>Notificaciones de Paz Mental</span>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.8rem' }}>CONECTADO</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: 500 }}>Pasarela de Pago (PayPal)</span>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.8rem' }}>ACTIVA</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#0f172a' }}>Políticas de Precios (Auditoría ARS)</h3>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#991b1b', fontSize: '0.9rem' }}>Recordatorio Operativo</p>
              <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.85rem', lineHeight: '1.5' }}>
                En el modelo Concierge actual, las compras recurrentes y las nuevas recetas se gestionan manualmente en el panel principal utilizando el botón de "Consumir Consulta". Asegúrate de auditar con las farmacias locales antes de someter el cargo al Emisor extranjero.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
