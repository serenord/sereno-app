'use client';
import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import styles from './BlogSection.module.css';
import { useLanguage } from '../i18n/LanguageContext';

export const BlogSection = () => {
  const { t } = useLanguage();

  const BRUTAL_POSTS = [
    {
      tag: t('blogSection.post1.tag'),
      title: t('blogSection.post1.title'),
      excerpt: t('blogSection.post1.excerpt'),
      link: 'https://blog.serenoapp.org/blog/la-psicologia-de-la-remesa-por-que-tu-madre-dice-ya-compre-las-pastillas-aunque-no-sea-cierto/',
      date: t('blogSection.post1.date')
    },
    {
      tag: t('blogSection.post2.tag'),
      title: t('blogSection.post2.title'),
      excerpt: t('blogSection.post2.excerpt'),
      link: 'https://blog.serenoapp.org/blog', 
      date: t('blogSection.post2.date')
    },
    {
      tag: t('blogSection.post3.tag'),
      title: t('blogSection.post3.title'),
      excerpt: t('blogSection.post3.excerpt'),
      link: 'https://blog.serenoapp.org/blog/cuanto-cuesta-realmente-cuidar-a-un-padre-diabetico-en-republica-dominicana/',
      date: t('blogSection.post3.date')
    }
  ];

  return (
    <section className={styles.blogSection} id="resources">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.badge}>
            <AlertTriangle size={16} color="#ff9900" /> {t('blogSection.badge')}
          </span>
          <h2>
            {t('blogSection.title1')} <br />
            <span className="text-gradient">{t('blogSection.title2')}</span>
          </h2>
          <p>{t('blogSection.subtitle')}</p>
        </div>

        <div className={styles.grid}>
          {BRUTAL_POSTS.map((post, idx) => (
            <article key={idx} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.tag}>{post.tag}</span>
                <span className={styles.date}>{post.date}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <a href={post.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {t('blogSection.read_more')} <ArrowRight size={16} />
              </a>
            </article>
          ))}
        </div>

        <div className={styles.footerAction}>
          <a href="#waitlist" className="btn-primary" style={{ marginRight: '1rem' }}>
            {t('blogSection.cta_primary')}
          </a>
          <a href="https://blog.serenoapp.org/blog" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            {t('blogSection.cta_secondary')}
          </a>
        </div>
      </div>
    </section>
  );
};
