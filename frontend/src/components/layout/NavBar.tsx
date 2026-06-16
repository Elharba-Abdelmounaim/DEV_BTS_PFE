import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import NotificationPanel from '@/pages/notifications/NotificationPanel'
import styles from './NavBar.module.css'

export default function NavBar() {
  const { user, logout, isTeacher, isStudent } = useAuth()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
          <NavLink to="/dashboard" className={navLinkClass} end>
            Dashboard
          </NavLink>

          <NavLink to="/courses" className={navLinkClass}>
            Courses
          </NavLink>

          {/* Student links */}
          {isStudent && (
            <>
              <NavLink to="/submissions" className={navLinkClass}>
                Submissions
              </NavLink>
              <NavLink to="/enrollments" className={navLinkClass}>
                Enrollments
              </NavLink>
            </>
          )}

          {/* Teacher links */}
          {isTeacher && (
            <>
              <NavLink to="/courses/new" className={`${styles.link} ${styles.linkAccent}`}>
                + New course
              </NavLink>
              <NavLink to="/submissions" className={navLinkClass}>
                Submissions
              </NavLink>
            </>
          )}

          {/* More dropdown (responsive + extra links) */}
          <div className={styles.moreWrap} ref={moreRef}>
            <button
              className={`${styles.link} ${moreOpen ? styles.linkActive : ''}`}
              onClick={() => setMoreOpen(o => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
            >
              More
              <svg
                className={`${styles.chevronSmall} ${moreOpen ? styles.chevronOpen : ''}`}
                width="14" height="14" viewBox="0 0 16 16" fill="none"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {moreOpen && (
              <div className={styles.moreDropdown} role="menu">
                <NavLink
                  to="/notifications"
                  className={({ isActive }) =>
                    `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                  }
                  onClick={() => setMoreOpen(false)}
                >
                  <span className={styles.itemIcon}>🔔</span>
                  Notifications
                </NavLink>

                {isStudent && (
                  <>
                    <NavLink
                      to="/portfolio"
                      className={({ isActive }) =>
                        `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                      }
                      onClick={() => setMoreOpen(false)}
                    >
                      <span className={styles.itemIcon}>💼</span>
                      Portfolio
                    </NavLink>
                    <NavLink
                      to="/courses"
                      className={({ isActive }) =>
                        `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                      }
                      onClick={() => setMoreOpen(false)}
                    >
                      <span className={styles.itemIcon}>🔍</span>
                      Browse courses
                    </NavLink>
                  </>
                )}

                {isTeacher && (
                  <>
                    <NavLink
                      to="/assignments"
                      className={({ isActive }) =>
                        `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                      }
                      onClick={() => setMoreOpen(false)}
                    >
                      <span className={styles.itemIcon}>📝</span>
                      Assignments
                    </NavLink>
                    <NavLink
                      to="/enrollments"
                      className={({ isActive }) =>
                        `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                      }
                      onClick={() => setMoreOpen(false)}
                    >
                      <span className={styles.itemIcon}>🎓</span>
                      Enrollments
                    </NavLink>
                  </>
                )}

                <div className={styles.dropdownDivider} />

                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                  }
                  onClick={() => setMoreOpen(false)}
                >
                  <span className={styles.itemIcon}>⚙️</span>
                  Settings
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Right area: notifications + user menu */}
        <div className={styles.rightArea}>

          {/* Notification bell */}
          <NotificationPanel />

          {/* User menu */}
          <div className={styles.userArea} ref={menuRef}>
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
              <svg
                className={`${styles.chevron} ${menuOpen ? styles.chevronOpen : ''}`}
                width="16" height="16" viewBox="0 0 16 16" fill="none"
              >
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
                    {isTeacher ? '📚 Teacher' : '🎓 Student'}
                  </span>
                </div>

                <div className={styles.dropdownDivider} />

                <Link
                  to="/profile"
                  className={styles.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <span className={styles.itemIcon}>👤</span>
                  Profile
                </Link>

                <Link
                  to="/portfolio"
                  className={styles.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <span className={styles.itemIcon}>💼</span>
                  Portfolio
                </Link>

                <Link
                  to="/settings"
                  className={styles.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <span className={styles.itemIcon}>⚙️</span>
                  Settings
                </Link>

                <div className={styles.dropdownDivider} />

                <button
                  className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <span className={styles.itemIcon}>🚪</span>
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