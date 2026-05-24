import React from 'react';
import { Stethoscope, Pill, Microscope, ShieldCheck, Award } from 'lucide-react';
import styles from './Trust.module.css';

export const Trust = () => {
  return (
    <section className={styles.trust} id="trust">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.badge}>Gestión y Coordinación</span>
          <h2>Una Red de Salud <span className="text-gradient">Verificada en RD</span></h2>
          <p>SERENO funge como tu gestor logístico de confianza en República Dominicana, coordinando servicios con proveedores de salud debidamente habilitados.</p>
        </div>
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.iconBox}>
              <Stethoscope size={32} />
            </div>
            <h3>Presencia Profesional</h3>
            <p>Ofrecemos presencia constante sin las molestias del compromiso familiar. Enfermeros, técnicos de laboratorio y médicos certificados, dedicados única y exclusivamente al bienestar de tu familia.</p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.iconBox}>
              <Pill size={32} />
            </div>
            <h3>Farmacias de Red Nacional</h3>
            <p>Alianzas logísticas con las principales cadenas farmacéuticas de RD para garantizar disponibilidad y delivery. Tú pagas el precio real, nosotros negociamos el descuento.</p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.iconBox}>
              <Microscope size={32} />
            </div>
            <h3>Protegemos tu patrimonio como un buen hijo</h3>
            <p>Un familiar que recibe una remesa paga lo que le pidan en la farmacia. SERENO actúa con rigor corporativo: auditamos las facturas, exprimimos los beneficios del seguro local para que no pagues de más, y gestionamos tus fondos de manera pulcra y verificable bajo la ley 42-01.</p>
          </div>

          <div className={styles.card}>
            <div className={styles.iconBox}>
              <Award size={32} />
            </div>
            <h3>Factura Real, Siempre</h3>
            <p>Todo servicio médico o logístico de terceros incluye su factura de costo real. Transparencia total es parte de nuestra promesa. Tú ves exactamente en qué se gastó cada peso.</p>
          </div>
        </div>
        
        <div className={styles.sealBox}>
          <div className={styles.seal}>
            <ShieldCheck size={48} className={styles.sealIcon} />
            <div>
              <strong>Garantía de Entrega 24h</strong>
              <p>Gestión de medicamentos y reportes en menos de un día.</p>
            </div>
          </div>
          <div className={styles.seal}>
            <Award size={48} className={styles.sealIcon} />
            <div>
              <strong>Coordinación Transparente</strong>
              <p>Operamos estrictamente como gestores logísticos.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
