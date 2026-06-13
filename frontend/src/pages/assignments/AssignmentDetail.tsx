import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssignment } from '../../api/assignments';
import type { Assignment, Submission } from '../../types';
import styles from './AssignmentDetail.module.css';

export default function AssignmentDetail() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assignmentId) loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      const data = await getAssignment(assignmentId!);
      setAssignment(data);
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

  if (error || !assignment) {
    return <div className={styles.error}>{error || 'Devoir introuvable'}</div>;
  }

  const submissions: Submission[] = (assignment as any).submissions || [];
  const isPastDue = new Date(assignment.due_date) < new Date();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.statusRow}>
          {assignment.is_published ? (
            <span className={styles.published}>Publié</span>
          ) : (
            <span className={styles.draft}>Brouillon</span>
          )}
          {isPastDue && <span className={styles.overdue}>Échu</span>}
        </div>
        <h1>{assignment.title}</h1>
        <div className={styles.meta}>
          <span>📅 Échéance: {new Date(assignment.due_date).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</span>
          <span>🏆 {assignment.max_score} points</span>
        </div>
      </header>

      {assignment.description && (
        <section className={styles.section}>
          <h2>Instructions</h2>
          <div className={styles.description}>{assignment.description}</div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Mes soumissions ({submissions.length})</h2>
          {!isPastDue && (
            <Link to={`/assignments/${assignment.id}/submit`} className={styles.submitBtn}>
              + Nouvelle soumission
            </Link>
          )}
        </div>

        {submissions.length === 0 ? (
          <div className={styles.empty}>
            <p>Aucune soumission pour le moment</p>
          </div>
        ) : (
          <div className={styles.submissions}>
            {submissions.map((sub) => (
              <Link
                key={sub.id}
                to={`/submissions/${sub.id}`}
                className={styles.submissionCard}
              >
                <div className={styles.submissionHeader}>
                  <span className={styles.submissionDate}>
                    {new Date(sub.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <StatusBadge status={sub.submission_status} />
                </div>
                <div className={styles.submissionMeta}>
                  <span>🔗 {sub.branch}</span>
                  <span>📝 {sub.commit_sha.slice(0, 7)}</span>
                  {sub.score !== null && sub.score !== undefined && (
                    <span className={styles.score}>🏆 {sub.score}/{assignment.max_score}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, { text: string; className: string }> = {
    pending: { text: 'En attente', className: 'badgePending' },
    queued: { text: 'En file', className: 'badgeQueued' },
    grading: { text: 'En cours de correction', className: 'badgeGrading' },
    graded: { text: 'Corrigé', className: 'badgeGraded' },
    failed: { text: 'Échec', className: 'badgeFailed' },
  };
  const { text, className } = labels[status] || { text: status, className: 'badgePending' };
  return <span className={`${styles.badge} ${styles[className]}`}>{text}</span>;
}