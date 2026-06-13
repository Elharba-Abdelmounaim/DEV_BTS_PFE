import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import styles from './AuthShell.module.css'

export default function AuthShell() {
  const { user, initialized } = useAuth()

  // Already logged in — send to dashboard
  if (initialized && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className={styles.root}>
      {/* Left panel — decorative */}
      <aside className={styles.panel}>
        <div className={styles.panelInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>D</span>
            <span className={styles.logoText}>DevEduHub</span>
          </div>
          <blockquote className={styles.quote}>
            <p>"Code is the closest thing we have to a superpower."</p>
          </blockquote>
          <div className={styles.decorGrid}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className={styles.decorCell} style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        </div>
      </aside>

      {/* Right panel — form */}
      <main className={styles.form}>
        <Outlet />
      </main>
    </div>
  )
}