import { useEffect, useState, useRef } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/assignments';
import type { Notification } from '../../types';
import styles from './NotificationPanel.module.css';

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className={styles.panel} ref={panelRef}>
      <button
        className={styles.bell}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className={styles.markAll}>
                Tout marquer lu
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.loading}>Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className={styles.empty}>Aucune notification</div>
          ) : (
            <div className={styles.list}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`${styles.item} ${!n.read_at ? styles.unread : ''}`}
                  onClick={() => !n.read_at && handleMarkRead(n.id)}
                >
                  <div className={styles.itemTitle}>{n.title}</div>
                  <div className={styles.itemMessage}>{n.message}</div>
                  <div className={styles.itemDate}>
                    {new Date(n.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}