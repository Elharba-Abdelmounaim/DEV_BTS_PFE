// src/pages/submissions/ManualGradeForm.tsx
import { useState, useMemo } from 'react';
import { gradeSubmission } from '../../api/assignments';
import type { Submission } from '../../types';
import styles from './ManualGradeForm.module.css';

interface ManualGradeFormProps {
  submission: Submission;
  maxScore?: number;
  onSuccess?: (updated: Submission) => void;
  onCancel?: () => void;
  onSave?: (score: number, feedback: string) => Promise<void>;
}

export default function ManualGradeForm({
  submission,
  maxScore = 100,
  onSuccess,
  onCancel,
  onSave,
}: ManualGradeFormProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [score, setScore] = useState(submission.final_score ?? submission.score ?? 0);
  const [feedback, setFeedback] = useState(submission.teacher_feedback ?? submission.feedback ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  // ── Computed Values ──────────────────────────────────────────────────────
  const percentage = useMemo(() => {
    return (score / maxScore) * 100;
  }, [score, maxScore]);

  const color = useMemo(() => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 70) return '#3b82f6';
    if (percentage >= 60) return '#f59e0b';
    if (percentage >= 50) return '#f97316';
    return '#ef4444';
  }, [percentage]);

  const gradeLetter = useMemo(() => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }, [percentage]);

  const gradeLabel = useMemo(() => {
    if (percentage >= 90) return '🌟 Excellent';
    if (percentage >= 80) return '🌟 Very Good';
    if (percentage >= 70) return '📈 Good';
    if (percentage >= 60) return '📊 Satisfactory';
    if (percentage >= 50) return '📚 Needs Improvement';
    return '⚠️ Failing';
  }, [percentage]);

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid = useMemo(() => {
    return score >= 0 && score <= maxScore;
  }, [score, maxScore]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) {
      setError(`Score must be between 0 and ${maxScore}`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (onSave) {
        await onSave(score, feedback);
      } else {
        const updated = await gradeSubmission(submission.id, {
          final_score: score,
          teacher_feedback: feedback,
        });
        onSuccess?.(updated);
      }
      setSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save grade');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setScore(Math.max(0, Math.min(maxScore, val)));
    } else {
      setScore(0);
    }
    setTouched(true);
    setError(null);
  };

  const handleReset = () => {
    setScore(submission.final_score ?? submission.score ?? 0);
    setFeedback(submission.teacher_feedback ?? submission.feedback ?? '');
    setError(null);
    setSuccess(false);
    setTouched(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.panel}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>📝</span>
          <div>
            <h3 className={styles.headerTitle}>Manual Grading</h3>
            <p className={styles.headerSub}>
              Grade "{submission.assignment?.title || 'Assignment'}"
            </p>
          </div>
        </div>
        {onCancel && (
          <button onClick={onCancel} className={styles.closeBtn}>
            <span className={styles.closeIcon}>✕</span>
          </button>
        )}
      </div>

      {/* ── Success Message ───────────────────────────────────────────────── */}
      {success && (
        <div className={styles.successMessage}>
          <span className={styles.successIcon}>✅</span>
          <span className={styles.successText}>Grade saved successfully!</span>
        </div>
      )}

      {/* ── Error Message ────────────────────────────────────────────────── */}
      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>❌</span>
          <span className={styles.errorText}>{error}</span>
        </div>
      )}

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* ── Student Info ────────────────────────────────────────────────── */}
        <div className={styles.studentInfo}>
          <div className={styles.studentAvatar}>
            {submission.student?.first_name?.[0] || '👤'}
          </div>
          <div>
            <span className={styles.studentName}>
              {submission.student?.full_name || submission.student?.first_name || 'Student'}
            </span>
            <span className={styles.studentEmail}>
              {submission.student?.email || ''}
            </span>
          </div>
          <div className={styles.studentStatus}>
            <span className={`${styles.statusBadge} ${
              submission.submission_status === 'graded' ? styles.statusGraded : styles.statusPending
            }`}>
              {submission.submission_status === 'graded' ? '✅ Graded' : '⏳ Pending'}
            </span>
          </div>
        </div>

        {/* ── Score Section ────────────────────────────────────────────────── */}
        <div className={styles.scoreSection}>
          <div className={styles.scoreSectionHeader}>
            <label className={styles.scoreLabel}>
              Final Score <span className={styles.required}>*</span>
            </label>
            <span className={styles.scoreRange}>
              Range: 0 - {maxScore}
            </span>
          </div>

          <div className={styles.scoreDisplay}>
            <div className={styles.scoreInputWrapper}>
              <input
                type="number"
                value={score}
                onChange={handleScoreChange}
                className={`${styles.scoreInput} ${touched && !isValid ? styles.inputError : ''}`}
                min={0}
                max={maxScore}
                step={0.5}
                required
                disabled={loading}
              />
              <span className={styles.scoreMax}>/ {maxScore}</span>
            </div>
            <div className={styles.scoreBadge} style={{ backgroundColor: color + '20', color }}>
              <span className={styles.scoreLetter}>{gradeLetter}</span>
              <span className={styles.scoreLabel}>{gradeLabel}</span>
            </div>
          </div>

          {/* ── Progress Bar ───────────────────────────────────────────────── */}
          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(100, percentage)}%`, background: color }}
              />
            </div>
            <span className={styles.progressPercentage}>
              {Math.round(percentage)}%
            </span>
          </div>

          {/* ── Auto Score ────────────────────────────────────────────────── */}
          {submission.auto_grade_score !== null && submission.auto_grade_score !== undefined && (
            <div className={styles.autoScore}>
              <span className={styles.autoScoreIcon}>🤖</span>
              <span className={styles.autoScoreLabel}>Auto-grade:</span>
              <span className={styles.autoScoreValue}>
                {submission.auto_grade_score}/100
              </span>
              {submission.auto_grade_score !== score && (
                <span className={styles.autoScoreDiff}>
                  ({score - submission.auto_grade_score > 0 ? '+' : ''}
                  {Math.round(score - submission.auto_grade_score)})
                </span>
              )}
            </div>
          )}

          {touched && !isValid && (
            <span className={styles.fieldError}>
              Please enter a valid score between 0 and {maxScore}
            </span>
          )}
        </div>

        {/* ── Feedback Section ────────────────────────────────────────────── */}
        <div className={styles.feedbackSection}>
          <label className={styles.feedbackLabel}>
            💬 Teacher Feedback
            <span className={styles.feedbackOptional}>(optional)</span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className={styles.feedbackTextarea}
            rows={5}
            placeholder="Provide constructive feedback to help the student improve..."
            disabled={loading}
            maxLength={1000}
          />
          <div className={styles.feedbackCounter}>
            <span className={feedback.length > 900 ? styles.charWarning : ''}>
              {feedback.length}/1000
            </span>
            {feedback.length > 900 && (
              <span className={styles.charWarning}>⚠️ Almost at limit</span>
            )}
          </div>
        </div>

        {/* ── Quick Feedback Templates ────────────────────────────────────── */}
        <div className={styles.templates}>
          <span className={styles.templatesLabel}>Quick feedback:</span>
          <button
            type="button"
            className={styles.templateBtn}
            onClick={() => setFeedback('Excellent work! Keep up the great effort! 🌟')}
            disabled={loading}
          >
            🌟 Excellent
          </button>
          <button
            type="button"
            className={styles.templateBtn}
            onClick={() => setFeedback('Good work! Consider reviewing the feedback for improvement. 📈')}
            disabled={loading}
          >
            📈 Good
          </button>
          <button
            type="button"
            className={styles.templateBtn}
            onClick={() => setFeedback('Needs improvement. Please review the material and try again. 📚')}
            disabled={loading}
          >
            📚 Needs Improvement
          </button>
        </div>

        {/* ── Submission Details ───────────────────────────────────────────── */}
        <details className={styles.details}>
          <summary className={styles.detailsSummary}>
            <span className={styles.detailsIcon}>📋</span>
            View Submission Details
          </summary>
          <div className={styles.detailsContent}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Submission ID</span>
              <span className={styles.detailValue}>{submission.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Submitted</span>
              <span className={styles.detailValue}>
                {new Date(submission.submitted_at || submission.created_at).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {submission.is_late && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status</span>
                <span className={`${styles.detailValue} ${styles.detailLate}`}>⚠️ Late Submission</span>
              </div>
            )}
            {submission.github_repo_url && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Repository</span>
                <a 
                  href={submission.github_repo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.detailLink}
                >
                  🐙 {submission.github_repo_url.replace('https://github.com/', '')}
                </a>
              </div>
            )}
          </div>
        </details>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className={styles.actions}>
          <div className={styles.actionsLeft}>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleReset}
              disabled={loading}
            >
              <span className={styles.resetIcon}>↺</span>
              Reset
            </button>
          </div>
          <div className={styles.actionsRight}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={styles.cancelBtn}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={loading || !isValid}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Saving...
                </>
              ) : (
                <>
                  <span className={styles.saveIcon}>💾</span>
                  Save Grade
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}