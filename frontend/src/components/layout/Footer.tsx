// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* ── Row 1: Brand & Social Media ────────────────────────────────── */}
        <div className={styles.topRow}>
          {/* Brand */}
          <div className={styles.brandWrapper}>
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
              <h3 className={styles.brandTitle}>
                <span className={styles.brandHighlight}>Dev</span>Edu
                <span className={styles.brandHub}>Hub</span>
              </h3>
            </Link>
            <p className={styles.brandDesc}>
              The community of those who Do Hard Things.
            </p>
          </div>

          {/* Social Media Links */}
          <div className={styles.social}>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Twitter / X"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="YouTube"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Discord"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.3973-.8742-.6083-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.5152.07.07 0 0 0-.0325.0277C2.5503 6.6127 1.7158 9.5986 1.3384 12.51a.0759.0759 0 0 0 .0285.0623 19.7758 19.7758 0 0 0 5.1911 3.4382.074.074 0 0 0 .078-.0281c.401-.5478.7587-1.1278 1.0681-1.7351a.076.076 0 0 0-.0415-.105 13.2466 13.2466 0 0 1-1.6342-.7894.0759.0759 0 0 1-.0072-.1275c.1105-.0836.221-.1705.3277-.2606a.076.076 0 0 1 .0776-.0114 13.8648 13.8648 0 0 0 5.3986.8493 13.8648 13.8648 0 0 0 5.3986-.8493.076.076 0 0 1 .0776.0114c.1067.0901.2172.177.3277.2606a.0759.0759 0 0 1-.0072.1275c-.5286.3387-1.0785.5898-1.6342.7894a.076.076 0 0 0-.0415.105c.3094.6073.6671 1.1873 1.0681 1.7351a.074.074 0 0 0 .078.0281 19.776 19.776 0 0 0 5.1911-3.4382.0759.0759 0 0 0 .0285-.0623c-.3774-2.9114-1.2119-5.8973-2.2046-8.1128a.07.07 0 0 0-.0325-.0277z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ── Row 2: Links ──────────────────────────────────────────────────── */}
        <div className={styles.linksRow}>
          <div className={styles.linksColumn}>
            <h4 className={styles.linksTitle}>Platform</h4>
            <Link to="/dashboard" className={styles.link}>Dashboard</Link>
            <Link to="/courses" className={styles.link}>Courses</Link>
            <Link to="/submissions" className={styles.link}>Submissions</Link>
            <Link to="/profile" className={styles.link}>Profile</Link>
          </div>

          <div className={styles.linksColumn}>
            <h4 className={styles.linksTitle}>Support</h4>
            <Link to="/support" className={styles.link}>Help Center</Link>
            <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
            <Link to="/terms" className={styles.link}>Terms & Conditions</Link>
          </div>

          <div className={styles.linksColumn}>
            <h4 className={styles.linksTitle}>Contact</h4>
            <p className={styles.contactInfo}>
              <span className={styles.contactIcon}>📧</span>
              support@deveduhub.com
            </p>
            <p className={styles.contactInfo}>
              <span className={styles.contactIcon}>📍</span>
              Casablanca, Morocco
            </p>
          </div>
        </div>

        {/* ── Row 3: Copyright ────────────────────────────────────────────────── */}
        <div className={styles.bottomRow}>
          <p className={styles.copyright}>
            © {currentYear} <span className={styles.copyrightHighlight}>DevEduHub</span>. 
            All rights reserved. Made with ❤️ by DevEdu Team.
          </p>
        </div>

      </div>
    </footer>
  );
}