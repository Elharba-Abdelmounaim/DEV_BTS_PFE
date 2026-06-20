// src/pages/assignments/AssignmentDetailPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assignmentsApi, submissionsApi } from '../../api/assignments';
import { getMySubmissions } from '../../api/assignments';
import type { Assignment, Submission } from '../../types';
import styles from './AssignmentDetailPage.module.css';

// ── Icons ──────────────────────────────────────────────────────────────────
const Icons = {
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Score: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  File: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
};

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'draft' | 'published' | 'overdue' }) {
  const statusMap = {
    draft: { label: '📝 Draft', color: '#94a3b8', bg: '#f1f5f9' },
    published: { label: '✅ Published', color: '#22c55e', bg: '#dcfce7' },
    overdue: { label: '⚠️ Overdue', color: '#ef4444', bg: '#fee2e2' },
  };

  const info = statusMap[status] || statusMap.draft;

  return (
    <span className={styles.statusBadge} style={{ backgroundColor: info.bg, color: info.color }}>
      {info.label}
    </span>
  );
}

// ── Stat Item ──────────────────────────────────────────────────────────────────
function StatItem({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType }) {
  return (
    <div className={styles.statItem}>
      <div className={styles.statItemIcon}>
        <Icon />
      </div>
      <div className={styles.statItemInfo}>
        <span className={styles.statItemValue}>{value}</span>
        <span className={styles.statItemLabel}>{label}</span>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { isTeacher, isStudent } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userSubmission, setUserSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load Data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (assignmentId) {
      loadData();
    }
  }, [assignmentId]);

  const loadData = async () => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      setError(null);

      // Load assignment
      const data = await assignmentsApi.get(assignmentId);
      setAssignment(data);

      // Load submissions for teacher or student
      if (isTeacher) {
        const subs = await submissionsApi.byAssignment(assignmentId);
        setSubmissions(subs);
      } else if (isStudent) {
        const mySubs = await getMySubmissions();
        const userSub = mySubs.find(s => s.assignment_id === assignmentId);
        if (userSub) {
          setUserSubmission(userSub);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  // ── Computed Values ──────────────────────────────────────────────────────────
  const isPastDue = useMemo(() => {
    if (!assignment) return false;
    return new Date(assignment.due_date) < new Date();
  }, [assignment]);

  const daysUntilDue = useMemo(() => {
    if (!assignment) return 0;
    const diff = new Date(assignment.due_date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [assignment]);

  const hasSubmitted = !!userSubmission;
  const isGraded = userSubmission?.submission_status === 'graded';
  const userScore = userSubmission?.final_score ?? userSubmission?.score;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading assignment...</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !assignment) {
    return (
      <div className={styles.errorContainer}>
        <span className={styles.errorIcon}>😕</span>
        <h2 className={styles.errorTitle}>Assignment not found</h2>
        <p className={styles.errorText}>{error || 'The assignment you are looking for does not exist.'}</p>
        <Link to="/assignments" className={styles.errorBackLink}>
          ← Back to Assignments
        </Link>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className={styles.breadcrumb}>
        <Link to="/assignments" className={styles.breadcrumbLink}>
          Assignments
        </Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span className={styles.breadcrumbCurrent}>{assignment.title}</span>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{assignment.title}</h1>
            <div className={styles.subtitle}>
              {assignment.course?.title && (
                <span className={styles.courseName}>
                  📚 {assignment.course.title}
                </span>
              )}
              <span className={styles.assignmentCode}>
                {assignment.course?.code}
              </span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <StatusBadge 
              status={isPastDue ? 'overdue' : assignment.is_published ? 'published' : 'draft'} 
            />
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div className={styles.statsRow}>
          <StatItem 
            label="Max Score" 
            value={`${assignment.max_score} pts`} 
            icon={Icons.Score}
          />
          <StatItem 
            label="Due Date" 
            value={new Date(assignment.due_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })} 
            icon={Icons.Calendar}
          />
          <StatItem 
            label={isPastDue ? 'Overdue' : 'Time Left'} 
            value={isPastDue ? '⏰ Overdue' : `${daysUntilDue} days`} 
            icon={Icons.Clock}
          />
          {isStudent && (
            <StatItem 
              label="Your Status" 
              value={hasSubmitted ? (isGraded ? '✅ Graded' : '📤 Submitted') : '⏳ Not Submitted'} 
              icon={hasSubmitted ? (isGraded ? Icons.CheckCircle : Icons.File) : Icons.User}
            />
          )}
        </div>

        {/* ── User Score (if graded) ──────────────────────────────────────── */}
        {isStudent && isGraded && userScore !== null && userScore !== undefined && (
          <div className={styles.scoreCard}>
            <div className={styles.scoreCardContent}>
              <span className={styles.scoreCardLabel}>Your Score</span>
              <span className={`${styles.scoreCardValue} ${userScore >= (assignment.max_score * 0.7) ? styles.scoreHigh : userScore >= (assignment.max_score * 0.5) ? styles.scoreMid : styles.scoreLow}`}>
                {userScore}/{assignment.max_score}
              </span>
            </div>
            {userSubmission?.teacher_feedback && (
              <div className={styles.scoreCardFeedback}>
                <span className={styles.feedbackLabel}>💬 Feedback</span>
                <p className={styles.feedbackText}>{userSubmission.teacher_feedback}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className={styles.content}>
        {/* ── Description ────────────────────────────────────────────────── */}
        <div className={styles.descriptionSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📖</span>
            Description
          </h2>
          <div className={styles.descriptionContent}>
            {assignment.description ? (
              <p>{assignment.description}</p>
            ) : (
              <p className={styles.emptyText}>No description provided for this assignment.</p>
            )}
          </div>
        </div>

        {/* ── Additional Info ────────────────────────────────────────────── */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>📋 Details</h3>
            <div className={styles.infoCardContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Course</span>
                <span className={styles.infoValue}>{assignment.course?.title || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Due Date</span>
                <span className={`${styles.infoValue} ${isPastDue ? styles.infoOverdue : ''}`}>
                  {new Date(assignment.due_date).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {isPastDue && <span className={styles.overdueTag}> Overdue</span>}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Points</span>
                <span className={styles.infoValue}>{assignment.max_score} points</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Status</span>
                <span className={`${styles.infoValue} ${assignment.is_published ? styles.infoPublished : styles.infoDraft}`}>
                  {assignment.is_published ? '✅ Published' : '📝 Draft'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Created</span>
                <span className={styles.infoValue}>
                  {new Date(assignment.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* ── Actions ────────────────────────────────────────────────────── */}
          <div className={styles.actionsCard}>
            <h3 className={styles.infoCardTitle}>⚡ Actions</h3>
            <div className={styles.actions}>
              {isStudent && !hasSubmitted && !isPastDue && (
                <Link 
                  to={`/assignments/${assignmentId}/submit`}
                  className={styles.submitBtn}
                >
                  <span className={styles.btnIcon}>📤</span>
                  Submit Assignment
                </Link>
              )}
              {isStudent && hasSubmitted && !isGraded && (
                <div className={styles.submittedInfo}>
                  <span className={styles.submittedIcon}>📤</span>
                  <div>
                    <span className={styles.submittedTitle}>Submitted</span>
                    <span className={styles.submittedDate}>
                      {userSubmission?.submitted_at 
                        ? new Date(userSubmission.submitted_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Recently'
                      }
                    </span>
                  </div>
                  <span className={styles.submittedStatus}>⏳ Awaiting Review</span>
                </div>
              )}
              {isStudent && hasSubmitted && isGraded && (
                <div className={styles.gradedInfo}>
                  <span className={styles.gradedIcon}>✅</span>
                  <div>
                    <span className={styles.gradedTitle}>Graded</span>
                    <span className={styles.gradedScore}>
                      Score: {userScore}/{assignment.max_score}
                    </span>
                  </div>
                </div>
              )}
              {isStudent && isPastDue && !hasSubmitted && (
                <div className={styles.overdueWarning}>
                  <span className={styles.overdueWarningIcon}>⚠️</span>
                  <div>
                    <span className={styles.overdueWarningTitle}>Past Due</span>
                    <span className={styles.overdueWarningText}>
                      This assignment is overdue. You can no longer submit.
                    </span>
                  </div>
                </div>
              )}
              {isTeacher && (
                <>
                  <Link 
                    to={`/assignments/${assignmentId}/submissions`}
                    className={styles.reviewBtn}
                  >
                    <span className={styles.btnIcon}>👀</span>
                    Review Submissions ({submissions.length})
                  </Link>
                  <Link 
                    to={`/assignments/${assignmentId}/edit`}
                    className={styles.editBtn}
                  >
                    <span className={styles.btnIcon}>✏️</span>
                    Edit Assignment
                  </Link>
                </>
              )}
            </div>

            {/* ── Submissions Stats (Teacher) ────────────────────────────── */}
            {isTeacher && submissions.length > 0 && (
              <div className={styles.submissionsStats}>
                <div className={styles.submissionsStat}>
                  <span className={styles.submissionsStatValue}>{submissions.length}</span>
                  <span className={styles.submissionsStatLabel}>Total</span>
                </div>
                <div className={styles.submissionsStat}>
                  <span className={styles.submissionsStatValue}>
                    {submissions.filter(s => s.submission_status === 'graded').length}
                  </span>
                  <span className={styles.submissionsStatLabel}>Graded</span>
                </div>
                <div className={styles.submissionsStat}>
                  <span className={styles.submissionsStatValue}>
                    {submissions.filter(s => s.submission_status === 'pending').length}
                  </span>
                  <span className={styles.submissionsStatLabel}>Pending</span>
                </div>
                <div className={styles.submissionsStat}>
                  <span className={styles.submissionsStatValue}>
                    {submissions.filter(s => s.is_late).length}
                  </span>
                  <span className={styles.submissionsStatLabel}>Late</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Submissions (Teacher) ────────────────────────────────── */}
        {isTeacher && submissions.length > 0 && (
          <div className={styles.recentSubmissions}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📋</span>
              Recent Submissions
            </h3>
            <div className={styles.submissionsTable}>
              <div className={styles.submissionsTableHeader}>
                <span>Student</span>
                <span>Submitted</span>
                <span>Status</span>
                <span>Score</span>
                <span>Action</span>
              </div>
              {submissions.slice(0, 5).map(sub => (
                <Link 
                  key={sub.id}
                  to={`/submissions/${sub.id}`}
                  className={styles.submissionsTableRow}
                >
                  <span className={styles.submissionStudent}>
                    {sub.student?.first_name} {sub.student?.last_name}
                  </span>
                  <span className={styles.submissionDate}>
                    {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : '—'}
                  </span>
                  <span className={`${styles.submissionStatus} ${
                    sub.submission_status === 'graded' ? styles.statusGraded :
                    sub.submission_status === 'pending' ? styles.statusPending :
                    styles.statusQueued
                  }`}>
                    {sub.submission_status === 'graded' ? '✅ Graded' :
                     sub.submission_status === 'pending' ? '⏳ Pending' :
                     '📤 Queued'}
                  </span>
                  <span className={styles.submissionScore}>
                    {sub.final_score !== null && sub.final_score !== undefined 
                      ? `${sub.final_score}/${assignment.max_score}`
                      : '—'}
                  </span>
                  <span className={styles.submissionAction}>
                    View →
                  </span>
                </Link>
              ))}
              {submissions.length > 5 && (
                <Link 
                  to={`/assignments/${assignmentId}/submissions`}
                  className={styles.viewAllBtn}
                >
                  View all {submissions.length} submissions →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}