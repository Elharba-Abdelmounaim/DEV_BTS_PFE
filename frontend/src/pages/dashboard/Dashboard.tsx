// src/pages/dashboard/Dashboard.tsx
import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourses } from '../../api/courses';
import { getMySubmissions } from '../../api/assignments';
import { getMyEnrollments } from '../../api/courses';
import { getCourseProgress } from '../../api/dashboard';
import {
  getTeacherStats,
  getStudentStats,
  type DashboardStats,
} from '../../api/dashboard';
import type { Course, Submission, Enrollment } from '../../types';
import styles from './Dashboard.module.css';

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icons = {
  Play: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="12" fill="#3b82f6" />
      <polygon points="10,8 16,12 10,16" fill="white" />
    </svg>
  ),
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
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="5 12 19 12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = '#3b82f6', loading = false }: { 
  label: string; 
  value: string | number; 
  icon: React.ComponentType;
  color?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className={styles.statCard}>
        <div className={styles.statCardIcon} style={{ backgroundColor: color + '15', color }}>
          <Icon />
        </div>
        <div className={styles.statCardContent}>
          <p className={styles.statCardValue}>...</p>
          <p className={styles.statCardLabel}>{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statCard}>
      <div className={styles.statCardIcon} style={{ backgroundColor: color + '15', color }}>
        <Icon />
      </div>
      <div className={styles.statCardContent}>
        <p className={styles.statCardValue}>{value}</p>
        <p className={styles.statCardLabel}>{label}</p>
      </div>
    </div>
  );
}

