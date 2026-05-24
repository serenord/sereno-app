import React, { useState } from 'react';
import styles from './Simulator.module.css';

const SERVICES = [
  { id: 'blood', name: 'Análisis de sangre a domicilio', price: 45 },
  { id: 'peds', name: 'Consulta pediátrica (Online/Casa)', price: 60 },
  { id: 'meds', name: 'Gestión y envío de medicamentos', price: 25 },
  { id: 'ekg', name: 'Electrocardiograma preventivo', price: 80 },
];

export const Simulator = () => {
  const [selected, setSelected] = useState(SERVICES[0]);

  return (
    <section className={styles.simulator} id="simulator">
      <div className="container">
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.header}>
            <h2>Calculadora de Tranquilidad</h2>
            <p>Selecciona un servicio para ver el costo estimado de gestión directa.</p>
          </div>
          
          <div className={styles.content}>
            <div className={styles.inputGroup}>
              <label>Servicio Requerido</label>
              <select 
                className={styles.select}
                value={selected.id}
                onChange={(e) => {
                  const s = SERVICES.find(x => x.id === e.target.value);
                  if (s) setSelected(s);
                }}
              >
                {SERVICES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.result}>
              <span className={styles.label}>Costo Estimado</span>
              <div className={styles.price}>
                <span className={styles.currency}>USD</span>
                <span className={styles.amount}>${selected.price}</span>
              </div>
              <p className={styles.info}>*Incluye logística y reporte digital inmediato.</p>
            </div>
          </div>
          
          <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
            Solicitar Pre-Registro
          </button>
        </div>
      </div>
    </section>
  );
};
