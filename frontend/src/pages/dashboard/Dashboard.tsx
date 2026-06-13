import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourses } from '../../api/courses';
import { getMySubmissions } from '../../api/assignments';
import type { Course, Submission } from '../../types';
import styles from './Dashboard.module.css';

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = false }: {
  label:    string;
  value:    string | number;
  sub?:     string;
  accent?:  boolean;
}) {
  return (
    <div className={`${styles.stat} ${accent ? styles.statAccent : ''}`}>
      <p className={styles.statLabel}>{label}</p>
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

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isTeacher } = useAuth();

  const [courses,     setCourses]     = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getCourses().then(d => setCourses(d.slice(0, 4))),
      getMySubmissions().then(d => setSubmissions(d.slice(0, 5))),
    ]).finally(() => setLoading(false));
  }, []);

  const graded   = submissions.filter(s => s.submission_status === 'graded');
  const avgScore = graded.length
    ? Math.round(graded.reduce((sum, s) => sum + (s.score ?? 0), 0) / graded.length)
    : null;

  return (
    <div className={`${styles.root} page-enter`}>

      {/* Greeting */}
      <section className={styles.greeting}>
        <div>
          <h1 className={styles.greetTitle}>
            Hello, {user?.first_name} 👋
          </h1>
          <p className={styles.greetSub}>
            {isTeacher
              ? 'Manage your courses and review student submissions.'
              : 'Track your progress and submit your assignments.'}
          </p>
        </div>
        {isTeacher ? (
          <Link to="/courses/new" className={styles.primaryBtn}>
            + New course
          </Link>
        ) : (
          <Link to="/courses" className={styles.primaryBtn}>
            Browse courses
          </Link>
        )}
      </section>

      {/* Stats row */}
      <section className={styles.statsRow}>
        <StatCard
          label="Courses"
          value={loading ? '—' : courses.length}
          sub={isTeacher ? 'you teach' : 'enrolled'}
        />
        {!isTeacher && (
          <>
            <StatCard
              label="Submissions"
              value={loading ? '—' : submissions.length}
              sub="total"
            />
            <StatCard
              label="Avg score"
              value={loading ? '—' : avgScore !== null ? `${avgScore}/100` : '—'}
              sub="across graded"
              accent
            />
            <StatCard
              label="Graded"
              value={loading ? '—' : graded.length}
              sub={`of ${submissions.length}`}
            />
          </>
        )}
        {isTeacher && (
          <StatCard
            label="Total submissions"
            value={loading ? '—' : submissions.length}
            sub="across all courses"
          />
        )}
      </section>

      <div className={styles.columns}>

        {/* Recent courses */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              {isTeacher ? 'Your courses' : 'My courses'}
            </h2>
            <Link to="/courses" className={styles.seeAll}>See all →</Link>
          </div>

          {loading ? (
            <div className={styles.loadingList}>
              {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
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
              {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : submissions.length === 0 ? (
            <div className={styles.empty}>
              <p>No submissions yet.</p>
            </div>
          ) : (
            <ul className={styles.subList}>
              {submissions.map(sub => (
                <li key={sub.id}>
                  <Link to={`/submissions/${sub.id}`} className={styles.subRow}>
                    <div className={styles.subInfo}>
                      <p className={styles.subTitle}>
                        {(sub as any).assignment?.title ?? 'Assignment'}
                      </p>
                      <p className={styles.subMeta}>
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={styles.subRight}>
                      <StatusBadge status={sub.submission_status} />
                      {sub.score !== null && sub.score !== undefined && (
                        <span className={styles.score}>{sub.score}/100</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </div>
  );
}