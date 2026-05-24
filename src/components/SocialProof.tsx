import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import styles from './SocialProof.module.css';

const RECENT_ACTIVITIES = [
  { user: 'Héctor', city: 'El Bronx', plan: 'Plan Vital', patient: 'su madre' },
  { user: 'Carmen', city: 'Madrid', plan: 'Plan Concierge', patient: 'su padre' },
  { user: 'Luis', city: 'Miami', plan: 'Plan Vital', patient: 'su abuela' },
  { user: 'Ana', city: 'Nueva Jersey', plan: 'Plan Esencial', patient: 'sus padres' },
];

export const SocialProof = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 5000);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % RECENT_ACTIVITIES.length);
        setVisible(true);
      }, 1000);
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!visible) return null;

  const activity = RECENT_ACTIVITIES[index];

  return (
    <div className={styles.toast}>
      <div className={styles.icon}>
        <Bell size={18} />
      </div>
      <div className={styles.content}>
        <p>
          <strong>{activity.user}</strong> en {activity.city} acaba de activar el 
          <span className={styles.plan}> {activity.plan}</span> para {activity.patient} en Santo Domingo.
        </p>
        <span className={styles.time}>Hace un momento</span>
      </div>
    </div>
  );
};
