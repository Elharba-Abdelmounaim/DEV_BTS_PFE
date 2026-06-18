// src/pages/profile/components/AccountSettings.tsx
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import styles from '../Profile.module.css';

export const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      // API call to delete account
      try {
        await fetch('/api/v1/auth/delete', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        await logout();
      } catch (error) {
        console.error('Failed to delete account', error);
      }
    }
  };

  return (
    <div className={styles.accountSettings}>
      <div className={styles.formSection}>
        <h3 className={styles.formTitle}>Account Settings</h3>
        
        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4 className={styles.settingTitle}>Account Status</h4>
            <p className={styles.settingDesc}>
              {user?.is_active ? '🟢 Active' : '🔴 Inactive'}
              {user?.is_verified && ' • ✅ Verified'}
            </p>
          </div>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4 className={styles.settingTitle}>Account Created</h4>
            <p className={styles.settingDesc}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : '—'}
            </p>
          </div>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4 className={styles.settingTitle}>Role</h4>
            <p className={styles.settingDesc}>
              {user?.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
            </p>
          </div>
        </div>
      </div>

      <div className={`${styles.formSection} ${styles.dangerSection}`}>
        <h3 className={styles.formTitle}>Danger Zone</h3>
        
        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4 className={styles.settingTitle}>Logout</h4>
            <p className={styles.settingDesc}>Sign out of your account on this device</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>

        
      </div>
    </div>
  );
};