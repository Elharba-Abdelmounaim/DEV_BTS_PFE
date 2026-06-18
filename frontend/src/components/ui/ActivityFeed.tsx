import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecentActivity, RecentActivity } from '../../api/dashboard';
import styles from './ActivityFeed.module.css';

export function ActivityFeed() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentActivity(10).then(data => {
      setActivities(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading activity...</div>;
  }

  if (activities.length === 0) {
    return <div className={styles.empty}>No recent activity found.</div>;
  }

  const typeIcons = {
    submission: '📝',
    grade: '✅',
    enrollment: '🎓',
    course: '📚',
  };

  return (
    <div className={styles.feed}>
      {activities.map(activity => (
        <div key={activity.id} className={styles.item}>
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>{typeIcons[activity.type] || '📌'}</span>
            <div className={styles.connector} />
          </div>
          <div className={styles.content}>
            <p className={styles.title}>
              {activity.link ? (
                <Link to={activity.link}>{activity.title}</Link>
              ) : (
                activity.title
              )}
            </p>
            <p className={styles.description}>{activity.description}</p>
            <p className={styles.time}>
              {new Date(activity.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}