// src/pages/dashboard/Dashboard.tsx
import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourses } from '../../api/courses';
import { getMySubmissions } from '../../api/assignments';
import {
  getTeacherStats,
  getStudentStats,
  getRecentActivity,
  getCourseProgress,
  type DashboardStats,
  type RecentActivity,
} from '../../api/dashboard';
import type { Course, Submission } from '../../types';
import styles from './Dashboard.module.css';

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icons = {
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round"/>
    </svg>
  ),
  Submission: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
    </svg>
  ),
  Grade: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Pending: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 6 15 12 9 18"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Progress: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 12l4-4M12 12v8"/>
    </svg>
  ),
};

// ── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ 
  label, 
  value, 
  sub, 
  icon: Icon, 
  color = 'blue',
  loading = false 
}: { 
  label: string; 
  value: string | number; 
  sub?: string; 
  icon: React.ComponentType;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}) {
  const colorMap = {
    blue: styles.statBlue,
    green: styles.statGreen,
    purple: styles.statPurple,
    orange: styles.statOrange,
    red: styles.statRed,
  };

  if (loading) {
    return (
      <div className={`${styles.stat} ${styles.statLoading}`}>
        <div className={styles.statSkeleton} />
      </div>
    );
  }

  return (
    <div className={`${styles.stat} ${colorMap[color]}`}>
      <div className={styles.statIconWrapper}>
        <Icon />
      </div>
      <div className={styles.statContent}>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
        {sub && <p className={styles.statSub}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Progress Card ──────────────────────────────────────────────────────────────
function ProgressCard({ 
  course, 
  progress 
}: { 
  course: Course; 
  progress: { completed: number; total: number; percent: number };
}) {
  const navigate = useNavigate();
  
  return (
    <div 
      className={styles.progressCard}
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className={styles.progressHeader}>
        <h4 className={styles.progressTitle}>{course.title}</h4>
        <span className={styles.progressCode}>{course.code}</span>
      </div>
      <div className={styles.progressBarWrapper}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className={styles.progressFooter}>
        <span className={styles.progressText}>
          {progress.completed}/{progress.total} lessons
        </span>
        <span className={styles.progressPercent}>{progress.percent}%</span>
      </div>
    </div>
  );
}

// ── Submission Row ─────────────────────────────────────────────────────────────
function SubmissionRow({ submission }: { submission: Submission }) {
  const statusMap = {
    pending: { label: 'Pending Review', cls: styles.statusPending },
    queued: { label: 'Queued', cls: styles.statusQueued },
    grading: { label: 'Grading...', cls: styles.statusGrading },
    graded: { label: 'Graded ✓', cls: styles.statusGraded },
    failed: { label: 'Failed ✗', cls: styles.statusFailed },
  };

  const status = statusMap[submission.submission_status] || statusMap.pending;

  return (
    <Link to={`/submissions/${submission.id}`} className={styles.submissionRow}>
      <div className={styles.submissionInfo}>
        <p className={styles.submissionTitle}>
          {submission.assignment?.title || 'Assignment'}
        </p>
        <div className={styles.submissionMeta}>
          <span className={styles.submissionDate}>
            {new Date(submission.submitted_at || submission.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {submission.is_late && (
            <span className={styles.lateBadge}>Late</span>
          )}
        </div>
      </div>
      <div className={styles.submissionStatus}>
        <span className={`${styles.statusBadge} ${status.cls}`}>
          {status.label}
        </span>
        {submission.final_score !== null && submission.final_score !== undefined && (
          <span className={styles.submissionScore}>
            {submission.final_score}/100
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Activity Item ──────────────────────────────────────────────────────────────
function ActivityItem({ activity }: { activity: RecentActivity }) {
  const typeIcons = {
    submission: '📝',
    grade: '✅',
    enrollment: '🎓',
    course: '📚',
  };

  return (
    <div className={styles.activityItem}>
      <span className={styles.activityIcon}>
        {typeIcons[activity.type] || '📌'}
      </span>
      <div className={styles.activityContent}>
        <p className={styles.activityTitle}>{activity.title}</p>
        <p className={styles.activityDesc}>{activity.description}</p>
        <span className={styles.activityTime}>
          {new Date(activity.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        // 1. Load courses and submissions
        const [coursesData, submissionsData] = await Promise.all([
          getCourses(),
          getMySubmissions(),
        ]);

        if (!isMounted) return;
        setCourses(coursesData.slice(0, 4));
        setSubmissions(submissionsData.slice(0, 5));

        // 2. Load stats based on role
        const statsData = isTeacher
          ? await getTeacherStats()
          : await getStudentStats();

        if (!isMounted) return;
        setStats(statsData);

        // 3. Load progress for each course (student only)
        if (isStudent && coursesData.length > 0) {
          const progressPromises = coursesData.slice(0, 3).map(c => 
            getCourseProgress(c.id).catch(() => null)
          );
          const progressData = await Promise.all(progressPromises);
          
          if (!isMounted) return;
          const progressMap: Record<string, any> = {};
          coursesData.slice(0, 3).forEach((c, i) => {
            if (progressData[i]) {
              progressMap[c.id] = progressData[i];
            }
          });
          setCourseProgress(progressMap);
        }

        // 4. Load recent activity
        const activityData = await getRecentActivity(6);
        if (!isMounted) return;
        setActivities(activityData);

      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load dashboard');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    // ── Auto-refresh every 30 seconds ──────────────────────────────────────
    const interval = setInterval(loadDashboard, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isTeacher, isStudent]);

  // ── Computed values ──────────────────────────────────────────────────────────
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return submissions
      .filter(s => s.assignment?.due_date && new Date(s.assignment.due_date) > now)
      .sort((a, b) => 
        new Date(a.assignment!.due_date).getTime() - 
        new Date(b.assignment!.due_date).getTime()
      )
      .slice(0, 3);
  }, [submissions]);

  const pendingCount = stats ? (stats.pendingCount ?? 
    submissions.filter(s => s.submission_status === 'pending').length) : 0;

  const gradedCount = stats ? (stats.gradedCount ??
    submissions.filter(s => s.submission_status === 'graded').length) : 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.dashboard}>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              {isTeacher ? '👨‍🏫 Teacher' : '🎓 Student'}
            </div>
            <h1 className={styles.heroTitle}>
              Welcome back, <span className={styles.heroName}>{user?.first_name || 'User'}</span>
            </h1>
            <p className={styles.heroSub}>
              {isTeacher
                ? 'Manage your courses, review submissions, and track student progress.'
                : 'Continue learning, submit assignments, and track your progress.'}
            </p>
            
            {/* Quick stats inline */}
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>
                  {stats?.coursesCount ?? courses.length}
                </span>
                <span className={styles.heroStatLabel}>Courses</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>
                  {stats?.submissionsCount ?? submissions.length}
                </span>
                <span className={styles.heroStatLabel}>Submissions</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>
                  {stats ? (stats.avgScore !== null ? `${stats.avgScore}%` : '—') : '—'}
                </span>
                <span className={styles.heroStatLabel}>Avg Score</span>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            {stats && stats.unreadNotifications > 0 && (
              <Link to="/notifications" className={styles.notificationBell}>
                <span className={styles.bellIcon}>🔔</span>
                <span className={styles.bellCount}>{stats.unreadNotifications}</span>
                <span className={styles.bellLabel}>New notifications</span>
              </Link>
            )}
            <div className={styles.heroActions}>
              <button 
                className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
                onClick={() => navigate(isTeacher ? '/courses/new' : '/courses')}
              >
                {isTeacher ? '+ Create Course' : 'Browse Courses →'}
              </button>
              <button 
                className={`${styles.heroBtn} ${styles.heroBtnSecondary}`}
                onClick={() => navigate('/submissions')}
              >
                View Submissions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Error Banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <section className={styles.statsGrid}>
        <StatCard
          label="Total Courses"
          value={stats?.coursesCount ?? courses.length}
          icon={Icons.Book}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Submissions"
          value={stats?.submissionsCount ?? submissions.length}
          icon={Icons.Submission}
          color="purple"
          loading={loading}
        />
        <StatCard
          label="Graded"
          value={gradedCount}
          icon={Icons.Grade}
          color="green"
          loading={loading}
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          icon={Icons.Pending}
          color="orange"
          loading={loading}
        />
      </section>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className={styles.mainGrid}>

        {/* ── Left Column ────────────────────────────────────────────────── */}
        <div className={styles.leftColumn}>

          {/* Course Progress (Student) */}
          {isStudent && courses.length > 0 && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📊 Your Progress</h3>
                <Link to="/courses" className={styles.cardLink}>View all →</Link>
              </div>
              <div className={styles.progressList}>
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className={styles.progressSkeleton} />
                  ))
                ) : (
                  courses.slice(0, 3).map(course => {
                    const progress = courseProgress[course.id];
                    return progress ? (
                      <ProgressCard 
                        key={course.id}
                        course={course}
                        progress={{
                          completed: progress.completed_lessons || 0,
                          total: progress.total_lessons || 1,
                          percent: progress.percent || 0,
                        }}
                      />
                    ) : (
                      <div key={course.id} className={styles.progressCard}>
                        <div className={styles.progressHeader}>
                          <h4 className={styles.progressTitle}>{course.title}</h4>
                          <span className={styles.progressCode}>{course.code}</span>
                        </div>
                        <div className={styles.progressBarWrapper}>
                          <div className={styles.progressBar} style={{ width: '0%' }} />
                        </div>
                        <div className={styles.progressFooter}>
                          <span className={styles.progressText}>Not started</span>
                          <span className={styles.progressPercent}>0%</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* Upcoming Deadlines */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>⏰ Upcoming Deadlines</h3>
              <Link to="/submissions" className={styles.cardLink}>View all →</Link>
            </div>
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className={styles.deadlineSkeleton} />
              ))
            ) : upcomingDeadlines.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>No upcoming deadlines 🎉</p>
                <p className={styles.emptySub}>You're all caught up!</p>
              </div>
            ) : (
              <ul className={styles.deadlineList}>
                {upcomingDeadlines.map(sub => (
                  <li key={sub.id} className={styles.deadlineItem}>
                    <Link to={`/submissions/${sub.id}`} className={styles.deadlineLink}>
                      <div className={styles.deadlineInfo}>
                        <p className={styles.deadlineTitle}>
                          {sub.assignment?.title || 'Assignment'}
                        </p>
                        <p className={styles.deadlineCourse}>
                          {sub.assignment?.course?.title || 'Course'}
                        </p>
                      </div>
                      <div className={styles.deadlineDate}>
                        <Icons.Calendar />
                        <span>
                          {new Date(sub.assignment!.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ── Right Column ────────────────────────────────────────────────── */}
        <div className={styles.rightColumn}>

          {/* Recent Submissions */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>📝 Recent Submissions</h3>
              <Link to="/submissions" className={styles.cardLink}>View all →</Link>
            </div>
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className={styles.submissionSkeleton} />
              ))
            ) : submissions.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>No submissions yet</p>
                <p className={styles.emptySub}>
                  {isTeacher 
                    ? 'Students haven\'t submitted anything yet' 
                    : 'Start by enrolling in a course'}
                </p>
              </div>
            ) : (
              <ul className={styles.submissionList}>
                {submissions.slice(0, 4).map(sub => (
                  <SubmissionRow key={sub.id} submission={sub} />
                ))}
              </ul>
            )}
          </section>

          {/* Recent Activity */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>🔄 Recent Activity</h3>
            </div>
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className={styles.activitySkeleton} />
              ))
            ) : activities.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>No recent activity</p>
              </div>
            ) : (
              <ul className={styles.activityList}>
                {activities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </ul>
            )}
          </section>

          {/* Quick Actions */}
          <section className={`${styles.card} ${styles.quickActions}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>⚡ Quick Actions</h3>
            </div>
            <div className={styles.actionGrid}>
              {isTeacher ? (
                <>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => navigate('/courses/new')}
                  >
                    <span className={styles.actionIcon}>➕</span>
                    New Course
                  </button>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => navigate('/submissions')}
                  >
                    <span className={styles.actionIcon}>📋</span>
                    Review
                  </button>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => navigate('/courses')}
                  >
                    <span className={styles.actionIcon}>⚙️</span>
                    Manage
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => navigate('/courses')}
                  >
                    <span className={styles.actionIcon}>🔍</span>
                    Explore
                  </button>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => navigate('/submissions')}
                  >
                    <span className={styles.actionIcon}>📤</span>
                    Submit
                  </button>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => navigate('/notifications')}
                  >
                    <span className={styles.actionIcon}>🔔</span>
                    Alerts
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}