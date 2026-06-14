import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import NotificationPanel from '@/pages/notifications/NotificationPanel'
import styles from './NavBar.module.css'

export default function NavBar() {
  const { user, logout, isTeacher } = useAuth()
  const navigate                     = useNavigate()
  const [menuOpen, setMenuOpen]      = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.link} ${isActive ? styles.linkActive : ''}`

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* Brand */}
        <Link to="/dashboard" className={styles.brand}>
          <span className={styles.brandMark}>D</span>
          <span className={styles.brandText}>DevEduHub</span>
        </Link>

        {/* Nav links */}
        <nav className={styles.nav} aria-label="Main navigation">
          <NavLink to="/dashboard" className={navLinkClass} end>Dashboard</NavLink>
          <NavLink to="/courses"   className={navLinkClass}>Courses</NavLink>
          {!isTeacher && (
            <NavLink to="/submissions" className={navLinkClass}>My Submissions</NavLink>
          )}
          {isTeacher && (
            <NavLink to="/courses/new" className={navLinkClass}>+ New course</NavLink>
          )}
        </nav>

        {/* Right area: notifications + user menu */}
        <div className={styles.rightArea}>

          {/* Notification bell */}
          <NotificationPanel />

          {/* User menu */}
          <div className={styles.userArea}>
            <button
              className={styles.userBtn}
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className={styles.avatar} />
              ) : (
                <span className={styles.avatar}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              )}
              <span className={styles.userName}>{user?.first_name}</span>
              <svg className={`${styles.chevron} ${menuOpen ? styles.chevronOpen : ''}`}
                width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {menuOpen && (
              <div className={styles.dropdown} role="menu">
                <div className={styles.dropdownHeader}>
                  <p className={styles.dropdownName}>{user?.full_name}</p>
                  <p className={styles.dropdownEmail}>{user?.email}</p>
                  <span className={styles.rolePill}>
                    {user?.role === 'teacher' ? '📚 Teacher' : '🎓 Student'}
                  </span>
                </div>
                <div className={styles.dropdownDivider} />
                <button
                  className={styles.dropdownItem}
                  onClick={handleLogout}
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}