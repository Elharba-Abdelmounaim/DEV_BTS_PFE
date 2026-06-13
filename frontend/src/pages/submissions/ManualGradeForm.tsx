import { useState } from 'react';
import { gradeSubmission } from '../../api/assignments';
import type { Submission } from '../../types';
import styles from './ManualGradeForm.module.css';

interface ManualGradeFormProps {
  submission: Submission;
  maxScore?: number;
  onSuccess?: (updated: Submission) => void;
  onCancel?: () => void;
  // Backward compatibility
  onSave?: (score: number, feedback: string) => Promise<void>;
}

export default function ManualGradeForm({
  submission,
  maxScore = 100,
  onSuccess,
  onCancel,
  onSave,
}: ManualGradeFormProps) {
  const [score, setScore] = useState(submission.final_score ?? submission.score ?? 0);
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [loading, setLoading] = useState(false);

  const percentage = (score / maxScore) * 100;
  const color = percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (onSave) {
        await onSave(score, feedback);
      } else {
        const updated = await gradeSubmission(submission.id, {
          final_score: score,
          feedback,
        });
        onSuccess?.(updated);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Correction manuelle</h3>
        {onCancel && (
          <button onClick={onCancel} className={styles.closeBtn}>✕</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.scoreSection}>
          <label>Note finale</label>
          <div className={styles.scoreDisplay}>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(Math.max(0, Math.min(maxScore, parseInt(e.target.value) || 0)))}
              className={styles.scoreInput}
              min={0}
              max={maxScore}
            />
            <span className={styles.scoreMax}>/ {maxScore}</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${percentage}%`, background: color }}
            />
          </div>
          {submission.auto_grade_score !== null && submission.auto_grade_score !== undefined && (
            <small className={styles.autoScore}>
              Note automatique: {submission.auto_grade_score}/100
            </small>
          )}
        </div>

        <div className={styles.field}>
          <label>Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={6}
            placeholder="Commentaire pour l'étudiant..."
          />
        </div>

        <div className={styles.actions}>
          {onCancel && (
            <button type="button" onClick={onCancel} className={styles.cancelBtn}>
              Annuler
            </button>
          )}
          <button type="submit" disabled={loading} className={styles.saveBtn}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}