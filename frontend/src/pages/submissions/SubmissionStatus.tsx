// src/pages/submissions/SubmissionStatus.tsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSubmission } from '../../api/assignments';
import type { Submission } from '../../types';
import styles from './SubmissionStatus.module.css';

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Submission['submission_status'] }) {
  const statusMap: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    pending: { label: 'Pending Review', icon: '⏳', color: '#d97706', bg: '#fef3c7' },
    queued: { label: 'Queued', icon: '📤', color: '#3b82f6', bg: '#dbeafe' },
    grading: { label: 'Grading...', icon: '⚡', color: '#4f46e5', bg: '#e0e7ff' },
    graded: { label: 'Graded ✓', icon: '✅', color: '#16a34a', bg: '#dcfce7' },
    failed: { label: 'Failed ✗', icon: '❌', color: '#dc2626', bg: '#fee2e2' },
  };

  const info = statusMap[status] || statusMap.pending;

  return (
    <span 
      className={styles.statusBadge}
      style={{ backgroundColor: info.bg, color: info.color }}
    >
      <span className={styles.statusIcon}>{info.icon}</span>
      {info.label}
    </span>
  );
}

// ── Step Component ────────────────────────────────────────────────────────────
function Step({ 
  label, 
  icon, 
  active, 
  current, 
  completed 
}: { 
  label: string; 
  icon: string; 
  active: boolean; 
  current: boolean; 
  completed: boolean;
}) {
  return (
    <div className={`${styles.step} ${active ? styles.stepActive : ''} ${completed ? styles.stepCompleted : ''}`}>
      <div className={`${styles.stepCircle} ${current ? styles.stepCircleCurrent : ''} ${completed ? styles.stepCircleCompleted : ''}`}>
        {completed ? '✓' : icon}
      </div>
      <span className={styles.stepLabel}>{label}</span>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function SubmissionStatus() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { isTeacher } = useAuth();

  // State
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // ── Load Submission ──────────────────────────────────────────────────────
  const loadSubmission = useCallback(async () => {
    if (!submissionId) return;

    try {
      const data = await getSubmission(submissionId);
      setSubmission(data);
      
      // Stop polling if graded or failed
      if (data.submission_status === 'graded' || data.submission_status === 'failed') {
        setPolling(false);
      }
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load submission');
      setPolling(false);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  // ── Initial Load & Polling ─────────────────────────────────────────────
  useEffect(() => {
    if (!submissionId) {
      setError('No submission ID provided');
      setLoading(false);
      return;
    }

    loadSubmission();

    // Poll every 5 seconds if not complete
    const interval = setInterval(() => {
      if (polling) {
        loadSubmission();
        setTimeElapsed(prev => prev + 5);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [submissionId, loadSubmission, polling]);

  // ── Status Steps ────────────────────────────────────────────────────────
  const steps = [
    { key: 'pending', label: 'Submitted', icon: '📤' },
    { key: 'queued', label: 'Queued', icon: '⏳' },
    { key: 'grading', label: 'Grading', icon: '⚡' },
    { key: 'graded', label: 'Complete', icon: '✅' },
  ];

  const currentIndex = useMemo(() => {
    if (!submission) return 0;
    const index = steps.findIndex(s => s.key === submission.submission_status);
    return index >= 0 ? index : 0;
  }, [submission]);

  const isComplete = submission?.submission_status === 'graded';
  const isFailed = submission?.submission_status === 'failed';
  const isProcessing = submission && !isComplete && !isFailed;

  // ── Format Date ──────────────────────────────────────────────────────────
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading && !submission) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading submission...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !submission) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>😕</span>
          <h2 className={styles.errorTitle}>Submission not found</h2>
          <p className={styles.errorText}>{error || 'The submission you are looking for does not exist.'}</p>
          <Link to="/submissions" className={styles.errorBackLink}>
            ← Back to Submissions
          </Link>
        </div>
      </div>
    );
  }

  // ── Score Display ──────────────────────────────────────────────────────
  const finalScore = submission.final_score ?? submission.auto_grade_score ?? null;
  const maxScore = submission.assignment?.max_score || 100;
  const scorePercentage = finalScore !== null ? (finalScore / maxScore) * 100 : null;
  const isPassing = scorePercentage !== null && scorePercentage >= 60;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <Link to="/submissions" className={styles.backLink}>
          ← Back to Submissions
        </Link>
        <h1 className={styles.title}>📊 Submission Status</h1>
        <p className={styles.subtitle}>
          {submission.assignment?.title || 'Assignment'}
        </p>
      </div>

      {/* ── Main Card ────────────────────────────────────────────────────── */}
      <div className={styles.card}>

        {/* ── Status Header ────────────────────────────────────────────── */}
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <span className={styles.cardIcon}>📝</span>
            <div>
              <h2 className={styles.cardTitle}>
                {submission.assignment?.title || 'Assignment'}
              </h2>
              <p className={styles.cardCourse}>
                {submission.assignment?.course?.title || 'No course'}
              </p>
            </div>
          </div>
          <div className={styles.cardHeaderRight}>
            <StatusBadge status={submission.submission_status} />
            {isComplete && (
              <span className={styles.gradeBadge}>
                {finalScore !== null ? `${finalScore}/${maxScore}` : 'Graded'}
              </span>
            )}
          </div>
        </div>

        {/* ── Progress Steps ────────────────────────────────────────────── */}
        <div className={styles.progressSteps}>
          {steps.map((step, index) => (
            <Step
              key={step.key}
              label={step.label}
              icon={step.icon}
              active={index <= currentIndex}
              current={index === currentIndex}
              completed={index < currentIndex}
            />
          ))}
        </div>

        {/* ── Status Messages ────────────────────────────────────────────── */}
        {isComplete && (
          <div className={styles.completeMessage}>
            <span className={styles.completeIcon}>🎉</span>
            <div>
              <h3 className={styles.completeTitle}>Submission Complete!</h3>
              <p className={styles.completeText}>
                Your assignment has been graded. Check your score below.
              </p>
            </div>
          </div>
        )}

        {isFailed && (
          <div className={styles.failedMessage}>
            <span className={styles.failedIcon}>❌</span>
            <div>
              <h3 className={styles.failedTitle}>Grading Failed</h3>
              <p className={styles.failedText}>
                There was an error processing your submission. Please contact your instructor.
              </p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className={styles.processingMessage}>
            <span className={styles.processingIcon}>⏳</span>
            <div>
              <h3 className={styles.processingTitle}>Processing Submission</h3>
              <p className={styles.processingText}>
                Your submission is being reviewed. This may take a few minutes.
              </p>
              <div className={styles.processingSpinner}>
                <div className={styles.spinner} />
                <span className={styles.processingTime}>
                  Waiting {Math.floor(timeElapsed / 60)}m {timeElapsed % 60}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Result Section ────────────────────────────────────────────── */}
        {isComplete && finalScore !== null && (
          <div className={styles.resultSection}>
            <div className={styles.scoreCard}>
              <div className={styles.scoreCircle}>
                <span className={styles.scoreCircleValue}>{Math.round(scorePercentage!)}%</span>
                <span className={styles.scoreCircleLabel}>Score</span>
              </div>
              <div className={styles.scoreDetails}>
                <div className={styles.scoreDetail}>
                  <span className={styles.scoreDetailLabel}>Final Score</span>
                  <span className={`${styles.scoreDetailValue} ${isPassing ? styles.passing : styles.failing}`}>
                    {finalScore}/{maxScore}
                  </span>
                </div>
                <div className={styles.scoreDetail}>
                  <span className={styles.scoreDetailLabel}>Grade</span>
                  <span className={`${styles.gradeLetter} ${isPassing ? styles.gradePassing : styles.gradeFailing}`}>
                    {scorePercentage! >= 90 ? 'A+' :
                     scorePercentage! >= 80 ? 'A' :
                     scorePercentage! >= 70 ? 'B' :
                     scorePercentage! >= 60 ? 'C' :
                     scorePercentage! >= 50 ? 'D' : 'F'}
                  </span>
                </div>
                {submission.auto_grade_score !== null && submission.auto_grade_score !== undefined && (
                  <div className={styles.scoreDetail}>
                    <span className={styles.scoreDetailLabel}>Auto-grade</span>
                    <span className={styles.scoreDetailValue}>
                      {submission.auto_grade_score}/100
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Feedback ────────────────────────────────────────────────── */}
            {submission.teacher_feedback && (
              <div className={styles.feedbackSection}>
                <h4 className={styles.feedbackTitle}>💬 Teacher Feedback</h4>
                <p className={styles.feedbackText}>{submission.teacher_feedback}</p>
              </div>
            )}

            {submission.teacher_feedback && (
              <div className={styles.actions}>
                {isTeacher && (
                  <Link 
                    to={`/submissions/${submissionId}/grade`} 
                    className={styles.editGradeBtn}
                  >
                    ✏️ Edit Grade
                  </Link>
                )}
                <Link to={`/assignments/${submission.assignment?.id}`} className={styles.viewAssignmentBtn}>
                  📝 View Assignment
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── Submission Details ────────────────────────────────────────── */}
        <details className={styles.details}>
          <summary className={styles.detailsSummary}>
            <span className={styles.detailsIcon}>📋</span>
            View Submission Details
            <span className={styles.detailsChevron}>▼</span>
          </summary>
          <div className={styles.detailsContent}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Submission ID</span>
              <span className={styles.detailValue}>{submission.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Submitted</span>
              <span className={styles.detailValue}>{formatDate(submission.submitted_at || submission.created_at)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Student</span>
              <span className={styles.detailValue}>
                {submission.student?.full_name || submission.student?.first_name || 'Unknown'}
              </span>
            </div>
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
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Branch</span>
              <span className={styles.detailValue}>
                <code className={styles.detailCode}>{submission.github_branch || 'main'}</code>
              </span>
            </div>
            {submission.github_commit_sha && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Commit</span>
                <span className={styles.detailValue}>
                  <code className={styles.detailCode}>{submission.github_commit_sha.slice(0, 7)}</code>
                  {submission.github_commit_sha.length > 7 && (
                    <span className={styles.detailFullSha}> ({submission.github_commit_sha})</span>
                  )}
                </span>
              </div>
            )}
            {submission.is_late && (
              <div className={`${styles.detailRow} ${styles.detailRowWarning}`}>
                <span className={styles.detailLabel}>⚠️ Status</span>
                <span className={`${styles.detailValue} ${styles.detailLate}`}>Late Submission</span>
              </div>
            )}
          </div>
        </details>

        {/* ── Footer Actions ────────────────────────────────────────────── */}
        <div className={styles.footerActions}>
          <Link to="/submissions" className={styles.footerBtn}>
            📤 All Submissions
          </Link>
          {submission.assignment && (
            <Link to={`/assignments/${submission.assignment.id}`} className={styles.footerBtn}>
              📝 View Assignment
            </Link>
          )}
          {isTeacher && isComplete && (
            <Link to={`/submissions/${submissionId}/grade`} className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}>
              ✏️ Edit Grade
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}