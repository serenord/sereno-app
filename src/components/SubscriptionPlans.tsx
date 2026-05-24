import React from 'react';
import { Check, ShieldCheck, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import styles from './SubscriptionPlans.module.css';

const PLANS = [
  {
    id: 'esencial',
    name: 'PLAN ESENCIAL',
    tagline: 'La base para tu tranquilidad diaria.',
    price: '19.99',
    features: [
      'Gestión de compra y envío de medicamentos 1 vez al mes (con descuentos en farmacias de la red)',
      'Recordatorios de toma de medicamentos vía WhatsApp o llamada directa al paciente',
      'Foto de evidencia con timestamp: medicamento en manos del familiar',
      'Reporte de gestiones al emisor en menos de 24 horas',
    ],
    note: '*Personal (enfermería, transporte, especialistas) disponible por tarifario adicional. Análisis: verificamos cobertura ARS primero. Factura de costo real siempre incluida.*',
    cta: 'Elegir Esencial',
    highlight: false
  },
  {
    id: 'vital',
    name: 'PLAN VITAL',
    tagline: 'Cuidado proactivo para quienes más importan.',
    price: '39.99',
    features: [
      'Todo lo del Plan Esencial',
      'Compra y gestión de medicamentos 2 veces al mes',
      '1 toma de signos vitales a domicilio por mes (presión, glucosa, peso, oximetría)',
      'Monitoreo Bluetooth (tensión y oxígeno) 2 veces al mes — con equipos propios SERENO',
      'Alertas críticas inmediatas al emisor si hay valores fuera de rango',
      'Descuentos exclusivos en farmacias de la red',
      'Gestión de citas médicas (priorizando cobertura ARS del familiar)',
      'Manejo de cuidado básico del paciente + asesoría completa al emisor',
      '1 consulta de Telemedicina al mes (medicina general o psicología)',
    ],
    note: '*Personal y transporte disponible por tarifario. Cargo adicional si el especialista requiere desplazamiento fuera de zona (fase inicial). Análisis: verificamos ARS antes de cotizar.*',
    cta: 'Proteger a mi familia',
    highlight: true
  },
  {
    id: 'concierge',
    name: 'PLAN CONCIERGE',
    tagline: 'Cuidado premium sin límites. Toda la gestión, en manos de SERENO.',
    price: '64.99',
    features: [
      'Todo lo del Plan Vital',
      'Toda la gestión incluida: análisis, citas, coordinación ARS, medicamentos, seguimiento',
      'Gestión de acompañante físico a citas médicas + resumen profesional post-consulta',
      'Kit de equipos Bluetooth en préstamo en el hogar del familiar (tensiómetro + glucómetro — inventario SERENO)',
      'Telemedicina ilimitada 24/7 (medicina general y psicología)',
      'Gestión prioritaria de emergencias y ambulancias con seguimiento activo del equipo SERENO',
    ],
    note: '*Honorarios de personal (enfermería, transporte, especialistas) siempre por tarifario con factura de costo real. SERENO gestiona todo; los honorarios de terceros son transparentes.*',
    cta: 'Cuidado Premium Total',
    highlight: false
  }
];

export const SubscriptionPlans = () => {
  return (
      <section className={styles.plans} id="plans">
        <div className="container">
          <div className={styles.header}>
            <span className={styles.badge}>Suscripción Salud como Servicio (HaaS)</span>
            <h2>Asegura su bienestar con un <br /><span className="text-gradient">Plan de Paz Mental</span></h2>
            <p>Sin contratos de permanencia. Cancela cuando quieras. Tu primer reporte va por nuestra cuenta.</p>
          </div>
          
          <div className={styles.grid}>
            {PLANS.map((plan, idx) => (
              <div key={idx} className={`${styles.card} ${plan.highlight ? styles.highlight : ''}`}>
                {plan.highlight && <div className={styles.popular}>MÁS RECOMENDADO</div>}
                <div className={styles.cardHeader}>
                  <h3>{plan.name}</h3>
                  <p className={styles.tagline}>{plan.tagline}</p>
                  <div className={styles.price}>
                    <span className={styles.currency}>$</span>
                    <span className={styles.amount}>{plan.price}</span>
                    <span className={styles.period}>USD/mes</span>
                  </div>
                </div>
                
                <ul className={styles.features}>
                  {plan.features.map((feat, i) => (
                    <li key={i}>
                      <Check size={18} className={styles.checkIcon} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <p className={styles.planNote}>{plan.note}</p>
                
                <div className={styles.footer} style={{ minHeight: '55px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
                  <Link href={`/auth/signup?plan=${plan.id}`} className={styles.ctaButton} style={{ display: 'block', textAlign: 'center', background: plan.highlight ? '#10b981' : '#0f172a', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.paymentMethods}>
             💳 Pagos seguros vía Tarjeta · Western Union · Transferencia bancaria
          </div>
        </div>
      </section>
  );
};
