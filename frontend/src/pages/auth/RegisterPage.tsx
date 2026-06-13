import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import Input from '../../components/ui/Input'
import styles from './Auth.module.css'
import type { RegisterPayload } from '@/types'

interface RegisterForm extends RegisterPayload {
  password_confirmation: string
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate      = useNavigate()

  const { values, errors, globalError, loading, handleChange, handleSubmit } =
    useForm<RegisterForm>({
      initialValues: {
        first_name:            '',
        last_name:             '',
        email:                 '',
        password:              '',
        password_confirmation: '',
        role:                  'student',
        github_username:       '',
      },
      onSubmit: async (vals) => {
        await register(vals)
        navigate('/dashboard', { replace: true })
      },
    })

  return (
    <div className={`${styles.card} page-enter`}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoMark}>D</div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join DevEduHub today</p>
      </div>

      {/* Global error */}
      {globalError && (
        <div className={styles.alert} role="alert">{globalError}</div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className={styles.form}>

        {/* Name row */}
        <div className={styles.row}>
          <Input
            label="First name"
            type="text"
            name="first_name"
            autoComplete="given-name"
            placeholder="Youssef"
            value={values.first_name}
            onChange={handleChange}
            error={errors.first_name}
            required
          />
          <Input
            label="Last name"
            type="text"
            name="last_name"
            autoComplete="family-name"
            placeholder="El Mansouri"
            value={values.last_name}
            onChange={handleChange}
            error={errors.last_name}
            required
          />
        </div>

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

        {/* Role selector */}
        <div className={styles.roleField}>
          <span className={styles.roleLabel}>I am a</span>
          <div className={styles.roleOptions}>
            {(['student', 'teacher'] as const).map((r) => (
              <label key={r} className={`${styles.roleOption} ${values.role === r ? styles.roleOptionActive : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={values.role === r}
                  onChange={handleChange}
                  className={styles.roleRadio}
                />
                <span className={styles.roleIcon}>{r === 'student' ? '🎓' : '📚'}</span>
                <span className={styles.roleText}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
              </label>
            ))}
          </div>
          {errors.role && <span className={styles.fieldError}>{errors.role}</span>}
        </div>

        <Input
          label="GitHub username (optional)"
          type="text"
          name="github_username"
          autoComplete="username"
          placeholder="your-github-handle"
          value={values.github_username ?? ''}
          onChange={handleChange}
          error={errors.github_username}
          hint="Required for submitting assignments via GitHub"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <Input
          label="Confirm password"
          type="password"
          name="password_confirmation"
          autoComplete="new-password"
          placeholder="Repeat password"
          value={values.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation}
          required
        />

        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Create account'}
        </button>
      </form>

      {/* Footer */}
      <p className={styles.footer}>
        Already have an account?{' '}
        <Link to="/login" className={styles.link}>Sign in</Link>
      </p>
    </div>
  )
}