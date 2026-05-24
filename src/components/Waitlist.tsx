import React, { useState } from 'react';
import styles from './Waitlist.module.css';

export const Waitlist = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: 'Estados Unidos',
    interest: 'Medicamentos y seguimiento',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_URL = 'https://script.google.com/macros/s/AKfycbyatcf7ZAa7i8cXh4dWymtYL63Duj3mp60SrVCHcfn3A2jG-rqlxoHpR1GQPZz_OFtP/exec';
    
    // Mapeo exacto para Google Apps Script
    const payload = {
      nombre: formData.name,
      email: formData.email,
      pais: formData.country,
      plan: formData.interest,
      fuente: 'Landing Page'
    };

    console.log('🚀 SERENO Payload:', payload);
    
    try {
      // 1. Google Apps Script Mailing List
      fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 2. PHP Script for Welcome Email (Hostinger Native)
      await fetch('/api/leads.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('❌ Error submitting lead:', error);
      setSubmitted(true); 
    }
  };

  if (submitted) {
    return (
      <section className={styles.waitlist} id="waitlist">
        <div className="container">
          <div className={`glass-card ${styles.successCard}`}>
            <h2>¡Gracias por tu interés!</h2>
            <p>Te contactaremos pronto con acceso prioritario a la plataforma.</p>
            <span className={styles.successIcon}>✨</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.waitlist} id="waitlist">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.text}>
            <h2>Empieza hoy. <br /><span className="text-gradient">Tu primer reporte de salud va por nuestra cuenta.</span></h2>
            <p>Únete a la lista de espera de SERENO y obtén acceso prioritario al lanzamiento con beneficios exclusivos.</p>
            <ul className={styles.benefits}>
              <li>✅ 0% comisión en tu primer envío.</li>
              <li>✅ Reporte médico certificado RD gratuito.</li>
              <li>✅ Acceso anticipado al Dashboard.</li>
            </ul>
          </div>
          
          <div className={`glass-card ${styles.formCard}`}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej. Juan Pérez"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className={styles.field}>
                <label>Email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="juan@ejemplo.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>¿Desde dónde cuidas a tu familia?</label>
                  <select 
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                  >
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Canada">Canada</option>
                    <option value="Europa">Europa</option>
                    <option value="America">America</option>
                  </select>
                </div>
                
                <div className={styles.field}>
                  <label>¿Qué necesita tu familiar?</label>
                  <select 
                    value={formData.interest}
                    onChange={e => setFormData({...formData, interest: e.target.value})}
                  >
                    <option value="Medicamentos y seguimiento">Medicamentos y seguimiento</option>
                    <option value="Control de signos vitales (IoT)">Control de signos vitales (IoT)</option>
                    <option value="Gestión de citas médicas">Gestión de citas médicas</option>
                    <option value="Cuidado integral (todo incluido)">Cuidado integral (todo incluido)</option>
                  </select>
                </div>
              </div>

              <p className={styles.privacyNote}>🔒 Tu información está protegida. No spam, nunca.</p>
              
              <button type="submit" className="btn-primary">Asegurar mi lugar</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
