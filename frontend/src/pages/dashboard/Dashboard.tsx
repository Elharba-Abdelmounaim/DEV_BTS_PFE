import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourses } from '../../api/courses';
import { getMySubmissions } from '../../api/assignments';
import {
  getTeacherStats,
  getStudentStats,
  getRecentActivity,
  type DashboardStats,
  type RecentActivity,
} from '../../api/dashboard';
import type { Course, Submission } from '../../types';
import styles from './Dashboard.module.css';

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = false, icon }: {
  label:    string;
  value:    string | number;
  sub?:     string;
  accent?:  boolean;
  icon?:    string;
}) {
  return (
    <div className={`${styles.stat} ${accent ? styles.statAccent : ''}`}>
      <div className={styles.statHeader}>
        {icon && <span className={styles.statIcon}>{icon}</span>}
        <p className={styles.statLabel}>{label}</p>
      </div>
      <p className={styles.statValue}>{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  );
}

// ── Submission status badge ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Submission['submission_status'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:  { label: 'Pending',  cls: styles.badgePending },
    queued:   { label: 'Queued',   cls: styles.badgeQueued },
    grading:  { label: 'Grading…', cls: styles.badgeGrading },
    graded:   { label: 'Graded',   cls: styles.badgeGraded },
    failed:   { label: 'Failed',   cls: styles.badgeFailed },
  };
  const { label, cls } = map[status] ?? { label: status, cls: '' };
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}

// ── Activity type icon ─────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: RecentActivity['type'] }) {
  const icons: Record<string, string> = {
    submission: '📝',
    grade:      '✅',
    enrollment: '🎓',
    course:     '📚',
  };
  return <span className={styles.activityIcon}>{icons[type] ?? '•'}</span>;
}

// ── Activity type label ────────────────────────────────────────────────────────
function ActivityTypeLabel({ type }: { type: RecentActivity['type'] }) {
  const labels: Record<string, string> = {
    submission: 'Submission',
    grade:      'Grade',
    enrollment: 'Enrollment',
    course:     'Course',
  };
  return <span className={`${styles.activityType} ${styles[`type${type}`]}`}>{labels[type]}</span>;
}

// ── Skeleton loaders ───────────────────────────────────────────────────────────
function StatSkeleton() {
  return <div className={`${styles.stat} ${styles.skeletonStat}`} />;
}

