import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSubmission } from '../../api/assignments';
import type { Submission } from '../../types';
import styles from './SubmissionStatus.module.css';

export default function SubmissionStatus() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!submissionId) return;

    loadSubmission();
    const interval = setInterval(loadSubmission, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      const data = await getSubmission(submissionId!);
      setSubmission(data);
      // Stop polling if graded or failed
      if (data.submission_status === 'graded' || data.submission_status === 'failed') {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur de chargement');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !submission) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !submission) {
    return <div className={styles.error}>{error || 'Soumission introuvable'}</div>;
  }

  const statusSteps = ['pending', 'queued', 'grading', 'graded'];
  const currentIndex = statusSteps.indexOf(submission.submission_status);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>Statut de la soumission</h1>

        <div className={styles.progress}>
          {statusSteps.map((step, i) => (
            <div
              key={step}
              className={`${styles.step} ${
                i <= currentIndex ? styles.stepActive : ''
              } ${i === currentIndex ? styles.stepCurrent : ''}`}
            >
              <div className={styles.stepCircle}>{i + 1}</div>
              <div className={styles.stepLabel}>
                {step === 'pending' && 'En attente'}
                {step === 'queued' && 'En file'}
                {step === 'grading' && 'Correction'}
                {step === 'graded' && 'Terminé'}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Statut:</span>
            <StatusBadge status={submission.submission_status} />
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Dépôt:</span>
            <a href={submission.github_url} target="_blank" rel="noopener noreferrer">
              {submission.github_url}
            </a>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Branche:</span>
            <code>{submission.branch}</code>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Commit:</span>
            <code>{submission.commit_sha.slice(0, 7)}</code>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Soumis le:</span>
            <span>{new Date(submission.created_at).toLocaleString('fr-FR')}</span>
          </div>
        </div>

        {submission.submission_status === 'graded' && (
          <div className={styles.result}>
            <div className={styles.score}>
              🏆 {submission.score} / {(submission as any).max_score || 100}
            </div>
            {submission.feedback && (
              <div className={styles.feedback}>
                <h3>Feedback</h3>
                <p>{submission.feedback}</p>
              </div>
            )}
          </div>
        )}

        {submission.submission_status === 'failed' && (
          <div className={styles.failed}>
            <h3>❌ Échec de la correction</h3>
            {submission.feedback && <p>{submission.feedback}</p>}
          </div>
        )}

        {(submission.submission_status === 'pending' ||
          submission.submission_status === 'queued' ||
          submission.submission_status === 'grading') && (
          <div className={styles.polling}>
            <div className="spinner" />
            <p>Mise à jour automatique toutes les 5 secondes...</p>
          </div>
        )}
      </div>
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