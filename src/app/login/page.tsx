'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (cooldown > 0) return;
    
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('rate limit')) {
        setError('Demasiados intentos. Espera 60 segundos.')
        setCooldown(60)
      } else {
        setError('Correo o contraseña incorrectos. Intenta de nuevo.')
      }
      setLoading(false)
      return
    }

    // Revisar rol del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
    router.refresh()
  }

  async function handleGoogleLogin() {
    if (cooldown > 0) return;
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>SERENO</div>
          <p>Tu portal de gestión de salud familiar</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <h2>Iniciar Sesión</h2>

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
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className={`btn-primary ${styles.submitBtn}`}
            disabled={loading || cooldown > 0}
          >
            {loading ? 'Iniciando sesión...' : cooldown > 0 ? `Espera ${cooldown}s` : 'Entrar'}
          </button>

          <button
            type="button"
            className={styles.backBtn}
            onClick={handleGoogleLogin}
            disabled={loading || cooldown > 0}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Continuar con Google
          </button>

          <div className={styles.forgotPassword}>
            <a href="/reset-password">¿Olvidaste tu contraseña?</a>
          </div>
        </form>

        <div className={styles.footer}>
          <p>¿Necesitas ayuda? <a href="https://wa.me/18292847990" target="_blank" rel="noopener noreferrer">Contáctanos por WhatsApp</a></p>
        </div>
      </div>

      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <h1>La tranquilidad no tiene fronteras</h1>
          <p>Gestiona la salud de tu familia en República Dominicana desde cualquier parte del mundo.</p>
          <ul className={styles.brandFeatures}>
            <li>✅ Reporte verificable en menos de 24h</li>
            <li>✅ Foto de evidencia de cada entrega</li>
            <li>✅ Factura de costo real, siempre</li>
            <li>✅ Coordinación con farmacias y médicos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