// ── Program Card (ديناميكي) ────────────────────────────────────────────────────
function ProgramCard({ 
  course, 
  progress,
  onContinue 
}: { 
  course: Course;
  progress?: { percent: number; completed: number; total: number };
  onContinue?: () => void;
}) {
  const isCompleted = progress?.percent === 100;
  const isInProgress = progress && progress.percent > 0 && progress.percent < 100;
  const isNotStarted = !progress || progress.percent === 0;

  const status = isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'not-started';
  const statusMap = {
    completed: { label: 'Completed ✅', color: '#22c55e', bg: '#dcfce7' },
    'in-progress': { label: `In Progress ${progress?.percent || 0}%`, color: '#3b82f6', bg: '#dbeafe' },
    'not-started': { label: 'Not Started', color: '#94a3b8', bg: '#f1f5f9' },
  };

  const statusInfo = statusMap[status];

  return (
    <div className={styles.programCard}>
      <div className={styles.programCardHeader}>
        <div className={styles.programCardIcon}>📚</div>
        <div className={styles.programCardInfo}>
          <h4 className={styles.programCardTitle}>{course.title}</h4>
          <p className={styles.programCardDesc}>
            {course.description || `${course.code} · ${course.credits} credits`}
          </p>
          {isInProgress && (
            <div className={styles.programCardProgress}>
              <div className={styles.programCardProgressBar}>
                <div 
                  className={styles.programCardProgressFill}
                  style={{ width: `${progress?.percent || 0}%` }}
                />
              </div>
              <span className={styles.programCardProgressText}>
                {progress?.completed || 0}/{progress?.total || 0} lessons
              </span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.programCardFooter}>
        <span className={styles.programCardStatus} style={{ 
          backgroundColor: statusInfo.bg, 
          color: statusInfo.color 
        }}>
          {statusInfo.label}
        </span>
        <button className={styles.programCardBtn} onClick={onContinue}>
          {isCompleted ? 'Continue →' : isInProgress ? 'Continue →' : 'Start →'}
        </button>
      </div>
    </div>
  );
}

// ── Recommended Program Card (ديناميكي) ──────────────────────────────────────
function RecommendedProgramCard({ course, onView, onEnroll }: { 
  course: Course;
  onView: () => void;
  onEnroll: () => void;
}) {
  return (
    <div className={styles.recommendedCard}>
      <div className={styles.recommendedCardHeader}>
        <span className={styles.recommendedCardIcon}>📖</span>
        <h4 className={styles.recommendedCardTitle}>{course.title}</h4>
      </div>
      <p className={styles.recommendedCardDesc}>
        {course.description || `${course.code} · ${course.credits} credits`}
      </p>
      <div className={styles.recommendedCardMeta}>
        <span>📅 {course.semester} {course.academic_year}</span>
        <span>📚 {course.credits} credits</span>
        <span>👥 {course.enrollments_count || 0} students</span>
      </div>
      <div className={styles.recommendedCardActions}>
        <button className={styles.recommendedCardView} onClick={onView}>
          View Details
        </button>
        <button className={styles.recommendedCardEnroll} onClick={onEnroll}>
          Enroll Now
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courseProgress, setCourseProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // ── Load Data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);

        // 1. Load all courses and user data
        const [coursesData, submissionsData, enrollmentsData] = await Promise.all([
          getCourses(),
          getMySubmissions().catch(() => []),
          getMyEnrollments().catch(() => []),
        ]);

        if (!isMounted) return;

        setCourses(coursesData);
        setSubmissions(submissionsData);
        setEnrollments(enrollmentsData);

        // Get enrolled course IDs
        const enrolledIds = new Set(enrollmentsData.map(e => e.course_id));
        const enrolled = coursesData.filter(c => enrolledIds.has(c.id));
        setEnrolledCourses(enrolled);

        // 2. Load stats
        const statsData = isTeacher
          ? await getTeacherStats()
          : await getStudentStats();

        if (!isMounted) return;
        setStats(statsData);

        // 3. Load progress for enrolled courses
        if (enrolled.length > 0) {
          const progressPromises = enrolled.slice(0, 4).map(c => 
            getCourseProgress(c.id).catch(() => null)
          );
          const progressData = await Promise.all(progressPromises);
          
          if (!isMounted) return;
          const progressMap: Record<string, any> = {};
          enrolled.slice(0, 4).forEach((c, i) => {
            if (progressData[i]) {
              progressMap[c.id] = progressData[i];
            }
          });
          setCourseProgress(progressMap);
        }

      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => { isMounted = false; };
  }, [isTeacher, isStudent]);

  // ── Computed values ──────────────────────────────────────────────────────────
  const completedCount = submissions.filter(s => s.submission_status === 'graded').length;
  const pendingCount = submissions.filter(s => s.submission_status === 'pending').length;
  const totalCourses = courses.length;

  // Enrolled courses for "Completed Programs" section
  const enrolledPrograms = enrolledCourses.slice(0, 4);

  // Recommended courses (not enrolled)
  const recommendedCourses = courses
    .filter(c => !enrollments.some(e => e.course_id === c.id))
    .slice(0, 3);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleEnroll = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleContinue = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.dashboard}>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>
              Welcome to the <span className={styles.heroHighlight}>eHub</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Your ALX Learning Journey Starts Here
            </p>
            <p className={styles.heroDescription}>
              Track your progress, achieve your goals.
            </p>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroGreeting}>
              <span className={styles.heroGreetingIcon}>👋</span>
              <div>
                <p className={styles.heroGreetingText}>Hello {user?.first_name || 'User'}!</p>
                <p className={styles.heroGreetingSub}>The future is yours to create. Let's get started!</p>
              </div>
            </div>
            <div className={styles.welcomeVideo}>
              <div className={styles.welcomeVideoPlaceholder}>
                <Icons.Play />
                <span>Welcome Video</span>
              </div>
              <p className={styles.welcomeVideoText}>
                This is your gateway to learning, community, and opportunity. Here, you can keep up with your learning through your personal profile and access the community. Connect, learn, and unleash your potential – all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Row ────────────────────────────────────────────────────────── */}
      <section className={styles.statsRow}>
        <StatCard 
          label="Total Courses" 
          value={stats?.coursesCount ?? totalCourses} 
          icon={Icons.Book} 
          color="#3b82f6" 
          loading={loading}
        />
        <StatCard 
          label="Submissions" 
          value={stats?.submissionsCount ?? submissions.length} 
          icon={Icons.Submission} 
          color="#8b5cf6" 
          loading={loading}
        />
        <StatCard 
          label="Completed" 
          value={stats?.gradedCount ?? completedCount} 
          icon={Icons.Grade} 
          color="#22c55e" 
          loading={loading}
        />
        <StatCard 
          label="Pending" 
          value={stats?.pendingCount ?? pendingCount} 
          icon={Icons.Pending} 
          color="#f59e0b" 
          loading={loading}
        />
      </section>

      {/* ── Completed Programs (ديناميكي) ────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {enrolledPrograms.length > 0 ? '📚 My Programs' : '📚 No Programs Yet'}
          </h2>
          {enrolledPrograms.length > 0 && (
            <Link to="/courses" className={styles.sectionLink}>View all →</Link>
          )}
        </div>

        {loading ? (
          <div className={styles.loadingGrid}>
            {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
          </div>
        ) : enrolledPrograms.length === 0 ? (
          <div className={styles.emptyPrograms}>
            <p className={styles.emptyProgramsText}>
              Explore a world of knowledge. Start your learning journey today!
            </p>
            <button 
              className={styles.emptyProgramsBtn}
              onClick={() => navigate('/courses')}
            >
              Apply to new programs
            </button>
          </div>
        ) : (
          <div className={styles.programGrid}>
            {enrolledPrograms.map(course => (
              <ProgramCard
                key={course.id}
                course={course}
                progress={courseProgress[course.id]}
                onContinue={() => handleContinue(course.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Recommended Programs (ديناميكي) ──────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🔥 Recommended Programs</h2>
          {recommendedCourses.length > 0 && (
            <Link to="/courses" className={styles.sectionLink}>View all →</Link>
          )}
        </div>

        {loading ? (
          <div className={styles.loadingGrid}>
            {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
          </div>
        ) : recommendedCourses.length === 0 ? (
          <div className={styles.emptyPrograms}>
            <p className={styles.emptyProgramsText}>
              You're enrolled in all available courses! Check back later for new programs.
            </p>
          </div>
        ) : (
          <div className={styles.recommendedGrid}>
            {recommendedCourses.map(course => (
              <RecommendedProgramCard
                key={course.id}
                course={course}
                onView={() => handleViewCourse(course.id)}
                onEnroll={() => handleEnroll(course.id)}
              />
            ))}
          </div>
        )}
      </section>

      
    </div>
  );
}