// src/pages/profile/components/ProfileHeader.tsx
import React, { useRef } from 'react';
import type { User } from '../../../types';
import styles from '../Profile.module.css';

interface ProfileHeaderProps {
  user: User | null;
  loading: boolean;
  onAvatarChange: (file: File) => Promise<void>;
  updating: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  loading,
  onAvatarChange,
  updating,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onAvatarChange(file);
    }
    e.target.value = ''; // Reset input
  };

  if (loading) {
    return (
      <div className={styles.profileHeader}>
        <div className={styles.avatarSkeleton} />
        <div className={styles.nameSkeleton} />
        <div className={styles.roleSkeleton} />
      </div>
    );
  }

  return (
    <div className={styles.profileHeader}>
      <div className={styles.avatarWrapper}>
        <div className={styles.avatarContainer}>
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || '')}+${encodeURIComponent(user?.last_name || '')}&background=3b82f6&color=fff&size=128&bold=true`}
            alt={`${user?.first_name} ${user?.last_name}`}
            className={styles.avatar}
            />
          <button
            className={styles.avatarEditBtn}
            onClick={handleAvatarClick}
            disabled={updating}
            aria-label="Change avatar"
          >
            📷
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <div className={styles.userInfo}>
          <h1 className={styles.userName}>
            {user?.first_name} {user?.last_name}
          </h1>
          <div className={styles.userRole}>
            <span className={`${styles.roleBadge} ${user?.role === 'teacher' ? styles.roleTeacher : styles.roleStudent}`}>
              {user?.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
            </span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
          {user?.github_username && (
            <a
              href={`https://github.com/${user.github_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              <span>🐙</span> github.com/{user.github_username}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};