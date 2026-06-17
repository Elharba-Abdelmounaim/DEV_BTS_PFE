// src/pages/profile/components/ProfileStats.tsx
import React from 'react';
import type { ProfileStats } from '../../../types';
import styles from '../Profile.module.css';

interface ProfileStatsProps {
  stats: ProfileStats | null;
  loading: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.statCardSkeleton} />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.emptyText}>No stats available</p>
        </div>
      </div>
    );
  }

  const progressPercent = stats.totalLessons > 0
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
    : 0;

  // تحديد مستوى الأداء
  const getPerformanceLevel = (score: number | null) => {
    if (score === null) return { label: 'Not graded', emoji: '📊', color: '#94a3b8' };
    if (score >= 90) return { label: 'Outstanding', emoji: '🏆', color: '#22c55e' };
    if (score >= 80) return { label: 'Excellent', emoji: '🌟', color: '#22c55e' };
    if (score >= 70) return { label: 'Good', emoji: '📈', color: '#3b82f6' };
    if (score >= 60) return { label: 'Fair', emoji: '📊', color: '#f59e0b' };
    return { label: 'Needs Improvement', emoji: '📚', color: '#ef4444' };
  };

  const performance = getPerformanceLevel(stats.averageScore);

  const statItems = [
    {
      label: 'Courses Enrolled',
      value: stats.totalCourses,
      icon: '📚',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      sub: stats.totalCourses > 0 ? `${stats.totalCourses} active courses` : 'No courses yet',
      trend: stats.totalCourses > 0 ? '↑' : '—',
    },
    {
      label: 'Submissions',
      value: stats.totalSubmissions,
      icon: '📝',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      sub: stats.totalSubmissions > 0 ? `${stats.totalSubmissions} total submitted` : 'No submissions yet',
      trend: stats.totalSubmissions > 0 ? '✓' : '—',
    },
    {
      label: 'Average Score',
      value: stats.averageScore !== null ? `${stats.averageScore}%` : '—',
      icon: '⭐',
      color: performance.color,
      bgColor: stats.averageScore !== null ? '#fef3c7' : '#f1f5f9',
      sub: stats.averageScore !== null ? performance.emoji + ' ' + performance.label : 'No graded submissions',
      trend: stats.averageScore !== null ? (stats.averageScore >= 70 ? '↑' : '↓') : '—',
    },
    {
      label: 'Progress',
      value: `${progressPercent}%`,
      icon: '🎯',
      color: '#22c55e',
      bgColor: '#f0fdf4',
      sub: `${stats.completedLessons}/${stats.totalLessons} lessons completed`,
      trend: progressPercent > 0 ? '↗' : '—',
    },
  ];

  return (
    <div className={styles.statsContainer}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statItems.map((item, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <div 
                className={styles.statIcon} 
                style={{ backgroundColor: item.bgColor, color: item.color }}
              >
                {item.icon}
              </div>
              {item.trend !== '—' && (
                <span 
                  className={`${styles.statTrend} ${
                    item.trend === '↑' || item.trend === '↗' ? styles.trendUp : 
                    item.trend === '↓' ? styles.trendDown : styles.trendNeutral
                  }`}
                >
                  {item.trend}
                </span>
              )}
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statValue}>{item.value}</p>
              <p className={styles.statLabel}>{item.label}</p>
              {item.sub && <p className={styles.statSub}>{item.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      {stats.totalLessons > 0 && (
        <div className={styles.progressOverview}>
          <div className={styles.progressHeader}>
            <div className={styles.progressTitleGroup}>
              <span className={styles.progressIcon}>📊</span>
              <span className={styles.progressLabel}>Learning Progress</span>
            </div>
            <div className={styles.progressStats}>
              <span className={styles.progressPercentage}>{progressPercent}%</span>
              <span className={styles.progressComplete}>
                {stats.completedLessons}/{stats.totalLessons}
              </span>
            </div>
          </div>
          <div className={styles.progressTrack}>
            <div 
              className={styles.progressFill} 
              style={{ 
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, #3b82f6, ${progressPercent > 70 ? '#22c55e' : progressPercent > 40 ? '#f59e0b' : '#ef4444'})`
              }}
            />
          </div>
          <div className={styles.progressDetails}>
            <span>✅ {stats.completedLessons} completed</span>
            <span>⏳ {stats.totalLessons - stats.completedLessons} remaining</span>
            <span className={styles.progressStatus}>
              {progressPercent === 100 ? '🎉 Complete!' : 
               progressPercent > 70 ? '🚀 Almost there!' : 
               progressPercent > 40 ? '💪 Keep going!' : 
               '🌟 Start your journey!'}
            </span>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className={styles.achievements}>
        <div className={styles.achievementsHeader}>
          <h4 className={styles.achievementsTitle}>🏆 Achievements</h4>
          <span className={styles.achievementsCount}>
            {[
              stats.totalSubmissions >= 1,
              stats.totalSubmissions >= 10,
              stats.averageScore !== null && stats.averageScore >= 80,
              stats.totalCourses >= 3,
              stats.totalCourses >= 5,
            ].filter(Boolean).length} unlocked
          </span>
        </div>
        <div className={styles.achievementGrid}>
          {stats.totalSubmissions >= 1 && (
            <div className={`${styles.achievementBadge} ${styles.achievementUnlocked}`}>
              <span className={styles.achievementEmoji}>🎯</span>
              <div>
                <span className={styles.achievementName}>First Submission</span>
                <span className={styles.achievementDesc}>Completed your first assignment</span>
              </div>
            </div>
          )}
          {stats.totalSubmissions >= 10 && (
            <div className={`${styles.achievementBadge} ${styles.achievementUnlocked}`}>
              <span className={styles.achievementEmoji}>🏅</span>
              <div>
                <span className={styles.achievementName}>10 Submissions</span>
                <span className={styles.achievementDesc}>Submitted 10+ assignments</span>
              </div>
            </div>
          )}
          {stats.averageScore !== null && stats.averageScore >= 80 && (
            <div className={`${styles.achievementBadge} ${styles.achievementUnlocked}`}>
              <span className={styles.achievementEmoji}>🌟</span>
              <div>
                <span className={styles.achievementName}>Top Performer</span>
                <span className={styles.achievementDesc}>Average score 80%+</span>
              </div>
            </div>
          )}
          {stats.totalCourses >= 3 && (
            <div className={`${styles.achievementBadge} ${styles.achievementUnlocked}`}>
              <span className={styles.achievementEmoji}>📚</span>
              <div>
                <span className={styles.achievementName}>3+ Courses</span>
                <span className={styles.achievementDesc}>Enrolled in 3+ courses</span>
              </div>
            </div>
          )}
          {stats.totalCourses >= 5 && (
            <div className={`${styles.achievementBadge} ${styles.achievementUnlocked}`}>
              <span className={styles.achievementEmoji}>🎓</span>
              <div>
                <span className={styles.achievementName}>5+ Courses</span>
                <span className={styles.achievementDesc}>Enrolled in 5+ courses</span>
              </div>
            </div>
          )}
          
          {/* Locked achievements (shown as placeholder) */}
          {stats.totalSubmissions < 1 && (
            <div className={`${styles.achievementBadge} ${styles.achievementLocked}`}>
              <span className={styles.achievementEmoji}>🔒</span>
              <div>
                <span className={styles.achievementName}>First Submission</span>
                <span className={styles.achievementDesc}>Submit your first assignment</span>
              </div>
            </div>
          )}
          {stats.totalSubmissions < 10 && stats.totalSubmissions >= 1 && (
            <div className={`${styles.achievementBadge} ${styles.achievementLocked}`}>
              <span className={styles.achievementEmoji}>🔒</span>
              <div>
                <span className={styles.achievementName}>10 Submissions</span>
                <span className={styles.achievementDesc}>{10 - stats.totalSubmissions} more to go!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;