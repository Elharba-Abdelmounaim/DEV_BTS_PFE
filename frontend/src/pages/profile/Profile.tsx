// src/pages/profile/Profile.tsx
import React, { useEffect } from 'react';
import { useProfile } from './hooks/useProfile';
import { ProfileHeader } from './components/ProfileHeader';
import ProfileStats from './components/ProfileStats';
import { ProfileInfo } from './components/ProfileInfo';
import { ProfileForm } from './components/ProfileForm';
import { ChangePassword } from './components/ChangePassword';
import { AccountSettings } from './components/AccountSettings';
import styles from './Profile.module.css';

export default function Profile() {
  const {
    user,
    stats,
    loading,
    updating,
    error,
    success,
    updateProfile,
    changePassword,
    refresh,
    clearMessages,
  } = useProfile();

  const handleAvatarChange = async (file: File) => {
    console.log('Avatar file:', file);
  };

  useEffect(() => {
    return () => clearMessages();
  }, [clearMessages]);

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <ProfileHeader
          user={user}
          loading={loading}
          onAvatarChange={handleAvatarChange}
          updating={updating}
        />

       
        <ProfileStats stats={stats} loading={loading} />

        <div className={styles.mainGrid}>
          <div className={styles.leftColumn}>
            <div className={styles.card}>
              <ProfileInfo user={user} loading={loading} />
            </div>
          </div>

          <div className={styles.middleColumn}>
            <div className={styles.card}>
              <ProfileForm
                user={user}
                onSubmit={updateProfile}
                loading={updating}
                success={success}
                error={error}
              />
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.card}>
              <ChangePassword
                onSubmit={changePassword}
                loading={updating}
                success={success}
                error={error}
              />
            </div>

            <div className={styles.card}>
              <AccountSettings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}