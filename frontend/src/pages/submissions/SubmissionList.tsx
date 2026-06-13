import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMySubmissions } from '../../api/assignments';
import type { Submission } from '../../types';
import styles from './SubmissionList.module.css';

export default function SubmissionList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const data = await getMySubmissions();
      setSubmissions(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Mes soumissions</h1>
        <p>Historique de toutes vos soumissions</p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {submissions.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📤</div>
          <p>Vous n'avez encore soumis aucun devoir</p>
          <Link to="/courses" className={styles.cta}>
            Parcourir les cours
          </Link>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Date</span>
            <span>Devoir</span>
            <span>Statut</span>
            <span>Note</span>
          </div>
          {submissions.map((sub) => (
            <Link
              key={sub.id}
              to={`/submissions/${sub.id}`}
              className={styles.tableRow}
            >
              <span>{new Date(sub.created_at).toLocaleDateString('fr-FR')}</span>
              <span className={styles.assignment}>
                {(sub as any).assignment?.title || sub.assignment_id.slice(0, 8)}
              </span>
              <StatusBadge status={sub.submission_status} />
              <span className={styles.score}>
                {sub.score !== null && sub.score !== undefined
                  ? `${sub.score}/100`
                  : '—'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, { text: string; className: string }> = {
    pending: { text: 'En attente', className: 'badgePending' },
    queued: { text: 'En file', className: 'badgeQueued' },
    grading: { text: 'Correction', className: 'badgeGrading' },
    graded: { text: 'Corrigé', className: 'badgeGraded' },
    failed: { text: 'Échec', className: 'badgeFailed' },
  };
  const { text, className } = labels[status] || { text: status, className: 'badgePending' };
  return <span className={`${styles.badge} ${styles[className]}`}>{text}</span>;
}