import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import Input from '../../components/ui/Input'
import styles from './Auth.module.css'
import type { LoginPayload } from '@/types'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'

  const { values, errors, globalError, loading, handleChange, handleSubmit } = useForm<LoginPayload>({
    initialValues: { email: '', password: '' },
    onSubmit: async (vals) => {
      await login(vals)
      navigate(from, { replace: true })
    },
  })

  return (
    <div className={`${styles.card} page-enter`}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoMark}>D</div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to DevEduHub</p>
      </div>

      {/* Demo credentials hint */}
      <div className={styles.demoHint}>
        <span className={styles.demoLabel}>Demo</span>
        <span>teacher@deveduhub.com · student1@deveduhub.com</span>
        <span className={styles.demoPw}>pw: password</span>
      </div>

      {/* Global error */}
      {globalError && (
        <div className={styles.alert} role="alert">{globalError}</div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <button
          type="submit"
          className={styles.btn}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : 'Sign in'}
        </button>
      </form>

      {/* Footer */}
      <p className={styles.footer}>
        Don't have an account?{' '}
        <Link to="/register" className={styles.link}>Create one</Link>
      </p>
    </div>
  )
}