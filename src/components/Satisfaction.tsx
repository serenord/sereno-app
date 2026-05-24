import React from 'react';
import styles from './Satisfaction.module.css';

export const Satisfaction = () => {
  return (
    <section className={styles.satisfaction}>
      <div className="container">
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.content}>
            <h2>Cada día sin SERENO es un día <br /><span className="text-gradient">sin saber cómo está tu familia.</span></h2>
            <p>
              No más transferencias a ciegas. No más llamadas del domingo preguntando si tomaron los medicamentos. SERENO cierra ese loop. Tú pagas, nosotros verificamos, tú descansas.
            </p>
            <div className={styles.actions}>
              <a href="#waitlist" className="btn-primary">
                Empezar a cuidar a mi familia hoy
              </a>
              <a href="https://wa.me/18292847990?text=Saludos%20Sereno%2C%20estoy%20interesado%20en%20los%20planes%20para%20mi%20familiar" target="_blank" className={styles.waLink}>
                ¿Tienes preguntas? Escríbenos por WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
