'use client';
import React from 'react';
import styles from './Hero.module.css';
import { useLanguage } from '../i18n/LanguageContext';

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <span className={styles.badge}>{t('hero.badge')}</span>
          <h1 className={styles.title}>
            {t('hero.title1')} <br />
            <span className="text-gradient">{t('hero.title2')}</span>
          </h1>
          <p className={styles.description}>
            <span dangerouslySetInnerHTML={{ __html: t('hero.desc1') }} />
            <br /><br />
            <span dangerouslySetInnerHTML={{ __html: t('hero.desc2') }} />
          </p>
          <div className={styles.actions}>
            <a href="#waitlist" className="btn-primary">{t('hero.btnPrimary')}</a>
            <a href="#plans" className={styles.btnSecondary}>{t('hero.btnSecondary')}</a>
          </div>

          <div className={styles.trustBar}>
            <span>✓ {t('hero.trust1')}</span>
            <span className={styles.divider}>|</span>
            <span>✓ {t('hero.trust2')}</span>
            <span className={styles.divider}>|</span>
            <span>✓ {t('hero.trust3')}</span>
          </div>
          
          <div className={styles.trust}>
            <div className={styles.avatars}>
              <div className={styles.avatar}>🇩🇴</div>
              <div className={styles.avatar}>🇺🇸</div>
              <div className={styles.avatar}>🇪🇸</div>
            </div>
            <p>{t('hero.trustedBy')}</p>
          </div>
        </div>
        
        <div className={styles.imageContainer}>
          <div className={styles.imageWrapper}>
            <img 
              src="/images/hero.png" 
              alt="Cuidado médico Sereno" 
              className={styles.image} 
            />
            <div className={`glass-card ${styles.floatingCard}`}>
              <div className={styles.statusIcon}>🟢</div>
              <div>
                <strong>{t('hero.cardTitle')}</strong>
                <p>{t('hero.cardDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
