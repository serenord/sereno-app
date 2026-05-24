"use client";

import { useState } from 'react';
import { resetPasswordAction } from '@/actions/authActions';
import styles from '../../login/login.module.css';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await resetPasswordAction(email);
      setSuccess(true);
    } catch (err: any) {
      if (err.message === 'RATE_LIMIT_EXCEEDED') {
        setError('Demasiados intentos. Por favor espera antes de intentar de nuevo.');
      } else {
        setError(err.message || 'Ocurrió un error. Verifica tu correo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer} style={{ margin: 'auto' }}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>SERENO</div>
          <p>Recuperar contraseña</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#0E2A47', marginBottom: '10px' }}>Revisa tu correo</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Te hemos enviado un enlace para restablecer tu contraseña.
            </p>
            <a href="/login" className={`btn-primary ${styles.submitBtn}`} style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
              Volver al inicio
            </a>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <h2>Recuperación</h2>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>

            <div className={styles.forgotPassword}>
              <a href="/login">Volver al inicio de sesión</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
