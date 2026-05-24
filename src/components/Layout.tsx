'use client';
import React from 'react';

import { useLanguage } from '../i18n/LanguageContext';

export const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      padding: '1rem 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.05em' }}>
          SERENO
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: '1rem', fontWeight: 700, fontSize: '0.9rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <a href="#plans" className="hide-mobile">{t('nav.plans')}</a>
          <a href="#how-it-works" className="hide-mobile">{t('nav.howItWorks')}</a>
          <a href="https://blog.serenoapp.org/blog/" target="_blank" rel="noopener noreferrer" className="hide-mobile">{t('nav.blog')}</a>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '0.5rem', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '2rem', border: '1px solid #e2e8f0' }}>
            <button 
              onClick={() => setLanguage('es')} 
              style={{ background: language === 'es' ? '#10b981' : 'transparent', color: language === 'es' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 800, transition: 'all 0.2s' }}
              title="Español"
            >
              ES
            </button>
            <button 
              onClick={() => setLanguage('en')} 
              style={{ background: language === 'en' ? '#3b82f6' : 'transparent', color: language === 'en' ? 'white' : '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 800, transition: 'all 0.2s' }}
              title="English"
            >
              EN
            </button>
          </div>

          <a href="#waitlist" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Empezar Hoy</a>
        </div>
      </div>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer style={{ padding: '6rem 0', background: '#0F172A', color: 'white' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '2.5rem' }}>SERENO</h2>
            <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>
              Salud como Servicio para la diáspora Dominicana. Paz mental directa a tu familia.
            </p>
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: '#10b981', marginBottom: '1rem' }}>Recursos</h4>
            <p style={{ marginBottom: '0.5rem' }}><a href="https://blog.serenoapp.org/blog/" target="_blank" rel="noopener noreferrer">Blog SERENO</a></p>
            <p style={{ marginBottom: '0.5rem' }}><a href="#how-it-works">Cómo funciona</a></p>
            <p><a href="#plans">Nuestros planes</a></p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: '#10b981', marginBottom: '1rem' }}>Contacto</h4>
            <p style={{ marginBottom: '0.5rem' }}>📧 <a href="mailto:info@serenoapp.org">info@serenoapp.org</a></p>
            <p>📱 <a href="https://wa.me/18292847990?text=Saludos%20Sereno%2C%20estoy%20interesado%20en%20los%20planes%20para%20mi%20familiar" target="_blank">+1 (829) 284-7990</a></p>
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: '#10b981', marginBottom: '1rem' }}>Legal</h4>
            <p style={{ marginBottom: '0.5rem' }}><a href="#">Términos de Servicio</a></p>
            <p><a href="#">Privacidad</a></p>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', fontSize: '0.85rem', opacity: 0.4, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
          <p style={{ marginBottom: '1rem' }}>© 2026 SERENO Health Tech. Hecho con ❤️ para RD.</p>
          <p style={{ maxWidth: '800px', margin: '0 auto' }}>
            Operamos bajo los lineamientos de la Ley 42-01 de Salud Pública de la República Dominicana. SERENO es un gestor logístico de salud, no un prestador médico directo.
          </p>
        </div>
      </div>
    </footer>
  );
};
