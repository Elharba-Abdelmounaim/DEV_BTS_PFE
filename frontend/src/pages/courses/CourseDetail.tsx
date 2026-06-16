import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { coursesApi } from '@/api/courses'
import { assignmentsApi } from '@/api/assignments'
import { lessonsApi } from '@/api/lessons'
import type { Assignment, Course, Enrollment } from '@/types'
import CourseContentTab from './lessons/CourseContentTab'
import styles from './CourseDetail.module.css'

type Tab = 'overview' | 'content' | 'assignments'

function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const overdue = assignment.is_past_due && !assignment.late_submission_allowed

  return (
    <Link to={`/assignments/${assignment.id}`} className={styles.assignRow}>
      <div className={styles.assignLeft}>
        <span className={`${styles.typeBadge} ${styles[`type_${assignment.assignment_type}`]}`}>
          {assignment.assignment_type}
        </span>

        <div>
          <p className={styles.assignTitle}>{assignment.title}</p>
          <p className={styles.assignMeta}>
            Due {new Date(assignment.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}

            {assignment.is_past_due && (
              <span className={overdue ? styles.overdue : styles.lateOk}>
                {overdue ? ' · Closed' : ' · Late accepted'}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className={styles.assignRight}>
        <span className={styles.maxScore}>{assignment.max_score} pts</span>
      </div>
    </Link>
  )
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const { isTeacher } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = (searchParams.get('tab') as Tab) ?? 'content'

  const [course, setCourse] = useState<Course | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    Promise.all([
      coursesApi.get(id),
      assignmentsApi.byCourse(id),
      !isTeacher
        ? coursesApi.myEnrollments().then(list =>
            list.find(e => e.course_id === id) ?? null
          )
        : Promise.resolve(null),
    ])
      .then(([courseData, assignmentsData, enrollmentData]) => {
        setCourse(courseData)
        setAssignments(assignmentsData)
        setEnrollment(enrollmentData)
      })
      .catch(() => setError('Could not load course.'))
      .finally(() => setLoading(false))
  }, [id, isTeacher])

  const handleEnroll = async () => {
    if (!id) return

    setEnrolling(true)
    try {
      const enroll = await coursesApi.enroll(id)
      setEnrollment(enroll)
    } catch {
      setError('Enrollment failed. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  const setTab = (t: Tab) => setSearchParams({ tab: t }, { replace: true })

  if (loading) {
    return (
      <div className="page-enter">
        <div className={styles.skeletonHead} />
        <div className={styles.skeletonBody} />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className={styles.errorState}>
        <p>{error || 'Course not found.'}</p>
        <button onClick={() => navigate('/courses')} className={styles.backBtn}>
          ← Back to courses
        </button>
      </div>
    )
  }

  const isEnrolled = enrollment?.status === 'active'
  const published = assignments.filter(a => a.is_published)
  const unpublished = isTeacher ? assignments.filter(a => !a.is_published) : []

  const TABS: { id: Tab; label: string }[] = [
    { id: 'content', label: '📚 Content' },
    { id: 'assignments', label: '📝 Assignments' },
    { id: 'overview', label: '📋 Overview' },
  ]

  return (
    <div className={`${styles.root} page-enter`}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/courses">Courses</Link>
        <span>›</span>
        <span>{course.code}</span>
      </nav>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.courseTitle}>{course.title}</h1>
          <p className={styles.description}>{course.description}</p>

          <div className={styles.heroMeta}>
            <span>{course.academic_year}</span>
            <span>{course.semester}</span>
            <span>{course.credits} credits</span>
          </div>
        </div>

        {!isTeacher && (
          <div className={styles.enrollCard}>
            {isEnrolled ? (
              <div className={styles.enrolledState}>✓ Enrolled</div>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? 'Loading...' : 'Enroll'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.tabContent}>

        {/* LESSONS SYSTEM */}
        {activeTab === 'content' && id && (
          <CourseContentTab courseId={id} />
        )}

        {/* ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <section className={styles.section}>
            <h2>Assignments ({published.length})</h2>

            {published.map(a => (
              <AssignmentRow key={a.id} assignment={a} />
            ))}

            {isTeacher && unpublished.length > 0 && (
              <>
                <h3>Drafts</h3>
                {unpublished.map(a => (
                  <AssignmentRow key={a.id} assignment={a} />
                ))}
              </>
            )}
          </section>
        )}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <section className={styles.section}>
            <p>Academic year: {course.academic_year}</p>
            <p>Semester: {course.semester}</p>
            <p>Credits: {course.credits}</p>
            <p>Max students: {course.max_students}</p>
          </section>
        )}
      </div>
    </div>
  )
}