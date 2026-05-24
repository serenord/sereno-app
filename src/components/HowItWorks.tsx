'use client';
import React from 'react';
import { CreditCard, ShieldCheck, MapPin, BarChart3 } from 'lucide-react';
import styles from './HowItWorks.module.css';
import { useLanguage } from '../i18n/LanguageContext';

export const HowItWorks = () => {
  const { t } = useLanguage();

  const STEPS = [
    {
      icon: <CreditCard size={32} />,
      title: t('howItWorks.step1.title'),
      text: t('howItWorks.step1.text')
    },
    {
      icon: <ShieldCheck size={32} />,
      title: t('howItWorks.step2.title'),
      text: t('howItWorks.step2.text')
    },
    {
      icon: <MapPin size={32} />,
      title: t('howItWorks.step3.title'),
      text: t('howItWorks.step3.text')
    },
    {
      icon: <BarChart3 size={32} />,
      title: t('howItWorks.step4.title'),
      text: t('howItWorks.step4.text')
    }
  ];

  return (
    <section className={styles.howItWorks} id="how-it-works">
      <div className="container">
        <div className={styles.header}>
          <h2>{t('howItWorks.title1')} <br /><span className="text-gradient">{t('howItWorks.title2')}</span></h2>
          <p>{t('howItWorks.subtitle')}</p>
        </div>
        
        <div className={styles.grid}>
          {STEPS.map((step, idx) => (
            <div key={idx} className={styles.step}>
              <div className={styles.iconBox}>
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a href="#waitlist" className="btn-primary">{t('howItWorks.cta')}</a>
        </div>
      </div>
    </section>
  );
};
