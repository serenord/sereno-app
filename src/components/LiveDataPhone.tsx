import React, { useState, useEffect } from 'react';
import { Activity, Heart, Thermometer } from 'lucide-react';
import styles from './LiveDataPhone.module.css';

export const LiveDataPhone = () => {
  const [pulse, setPulse] = useState(72);
  const [pressure, setPressure] = useState('120/80');

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.liveData}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.text}>
            <span className={styles.badge}>Monitoreo IoT en tiempo real</span>
            <h2>Tus padres en RD, <br /><span className="text-gradient">los datos en tu mano</span></h2>
            <p>
              Con nuestra tecnología Bluetooth, recibe actualizaciones instantáneas de signos vitales. No más adivinanzas, solo datos reales y tranquilidad absoluta.
            </p>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><Heart size={20} /></div>
                <span>Ritmo cardiaco en vivo</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><Activity size={20} /></div>
                <span>Presión arterial diaria</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><Thermometer size={20} /></div>
                <span>Alertas de temperatura</span>
              </div>
            </div>
          </div>
          
          <div className={styles.phoneContainer}>
            <div className={styles.phoneFrame}>
              <div className={styles.phoneScreen}>
                <div className={styles.appHeader}>
                  <div className={styles.avatar}>MP</div>
                  <div>
                    <strong>María Pérez</strong>
                    <span>Estable • Santo Domingo</span>
                  </div>
                </div>
                
                <div className={styles.liveChart}>
                  <div className={styles.chartHeader}>
                    <Activity size={16} />
                    <span>Pulso en vivo</span>
                    <strong className={styles.pulseValue}>{pulse} BPM</strong>
                  </div>
                  <div className={styles.waveform}>
                    <div className={styles.bar} style={{ height: '30%' }}></div>
                    <div className={styles.bar} style={{ height: '50%' }}></div>
                    <div className={styles.bar} style={{ height: '80%' }}></div>
                    <div className={styles.bar} style={{ height: '40%' }}></div>
                    <div className={styles.bar} style={{ height: '60%' }}></div>
                    <div className={styles.bar} style={{ height: '90%' }}></div>
                    <div className={styles.bar} style={{ height: '40%' }}></div>
                    <div className={styles.bar} style={{ height: '20%' }}></div>
                  </div>
                </div>
                
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span>Presión</span>
                    <strong>{pressure}</strong>
                    <small>mmHg</small>
                  </div>
                  <div className={styles.statCard}>
                    <span>Oxígeno</span>
                    <strong>98%</strong>
                    <small>SpO2</small>
                  </div>
                </div>
                
                <div className={styles.alertBox}>
                  <div className={styles.alertDot}></div>
                  <span>Todo en orden hace 5 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
