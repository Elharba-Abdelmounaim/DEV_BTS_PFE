// src/pages/courses/CourseDetail.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCourse, deleteCourse, enrollInCourse, getMyEnrollments } from '../../api/courses';
import { assignmentsApi } from '../../api/assignments';
import type { Course, Assignment, Enrollment } from '../../types';
import styles from './CourseDetail.module.css';

// ── Types ────────────────────────────────────────────────────────────────────
type TabType = 'overview' | 'assignments' | 'lessons' | 'students';

// ── Tab Button Component ────────────────────────────────────────────────────
const TabButton: React.FC<{
  tab: TabType;
  active: TabType;
  onClick: () => void;
  icon: string;
  label: string;
  count?: number;
}> = ({ tab, active, onClick, icon, label, count }) => (
  <button
    className={`${styles.tabBtn} ${active === tab ? styles.tabBtnActive : ''}`}
    onClick={onClick}
    aria-selected={active === tab}
    role="tab"
  >
    <span className={styles.tabIcon}>{icon}</span>
    {label}
    {count !== undefined && count > 0 && (
      <span className={styles.tabCount}>{count}</span>
    )}
  </button>
);

// ── Assignment Card Component ──────────────────────────────────────────────
const AssignmentCard: React.FC<{ 
  assignment: Assignment;
  isTeacher: boolean;
}> = ({ assignment, isTeacher }) => {
  const isPastDue = new Date(assignment.due_date) < new Date();
  const daysUntilDue = Math.ceil(
    (new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Link to={`/assignments/${assignment.id}`} className={styles.assignmentCard}>
      <div className={styles.assignmentCardHeader}>
        <div className={styles.assignmentCardLeft}>
          <div className={styles.assignmentIcon}>
            {assignment.is_published ? '📄' : '📝'}
          </div>
          <div>
            <h4 className={styles.assignmentTitle}>{assignment.title}</h4>
            {assignment.description && (
              <p className={styles.assignmentDesc}>{assignment.description}</p>
            )}
          </div>
        </div>
        <div className={styles.assignmentCardBadges}>
          {isTeacher && (
            <Link 
              to={`/assignments/${assignment.id}/submissions`}
              className={styles.viewSubmissionsBtn}
              onClick={(e) => e.stopPropagation()}
            >
              👀 View
            </Link>
          )}
          <span className={`${styles.assignmentStatus} ${
            assignment.is_published ? styles.statusPublished : styles.statusDraft
          }`}>
            {assignment.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      <div className={styles.assignmentCardFooter}>
        <div className={styles.assignmentMeta}>
          <span className={styles.assignmentMetaItem}>
            <span className={styles.metaIcon}>📅</span>
            {isPastDue ? (
              <span className={styles.overdue}>Overdue</span>
            ) : daysUntilDue <= 3 ? (
              <span className={styles.soon}>⚠️ {daysUntilDue} days left</span>
            ) : (
              <span>{daysUntilDue} days left</span>
            )}
          </span>
          <span className={styles.assignmentMetaItem}>
            <span className={styles.metaIcon}>🎯</span>
            {assignment.max_score} pts
          </span>
          <span className={styles.assignmentMetaItem}>
            <span className={styles.metaIcon}>📆</span>
            {new Date(assignment.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
        <span className={styles.assignmentArrow}>→</span>
      </div>
    </Link>
  );
};

// ── Stat Box Component ──────────────────────────────────────────────────────
const StatBox: React.FC<{ value: string | number; label: string; icon?: string }> = ({ 
  value, 
  label,
  icon 
}) => (
  <div className={styles.statBox}>
    {icon && <span className={styles.statIcon}>{icon}</span>}
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

// ── Main Component ──────────────────────────────────────────────────────────
export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Computed Values ──────────────────────────────────────────────────────
  const isTeaching = course?.instructor_id === user?.id;
  const isEnrolled = useMemo(() => {
    return enrollments.some(e => e.course_id === courseId);
  }, [enrollments, courseId]);

  const publishedAssignments = useMemo(() => {
    return assignments.filter(a => a.is_published);
  }, [assignments]);

  const totalStudents = course?.enrollments_count || 0;

  // ── Load Data ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const [courseData, assignmentsData, enrollmentsData] = await Promise.all([
        getCourse(courseId),
        assignmentsApi.byCourse(courseId).catch(() => [] as Assignment[]),
        getMyEnrollments().catch(() => [] as Enrollment[]),
      ]);

      setCourse(courseData);
      setAssignments(assignmentsData);
      setEnrollments(enrollmentsData);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!courseId) return;
    try {
      setEnrolling(true);
      await enrollInCourse(courseId);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleDelete = async () => {
    if (!courseId) return;
    try {
      await deleteCourse(courseId);
      navigate('/courses');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete course');
      setShowDeleteModal(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading course...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !course) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>😕</span>
          <h2 className={styles.errorTitle}>Course not found</h2>
          <p className={styles.errorText}>{error || 'The course you are looking for does not exist.'}</p>
          <Link to="/courses" className={styles.errorBackLink}>
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link to="/courses" className={styles.backLink}>
            <span className={styles.backArrow}>←</span> All Courses
          </Link>
          <div className={styles.headerActions}>
            {isTeaching && (
              <>
                <Link 
                  to={`/courses/${courseId}/edit`} 
                  className={`${styles.headerBtn} ${styles.editBtn}`}
                >
                  ✏️ Edit
                </Link>
                <button 
                  className={`${styles.headerBtn} ${styles.deleteBtn}`}
                  onClick={() => setShowDeleteModal(true)}
                >
                  🗑️ Delete
                </button>
              </>
            )}
            {!isTeaching && !isEnrolled && (
              <button
                className={`${styles.headerBtn} ${styles.enrollBtn}`}
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? (
                  <>
                    <span className={styles.spinner} />
                    Enrolling...
                  </>
                ) : (
                  '📚 Enroll Now'
                )}
              </button>
            )}
            {isEnrolled && !isTeaching && (
              <span className={styles.enrolledBadge}>
                ✅ Enrolled
              </span>
            )}
            {isTeaching && (
              <span className={styles.teacherBadge}>
                👨‍🏫 Teaching
              </span>
            )}
          </div>
        </div>

        <div className={styles.headerMain}>
          <div className={styles.headerMainLeft}>
            <div className={styles.courseCodeBadge}>
              {course.code}
            </div>
            <h1 className={styles.courseTitle}>{course.title}</h1>
            <p className={styles.courseDescription}>
              {course.description || 'No description available'}
            </p>
            <div className={styles.courseMeta}>
              <span className={styles.metaItem}>
                <span className={styles.metaIcon}>📅</span>
                {course.semester} {course.academic_year}
              </span>
              <span className={styles.metaItem}>
                <span className={styles.metaIcon}>🎓</span>
                {course.credits} Credits
              </span>
              <span className={styles.metaItem}>
                <span className={styles.metaIcon}>👥</span>
                {totalStudents} Students
              </span>
              <span className={styles.metaItem}>
                <span className={styles.metaIcon}>📝</span>
                {assignments.length} Assignments
              </span>
            </div>
          </div>

          <div className={styles.headerMainRight}>
            <div className={styles.instructorCard}>
              <div className={styles.instructorAvatar}>
                {course.instructor?.first_name?.[0] || '👤'}
              </div>
              <div className={styles.instructorInfo}>
                <span className={styles.instructorLabel}>Instructor</span>
                <span className={styles.instructorName}>
                  {course.instructor?.full_name || course.instructor?.first_name || 'Unknown'}
                </span>
                <span className={styles.instructorEmail}>
                  {course.instructor?.email || ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Error Banner ──────────────────────────────────────────────── */}
      {error && (
        <div className={styles.errorBanner}>
          <span className={styles.errorBannerIcon}>⚠️</span>
          <span className={styles.errorBannerText}>{error}</span>
          <button onClick={loadData} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* ── Stats Row ────────────────────────────────────────────────── */}
      <div className={styles.statsRow}>
        <StatBox value={assignments.length} label="Assignments" icon="📝" />
        <StatBox value={publishedAssignments.length} label="Published" icon="✅" />
        <StatBox value={totalStudents} label="Enrolled" icon="👥" />
        <StatBox 
          value={isEnrolled ? 'Yes' : 'No'} 
          label="Your Status" 
          icon={isEnrolled ? '✅' : '❌'} 
        />
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className={styles.tabs} role="tablist">
        <TabButton
          tab="overview"
          active={activeTab}
          onClick={() => setActiveTab('overview')}
          icon="📖"
          label="Overview"
        />
        <TabButton
          tab="assignments"
          active={activeTab}
          onClick={() => setActiveTab('assignments')}
          icon="📝"
          label="Assignments"
          count={assignments.length}
        />
        <TabButton
          tab="lessons"
          active={activeTab}
          onClick={() => setActiveTab('lessons')}
          icon="🎯"
          label="Lessons"
        />
        {isTeaching && (
          <TabButton
            tab="students"
            active={activeTab}
            onClick={() => setActiveTab('students')}
            icon="👥"
            label="Students"
            count={totalStudents}
          />
        )}
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────── */}
      <div className={styles.tabContent}>
        {/* ── Overview Tab ────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className={styles.overviewTab}>
            <div className={styles.overviewGrid}>
              {/* Description */}
              <div className={styles.overviewCard}>
                <h3 className={styles.overviewCardTitle}>
                  <span className={styles.overviewCardIcon}>📖</span>
                  About This Course
                </h3>
                <p className={styles.overviewCardText}>
                  {course.description || 'No description available'}
                </p>
              </div>

              {/* Quick Info */}
              <div className={styles.overviewCard}>
                <h3 className={styles.overviewCardTitle}>
                  <span className={styles.overviewCardIcon}>ℹ️</span>
                  Quick Info
                </h3>
                <ul className={styles.quickInfoList}>
                  <li>
                    <span className={styles.quickInfoLabel}>Code</span>
                    <span className={styles.quickInfoValue}>{course.code}</span>
                  </li>
                  <li>
                    <span className={styles.quickInfoLabel}>Credits</span>
                    <span className={styles.quickInfoValue}>{course.credits}</span>
                  </li>
                  <li>
                    <span className={styles.quickInfoLabel}>Semester</span>
                    <span className={styles.quickInfoValue}>{course.semester}</span>
                  </li>
                  <li>
                    <span className={styles.quickInfoLabel}>Year</span>
                    <span className={styles.quickInfoValue}>{course.academic_year}</span>
                  </li>
                  <li>
                    <span className={styles.quickInfoLabel}>Max Students</span>
                    <span className={styles.quickInfoValue}>{course.max_students}</span>
                  </li>
                  <li>
                    <span className={styles.quickInfoLabel}>Status</span>
                    <span className={`${styles.quickInfoValue} ${
                      course.is_active ? styles.statusActive : styles.statusInactive
                    }`}>
                      {course.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Course Actions */}
              {(isTeaching || isEnrolled) && (
                <div className={styles.overviewCard}>
                  <h3 className={styles.overviewCardTitle}>
                    <span className={styles.overviewCardIcon}>⚡</span>
                    Quick Actions
                  </h3>
                  <div className={styles.quickActions}>
                    {isTeaching && (
                      <>
                        <Link to={`/courses/${courseId}/edit`} className={styles.quickActionBtn}>
                          ✏️ Edit Course
                        </Link>
                        <Link to={`/assignments/new?courseId=${courseId}`} className={styles.quickActionBtn}>
                          ➕ Add Assignment
                        </Link>
                        <button 
                          className={`${styles.quickActionBtn} ${styles.quickActionDanger}`}
                          onClick={() => setShowDeleteModal(true)}
                        >
                          🗑️ Delete Course
                        </button>
                      </>
                    )}
                    {isEnrolled && !isTeaching && (
                      <>
                        <Link to={`/assignments?courseId=${courseId}`} className={styles.quickActionBtn}>
                          📝 View Assignments
                        </Link>
                        <button className={styles.quickActionBtn}>
                          📊 Track Progress
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Assignments Tab ─────────────────────────────────────────── */}
        {activeTab === 'assignments' && (
          <div className={styles.assignmentsTab}>
            {assignments.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <h3 className={styles.emptyTitle}>No assignments yet</h3>
                <p className={styles.emptyDesc}>
                  {isTeaching 
                    ? 'Create your first assignment to get started.'
                    : 'Check back later for assignments.'}
                </p>
                {isTeaching && (
                  <Link 
                    to={`/assignments/new?courseId=${courseId}`} 
                    className={styles.createAssignmentBtn}
                  >
                    ➕ Create Assignment
                  </Link>
                )}
              </div>
            ) : (
              <div className={styles.assignmentsList}>
                <div className={styles.assignmentsHeader}>
                  <span className={styles.assignmentsCount}>
                    {assignments.length} assignments
                  </span>
                  <span className={styles.assignmentsPublished}>
                    {publishedAssignments.length} published
                  </span>
                  {isTeaching && (
                    <Link 
                      to={`/assignments/new?courseId=${courseId}`} 
                      className={styles.createAssignmentSmallBtn}
                    >
                      ➕ New
                    </Link>
                  )}
                </div>
                {assignments.map(assignment => (
                  <AssignmentCard 
                    key={assignment.id} 
                    assignment={assignment} 
                    isTeacher={isTeaching}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Lessons Tab ─────────────────────────────────────────────── */}
        {activeTab === 'lessons' && (
          <div className={styles.lessonsTab}>
            <div className={styles.comingSoon}>
              <span className={styles.comingSoonIcon}>🚧</span>
              <h3 className={styles.comingSoonTitle}>Lessons Coming Soon</h3>
              <p className={styles.comingSoonDesc}>
                Course content is being prepared. Check back later!
              </p>
              {isTeaching && (
                <Link 
                  to={`/courses/${courseId}/lessons`} 
                  className={styles.manageLessonsBtn}
                >
                  📚 Manage Lessons
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Students Tab ────────────────────────────────────────────── */}
        {activeTab === 'students' && isTeaching && (
          <div className={styles.studentsTab}>
            <div className={styles.comingSoon}>
              <span className={styles.comingSoonIcon}>👥</span>
              <h3 className={styles.comingSoonTitle}>Student Management</h3>
              <p className={styles.comingSoonDesc}>
                View and manage enrolled students.
              </p>
              <div className={styles.studentStats}>
                <div className={styles.studentStat}>
                  <span className={styles.studentStatValue}>{totalStudents}</span>
                  <span className={styles.studentStatLabel}>Enrolled</span>
                </div>
                <div className={styles.studentStat}>
                  <span className={styles.studentStatValue}>{course.max_students}</span>
                  <span className={styles.studentStatLabel}>Capacity</span>
                </div>
                <div className={styles.studentStat}>
                  <span className={styles.studentStatValue}>
                    {Math.round((totalStudents / course.max_students) * 100)}%
                  </span>
                  <span className={styles.studentStatLabel}>Full</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete Modal ───────────────────────────────────────────────── */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>⚠️</div>
            <h3 className={styles.modalTitle}>Delete Course?</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete <strong>"{course.title}"</strong>?
              This action cannot be undone and will remove all associated assignments
              and student data.
            </p>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalCancelBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.modalDeleteBtn}
                onClick={handleDelete}
              >
                🗑️ Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}