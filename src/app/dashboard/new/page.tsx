'use client';

import React from 'react';
import { PrescriptionUpload } from '@/components/PrescriptionUpload';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewRequestPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/dashboard" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        color: 'var(--sereno-gray)',
        marginBottom: '2rem',
        fontWeight: 600
      }}>
        <ArrowLeft size={18} />
        Volver al Dashboard
      </Link>
      
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Nueva Solicitud</h2>
        <p style={{ color: 'var(--sereno-gray)' }}>
          Envía medicamentos o solicita análisis para tus familiares en RD.
        </p>
      </div>
      
      <PrescriptionUpload />
      
      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Análisis de Laboratorio</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--sereno-gray)' }}>
            Agenda una toma de muestra a domicilio sin receta previa.
          </p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Consulta Médica</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--sereno-gray)' }}>
            Telemedicina o visita presencial con especialistas.
          </p>
        </div>
      </div>
    </div>
  );
}
