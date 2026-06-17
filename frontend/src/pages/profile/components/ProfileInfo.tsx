// src/pages/profile/components/ProfileInfo.tsx
import React from 'react';
import type { User } from '../../../types';
import styles from '../Profile.module.css';

interface ProfileInfoProps {
  user: User | null;
  loading: boolean;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ user, loading }) => {
  if (loading) {
    return (
      <div className={styles.profileInfo}>
        <div className={styles.infoSkeleton} />
        <div className={styles.infoSkeleton} />
        <div className={styles.infoSkeleton} />
        <div className={styles.infoSkeleton} />
        <div className={styles.infoSkeleton} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.profileInfo}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>👤</span>
          <p className={styles.emptyText}>No user data available</p>
        </div>
      </div>
    );
  }

  // تنسيق التاريخ بشكل صحيح
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const infoSections = [
    {
      title: 'Personal Information',
      icon: '👤',
      items: [
        {
          label: 'Full Name',
          value: `${user.first_name} ${user.last_name}`,
          icon: '👤',
          color: '#3b82f6',
        },
        {
          label: 'Email Address',
          value: user.email,
          icon: '📧',
          color: '#8b5cf6',
        },
        {
          label: 'Role',
          value: user.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student',
          icon: '🎯',
          color: '#22c55e',
        },
        {
          label: 'GitHub',
          value: user.github_username ? `@${user.github_username}` : 'Not linked',
          icon: '🐙',
          color: '#f59e0b',
          link: user.github_username ? `https://github.com/${user.github_username}` : undefined,
        },
      ],
    },
    {
      title: 'Account Details',
      icon: '🔐',
      items: [
        {
          label: 'Account Status',
          value: user.is_verified ? '✅ Verified' : '⚠️ Not Verified',
          icon: '🔒',
          color: user.is_verified ? '#22c55e' : '#f59e0b',
        },
        {
          label: 'Member Since',
          value: formatDate(user.created_at),
          icon: '📅',
          color: '#3b82f6',
        },
        {
          label: 'Account ID',
          value: user.id.slice(0, 8) + '...' + user.id.slice(-4),
          icon: '🆔',
          color: '#64748b',
        },
        {
          label: 'Last Updated',
          value: formatDateTime(user.updated_at),
          icon: '🔄',
          color: '#94a3b8',
        },
      ],
    },
  ];

  // معلومات إضافية (Bio, Phone, Location)
  const hasExtraInfo = (user as any).bio || (user as any).phone || (user as any).location;

  return (
    <div className={styles.profileInfo}>
      {/* Header */}
      <div className={styles.infoHeader}>
        <h3 className={styles.infoTitle}>
          <span className={styles.infoTitleIcon}>📋</span>
          Profile Information
        </h3>
        <span className={styles.infoStatus}>
          <span className={styles.statusDot} />
          Live
        </span>
      </div>

      {/* Sections */}
      {infoSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className={styles.infoSection}>
          <h4 className={styles.infoSectionTitle}>
            <span className={styles.infoSectionIcon}>{section.icon}</span>
            {section.title}
          </h4>
          <div className={styles.infoGrid}>
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className={styles.infoItem}>
                <div 
                  className={styles.infoItemIcon} 
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  {item.icon}
                </div>
                <div className={styles.infoItemContent}>
                  <p className={styles.infoItemLabel}>{item.label}</p>
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.infoItemValueLink}
                    >
                      {item.value}
                      <span className={styles.externalLinkIcon}>↗</span>
                    </a>
                  ) : (
                    <p className={styles.infoItemValue}>{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Extra Information */}
      {hasExtraInfo && (
        <div className={styles.infoSection}>
          <h4 className={styles.infoSectionTitle}>
            <span className={styles.infoSectionIcon}>📞</span>
            Contact Information
          </h4>
          <div className={styles.infoGrid}>
            {(user as any).bio && (
              <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
                <div className={styles.infoItemIcon} style={{ backgroundColor: '#dbeafe15', color: '#3b82f6' }}>
                  📝
                </div>
                <div className={styles.infoItemContent}>
                  <p className={styles.infoItemLabel}>Bio</p>
                  <p className={styles.infoItemBio}>{(user as any).bio}</p>
                </div>
              </div>
            )}
            <div className={styles.infoGridTwo}>
              {(user as any).phone && (
                <div className={styles.infoItem}>
                  <div className={styles.infoItemIcon} style={{ backgroundColor: '#fef3c715', color: '#f59e0b' }}>
                    📱
                  </div>
                  <div className={styles.infoItemContent}>
                    <p className={styles.infoItemLabel}>Phone</p>
                    <p className={styles.infoItemValue}>{(user as any).phone}</p>
                  </div>
                </div>
              )}
              {(user as any).location && (
                <div className={styles.infoItem}>
                  <div className={styles.infoItemIcon} style={{ backgroundColor: '#dcfce715', color: '#22c55e' }}>
                    📍
                  </div>
                  <div className={styles.infoItemContent}>
                    <p className={styles.infoItemLabel}>Location</p>
                    <p className={styles.infoItemValue}>{(user as any).location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.infoActions}>
        <button 
          className={styles.infoActionBtn}
          onClick={() => window.print()}
        >
          🖨️ Print
        </button>
        <button 
          className={styles.infoActionBtn}
          onClick={() => {
            navigator.clipboard?.writeText(JSON.stringify(user, null, 2));
          }}
        >
          📋 Export
        </button>
      </div>
    </div>
  );
};