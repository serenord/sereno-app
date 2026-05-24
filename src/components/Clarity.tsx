'use client';
import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import styles from './Clarity.module.css';

export const Clarity = () => {
  const { t } = useLanguage();

  return (
    <section className={styles.clarity} id="clarity">
      <div className="container">
        <div className={styles.header}>
          <h2>{t('clarity.title')}</h2>
          <p>{t('clarity.subtitle')}</p>
        </div>
        <div className={styles.grid}>
          <div className={styles.cardBox}>
            <h3>🟢 {t('clarity.subscription_title')}</h3>
            <p>{t('clarity.subscription_desc')}</p>
          </div>
          <div className={`${styles.cardBox} ${styles.alertBox}`}>
            <h3>🛑 {t('clarity.costs_title')}</h3>
            <p dangerouslySetInnerHTML={{ __html: t('clarity.costs_desc') }} />
          </div>
        </div>
      </div>
    </section>
  );
};