function RowSkeleton() {
  return <div className={styles.skeletonRow} />;
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isTeacher, isStudent } = useAuth();

  const [courses,     setCourses]     = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats,       setStats]       = useState<DashboardStats | null>(null);
  const [activities,  setActivities]  = useState<RecentActivity[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        // Load everything in parallel
        const [coursesData, submissionsData] = await Promise.all([
          getCourses().then(d => d.slice(0, 6)),
          getMySubmissions().then(d => d.slice(0, 8)),
        ]);

        if (cancelled) return;
        setCourses(coursesData);
        setSubmissions(submissionsData);

        // Load stats based on role
        const statsData = isTeacher
          ? await getTeacherStats()
          : await getStudentStats();

        if (cancelled) return;
        setStats(statsData);

        // Load recent activity
        const activityData = await getRecentActivity(8);
        if (cancelled) return;
        setActivities(activityData);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load dashboard data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, [isTeacher, isStudent]);

  const graded = submissions.filter(s => s.submission_status === 'graded');
  const pending = submissions.filter(s => s.submission_status === 'pending');

  return (
    <div className={`${styles.root} page-enter`}>

      {/* Greeting */}
      <section className={styles.greeting}>
        <div>
          <h1 className={styles.greetTitle}>
            Hello, {user?.first_name ?? 'User'} 👋
          </h1>
          <p className={styles.greetSub}>
            {isTeacher
              ? 'Manage your courses and review student submissions.'
              : 'Track your progress, submit assignments, and stay on top of your courses.'}
          </p>
        </div>
        <div className={styles.greetingActions}>
          {stats && stats.unreadNotifications > 0 && (
            <Link to="/notifications" className={styles.notificationBadge}>
              🔔 {stats.unreadNotifications} new
            </Link>
          )}
          {isTeacher ? (
            <Link to="/courses/new" className={styles.primaryBtn}>
              + New course
            </Link>
          ) : (
            <Link to="/courses" className={styles.primaryBtn}>
              Browse courses
            </Link>
          )}
        </div>
      </section>

      {/* Error banner */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span> {error}
          <button onClick={() => window.location.reload()} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* Stats row */}
      <section className={styles.statsRow}>
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Courses"
              value={stats?.coursesCount ?? courses.length}
              sub={isTeacher ? 'you teach' : 'enrolled'}
              icon="📚"
            />

            <StatCard
              label="Submissions"
              value={stats?.submissionsCount ?? submissions.length}
              sub="total"
              icon="📝"
            />

            {isStudent && (
              <>
                <StatCard
                  label="Avg Score"
                  value={stats?.avgScore !== null ? `${stats?.avgScore}/100` : '—'}
                  sub="across graded"
                  accent
                  icon="⭐"
                />
                <StatCard
                  label="Pending"
                  value={stats?.pendingCount ?? pending.length}
                  sub="to grade"
                  icon="⏳"
                />
              </>
            )}

            {isTeacher && (
              <>
                <StatCard
                  label="Graded"
                  value={stats?.gradedCount ?? graded.length}
                  sub={`of ${stats?.submissionsCount ?? submissions.length}`}
                  accent
                  icon="✅"
                />
                <StatCard
                  label="Pending"
                  value={stats?.pendingCount ?? pending.length}
                  sub="to review"
                  icon="⏳"
                />
              </>
            )}
          </>
        )}
      </section>

      <div className={styles.columns}>

        {/* ── Left column ─────────────────────────────────────────────────────── */}
        <div className={styles.leftCol}>

          {/* Your courses */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                {isTeacher ? 'Your courses' : 'My courses'}
              </h2>
              <Link to="/courses" className={styles.seeAll}>See all →</Link>
            </div>

            {loading ? (
              <div className={styles.loadingList}>
                {[1,2,3].map(i => <RowSkeleton key={i} />)}
              </div>
            ) : courses.length === 0 ? (
              <div className={styles.empty}>
                <p>{isTeacher ? 'No courses yet.' : 'Not enrolled in any courses.'}</p>
                <Link to={isTeacher ? '/courses/new' : '/courses'} className={styles.emptyLink}>
                  {isTeacher ? 'Create your first course →' : 'Browse courses →'}
                </Link>
              </div>
            ) : (
              <ul className={styles.courseList}>
                {courses.map(course => (
                  <li key={course.id}>
                    <Link to={`/courses/${course.id}`} className={styles.courseRow}>
                      <div className={styles.courseCode}>{course.code}</div>
                      <div className={styles.courseInfo}>
                        <p className={styles.courseTitle}>{course.title}</p>
                        <p className={styles.courseMeta}>
                          {course.semester} {course.academic_year} · {course.credits} credits
                        </p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                        className={styles.arrowIcon}>
                        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Recent submissions */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                {isTeacher ? 'Recent submissions' : 'My submissions'}
              </h2>
              <Link to="/submissions" className={styles.seeAll}>See all →</Link>
            </div>

            {loading ? (
              <div className={styles.loadingList}>
                {[1,2,3].map(i => <RowSkeleton key={i} />)}
              </div>
            ) : submissions.length === 0 ? (
              <div className={styles.empty}>
                <p>No submissions yet.</p>
                {isStudent && (
                  <Link to="/courses" className={styles.emptyLink}>
                    Find assignments to submit →
                  </Link>
                )}
              </div>
            ) : (
              <ul className={styles.subList}>
                {submissions.map(sub => (
                  <li key={sub.id}>
                    <Link to={`/submissions/${sub.id}`} className={styles.subRow}>
                      <div className={styles.subInfo}>
                        <p className={styles.subTitle}>
                          {sub.assignment?.title ?? 'Assignment'}
                        </p>
                        <p className={styles.subMeta}>
                          {new Date(sub.submitted_at || sub.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {sub.is_late && <span className={styles.lateBadge}>Late</span>}
                        </p>
                      </div>
                      <div className={styles.subRight}>
                        <StatusBadge status={sub.submission_status} />
                        {sub.final_score !== null && sub.final_score !== undefined && (
                          <span className={`${styles.score} ${
                            (Number(sub.final_score) >= 80) ? styles.scoreHigh :
                            (Number(sub.final_score) >= 60) ? styles.scoreMid : styles.scoreLow
                          }`}>
                            {sub.final_score}/100
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ── Right column ────────────────────────────────────────────────────── */}
        <div className={styles.rightCol}>

          {/* Recent activity */}
          <section className={`${styles.section} ${styles.activitySection}`}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Recent activity</h2>
            </div>

            {loading ? (
              <div className={styles.loadingList}>
                {[1,2,3,4].map(i => <RowSkeleton key={i} />)}
              </div>
            ) : activities.length === 0 ? (
              <div className={styles.empty}>
                <p>No recent activity.</p>
              </div>
            ) : (
              <ul className={styles.activityList}>
                {activities.map(act => (
                  <li key={act.id}>
                    {act.link ? (
                      <Link to={act.link} className={styles.activityRow}>
                        <ActivityIcon type={act.type} />
                        <div className={styles.activityContent}>
                          <p className={styles.activityTitle}>{act.title}</p>
                          <p className={styles.activityDesc}>{act.description}</p>
                          <p className={styles.activityTime}>
                            {new Date(act.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <ActivityTypeLabel type={act.type} />
                      </Link>
                    ) : (
                      <div className={styles.activityRow}>
                        <ActivityIcon type={act.type} />
                        <div className={styles.activityContent}>
                          <p className={styles.activityTitle}>{act.title}</p>
                          <p className={styles.activityDesc}>{act.description}</p>
                          <p className={styles.activityTime}>
                            {new Date(act.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <ActivityTypeLabel type={act.type} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quick actions */}
          <section className={`${styles.section} ${styles.quickActions}`}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Quick actions</h2>
            </div>
            <div className={styles.actionGrid}>
              {isTeacher ? (
                <>
                  <Link to="/courses/new" className={styles.actionCard}>
                    <span className={styles.actionIcon}>➕</span>
                    <span className={styles.actionLabel}>New course</span>
                  </Link>
                  <Link to="/submissions" className={styles.actionCard}>
                    <span className={styles.actionIcon}>📋</span>
                    <span className={styles.actionLabel}>Review submissions</span>
                  </Link>
                  <Link to="/courses" className={styles.actionCard}>
                    <span className={styles.actionIcon}>⚙️</span>
                    <span className={styles.actionLabel}>Manage courses</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/courses" className={styles.actionCard}>
                    <span className={styles.actionIcon}>🔍</span>
                    <span className={styles.actionLabel}>Browse courses</span>
                  </Link>
                  <Link to="/submissions" className={styles.actionCard}>
                    <span className={styles.actionIcon}>📤</span>
                    <span className={styles.actionLabel}>My submissions</span>
                  </Link>
                  <Link to="/notifications" className={styles.actionCard}>
                    <span className={styles.actionIcon}>🔔</span>
                    <span className={styles.actionLabel}>Notifications</span>
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}