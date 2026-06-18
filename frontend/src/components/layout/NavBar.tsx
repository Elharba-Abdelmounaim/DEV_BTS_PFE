// src/components/layout/NavBar.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from '../../pages/notifications/NotificationPanel';
import styles from './NavBar.module.css';

export default function NavBar() {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.link} ${isActive ? styles.linkActive : ''}`;

  // User display information
  const displayName = user?.first_name || 'Learner';
  const fullName = user?.full_name || [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(' ') || 'Anonymous User';
  const userInitials = user?.first_name
    ? (user.first_name[0] + (user.last_name?.[0] || '')).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  // Image loading state for avatar fallback
  const [avatarError, setAvatarError] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* ── Mobile Menu Toggle ────────────────────────────────────────── */}
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`}>
            <span /><span /><span />
          </span>
        </button>

        {/* ── Brand ──────────────────────────────────────────────────────── */}
        <Link to="/dashboard" className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor"/>
              <path d="M8 16L14 10L20 16L26 10" stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 22L14 16L20 22L26 16" stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            </svg>
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>DevEdu</span>
            <span className={styles.brandHub}>Hub</span>
          </div>
        </Link>

        {/* ── Desktop Navigation ────────────────────────────────────────── */}
        <nav className={styles.nav} aria-label="Main navigation">
          <NavLink to="/dashboard" className={navLinkClass} end>
            <svg className={styles.navIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/courses" className={navLinkClass}>
            <svg className={styles.navIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Courses</span>
          </NavLink>

          {/* Student-specific links */}
          {isStudent && (
            <>
              <NavLink to="/submissions" className={navLinkClass}>
                <svg className={styles.navIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <span>My Work</span>
              </NavLink>
              <NavLink to="/portfolio" className={navLinkClass}>
                <svg className={styles.navIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <span>Portfolio</span>
              </NavLink>
            </>
          )}

          {/* Teacher-specific links */}
          {isTeacher && (
            <>
              <NavLink to="/courses/new" className={`${styles.link} ${styles.linkAccent}`}>
                <svg className={styles.navIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <span>Create Course</span>
              </NavLink>
              <NavLink to="/submissions" className={navLinkClass}>
                <svg className={styles.navIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <span>Review</span>
              </NavLink>
              <NavLink to="/assignments" className={navLinkClass}>
                <svg className={styles.navIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span>Assignments</span>
              </NavLink>
            </>
          )}

          {/* Community & Resources Dropdown */}
          <div className={styles.moreWrap} ref={moreRef}>
            <button
              className={`${styles.link} ${moreOpen ? styles.linkActive : ''}`}
              onClick={() => setMoreOpen(o => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
            >
              <svg className={styles.navIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              <span>Resources</span>
              <svg
                className={`${styles.chevronSmall} ${moreOpen ? styles.chevronOpen : ''}`}
                width="12" height="12" viewBox="0 0 16 16" fill="none"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {moreOpen && (
              <div className={styles.moreDropdown} role="menu">
                <div className={styles.dropdownSection}>
                  <h3 className={styles.dropdownSectionTitle}>Quick Navigation</h3>
                  
                  {/* Profile - always visible */}
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    <span className={styles.itemIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <div className={styles.dropdownItemContent}>
                      <span className={styles.dropdownItemTitle}>Profile</span>
                      <span className={styles.dropdownItemDesc}>View and edit your profile</span>
                    </div>
                  </NavLink>

                  {/* Notifications */}
                  <NavLink
                    to="/notifications"
                    className={({ isActive }) =>
                      `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    <span className={styles.itemIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    </span>
                    <div className={styles.dropdownItemContent}>
                      <span className={styles.dropdownItemTitle}>Notifications</span>
                      <span className={styles.dropdownItemDesc}>Stay updated with your progress</span>
                    </div>
                  </NavLink>

                  {/* Assignments */}
                  <NavLink
                    to="/assignments"
                    className={({ isActive }) =>
                      `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    <span className={styles.itemIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                    </span>
                    <div className={styles.dropdownItemContent}>
                      <span className={styles.dropdownItemTitle}>All Assignments</span>
                      <span className={styles.dropdownItemDesc}>View and manage assignments</span>
                    </div>
                  </NavLink>

                  {/* Submissions */}
                  <NavLink
                    to="/submissions"
                    className={({ isActive }) =>
                      `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    <span className={styles.itemIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </span>
                    <div className={styles.dropdownItemContent}>
                      <span className={styles.dropdownItemTitle}>Submissions</span>
                      <span className={styles.dropdownItemDesc}>Track your submissions</span>
                    </div>
                  </NavLink>
                </div>

                <div className={styles.dropdownDivider} />

                <div className={styles.dropdownSection}>
                  <h3 className={styles.dropdownSectionTitle}>Help & Support</h3>
                  <NavLink
                    to="/help"
                    className={({ isActive }) =>
                      `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    <span className={styles.itemIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </span>
                    <div className={styles.dropdownItemContent}>
                      <span className={styles.dropdownItemTitle}>Help Center</span>
                      <span className={styles.dropdownItemDesc}>Get support & FAQ</span>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    <span className={styles.itemIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                    </span>
                    <div className={styles.dropdownItemContent}>
                      <span className={styles.dropdownItemTitle}>Settings</span>
                      <span className={styles.dropdownItemDesc}>Manage your preferences</span>
                    </div>
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* ── Right Area ────────────────────────────────────────────────── */}
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
              {user?.avatar_url && !avatarError ? (
                <img
                  src={user.avatar_url}
                  alt={fullName}
                  className={styles.avatar}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {userInitials}
                </div>
              )}
              <div className={styles.userInfo}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userRole}>
                  {isTeacher ? 'Instructor' : 'Student'}
                </span>
              </div>
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
                  <div className={styles.dropdownUserInfo}>
                    {user?.avatar_url && !avatarError ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className={styles.dropdownAvatar}
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className={styles.dropdownAvatarPlaceholder}>
                        {userInitials}
                      </div>
                    )}
                    <div>
                      <p className={styles.dropdownName}>{fullName}</p>
                      <p className={styles.dropdownEmail}>{user?.email}</p>
                    </div>
                  </div>
                  <span className={`${styles.rolePill} ${isTeacher ? styles.rolePillTeacher : styles.rolePillStudent}`}>
                    {isTeacher ? '👨‍🏫 Instructor' : '🎓 Student'}
                  </span>
                </div>

                <div className={styles.dropdownDivider} />

                <Link
                  to="/profile"
                  className={styles.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <span className={styles.itemIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <span>View Profile</span>
                </Link>

                <Link
                  to="/dashboard"
                  className={styles.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <span className={styles.itemIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </span>
                  <span>Dashboard</span>
                </Link>

                <div className={styles.dropdownDivider} />

                <Link
                  to="/settings"
                  className={styles.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <span className={styles.itemIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </span>
                  <span>Settings</span>
                </Link>

                <Link
                  to="/help"
                  className={styles.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  <span className={styles.itemIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                  <span>Help & Support</span>
                </Link>

                <div className={styles.dropdownDivider} />

                <button
                  className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <span className={styles.itemIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu} ref={mobileRef}>
          <nav className={styles.mobileNav}>
            <NavLink to="/dashboard" className={styles.mobileLink} end>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Dashboard
            </NavLink>

            <NavLink to="/courses" className={styles.mobileLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              Courses
            </NavLink>

            <NavLink to="/assignments" className={styles.mobileLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Assignments
            </NavLink>

            <NavLink to="/submissions" className={styles.mobileLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              {isStudent ? 'My Work' : 'Review'}
            </NavLink>

            <NavLink to="/profile" className={styles.mobileLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </NavLink>

            <NavLink to="/notifications" className={styles.mobileLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              Notifications
            </NavLink>

            <NavLink to="/settings" className={styles.mobileLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </NavLink>

            <div className={styles.mobileDivider} />

            <button className={styles.mobileLogout} onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}