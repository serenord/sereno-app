import React, { useState } from 'react';
import { Bluetooth, BluetoothConnected, BluetoothSearching, Smartphone, Activity, AlertCircle } from 'lucide-react';
import styles from './BluetoothConnector.module.css';

export const BluetoothConnector = ({ onDataReceived }: { onDataReceived: (data: any) => void }) => {
  const [status, setStatus] = useState<'idle' | 'searching' | 'connected'>('idle');
  const [device, setDevice] = useState<string | null>(null);

  const connectBluetooth = async () => {
    setStatus('searching');
    try {
      // Simulate Web Bluetooth API workflow
      // In a real scenario: const device = await navigator.bluetooth.requestDevice({...});
      
      setTimeout(() => {
        setStatus('connected');
        setDevice('Tensiómetro SERENO-BT');
        
        // Start simulation of data
        setInterval(() => {
          const newData = {
            timestamp: new Date().toLocaleTimeString(),
            systolic: Math.floor(Math.random() * (130 - 110) + 110),
            diastolic: Math.floor(Math.random() * (85 - 70) + 70),
            pulse: Math.floor(Math.random() * (80 - 65) + 65),
          };
          onDataReceived(newData);
        }, 3000);
      }, 2000);
      
    } catch (error) {
      console.error('Bluetooth Error:', error);
      setStatus('idle');
    }
  };

  return (
    <div className={`glass-card ${styles.card}`}>
      <div className={styles.header}>
        <div className={`${styles.statusDot} ${styles[status]}`} />
        <h3>Monitoreo IoT en Vivo</h3>
      </div>
      
      <div className={styles.content}>
        {status === 'idle' && (
          <div className={styles.idle}>
            <Bluetooth size={48} className={styles.icon} />
            <p>Conecta un dispositivo para iniciar el monitoreo en tiempo real.</p>
            <button className="btn-primary" onClick={connectBluetooth}>
              Buscar Dispositivos
            </button>
          </div>
        )}
        
        {status === 'searching' && (
          <div className={styles.searching}>
            <BluetoothSearching size={48} className={`${styles.icon} ${styles.spin}`} />
            <p>Buscando tensiómetros y oxímetros cercanos...</p>
          </div>
        )}
        
        {status === 'connected' && (
          <div className={styles.connected}>
            <div className={styles.deviceInfo}>
              <Smartphone size={24} />
              <div>
                <strong>{device}</strong>
                <span>Conexión Estable • 88% Batería</span>
              </div>
            </div>
            <div className={styles.livePulse}>
              <Activity size={20} className={styles.pulseIcon} />
              <span>Sincronizando datos...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.footer}>
        <AlertCircle size={14} />
        <span>Compatible con estándares Bluetooth SIG Health</span>
      </div>
    </div>
  );
};
