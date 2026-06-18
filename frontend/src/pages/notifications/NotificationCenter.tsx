import { useState, useEffect } from 'react';
import client from '../../api/client';
import { Notification } from '../../types';
import { useToast } from '../../context/ToastContext';
import styles from './NotificationCenter.module.css';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await client.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      addToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await client.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (err) {
      addToast('Error marking as read', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await client.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      addToast('All marked as read', 'success');
    } catch (err) {
      addToast('Error marking all as read', 'error');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading notifications...</div>;
  }

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Notification Center</h2>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={styles.emptyState}>No notifications yet</div>
      ) : (
        <div className={styles.list}>
          {notifications.map(n => (
            <div 
              key={n.id} 
              className={`${styles.notification} ${n.read_at ? styles.read : styles.unread}`}
              onClick={() => !n.read_at && markAsRead(n.id)}
            >
              <div className={styles.icon}>🔔</div>
              <div className={styles.content}>
                <h4>{n.title}</h4>
                <p>{n.message}</p>
                <span>{new Date(n.created_at).toLocaleString()}</span>
              </div>
              {!n.read_at && <div className={styles.unreadDot} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}