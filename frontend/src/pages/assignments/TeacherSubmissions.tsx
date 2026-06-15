import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { assignmentsApi, submissionsApi } from '@/api/assignments'
import type { Assignment, Submission } from '@/types'
import ManualGradeForm from '../submissions/ManualGradeForm'
import styles from './TeacherSubmissions.module.css'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pending',  cls: styles.sPending },
  queued:   { label: 'Queued',   cls: styles.sQueued },
  grading:  { label: 'Grading', cls: styles.sGrading },
  graded:   { label: 'Graded',  cls: styles.sGraded },
  failed:   { label: 'Failed',  cls: styles.sFailed },
}

export default function TeacherSubmissions() {
  const { id: assignmentId } = useParams<{ id: string }>()

  const [assignment,  setAssignment]  = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading,     setLoading]     = useState(true)
  const [grading,     setGrading]     = useState<Submission | null>(null)
  const [filter,      setFilter]      = useState('all')

  const reload = async () => {
    if (!assignmentId) return
    const [a, s] = await Promise.all([
      assignmentsApi.get(assignmentId),
      submissionsApi.byAssignment(assignmentId),
    ])
    setAssignment(a)
    setSubmissions(s.data)
  }

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [assignmentId])

  const filtered = filter === 'all'
    ? submissions
    : submissions.filter(s => s.submission_status === filter)

  const graded    = submissions.filter(s => s.submission_status === 'graded')
  const avgScore  = graded.length
    ? Math.round(graded.reduce((a, s) => a + (s.final_score ?? 0), 0) / graded.length)
    : null

  return (
    <div className={`${styles.root} page-enter`}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/courses">Courses</Link>
        {assignment && <><span>›</span><Link to={`/courses/${assignment.course_id}`}>{assignment.course?.code ?? 'Course'}</Link></>}
        {assignment && <><span>›</span><Link to={`/assignments/${assignmentId}`}>{assignment.title}</Link></>}
        <span>›</span>
        <span>Submissions</span>
      </nav>

      {/* Header */}
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Submissions</h1>
          {assignment && <p className={styles.sub}>{assignment.title}</p>}
        </div>

        {/* Summary stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{submissions.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{graded.length}</span>
            <span className={styles.statLabel}>Graded</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{avgScore ?? '—'}</span>
            <span className={styles.statLabel}>Avg score</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.filters}>
        {['all', 'pending', 'grading', 'graded', 'failed'].map(f => (
          <button
            key={f}
            className={`${styles.filter} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={styles.filterCount}>
              {f === 'all' ? submissions.length : submissions.filter(s => s.submission_status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grading panel */}
      {grading && (
        <div className={styles.gradingPanel}>
          <div className={styles.gradingHeader}>
            <h2 className={styles.gradingTitle}>
              Grading: {grading.student?.full_name ?? grading.student?.first_name}
            </h2>
            <button className={styles.closeBtn} onClick={() => setGrading(null)}>✕ Close</button>
          </div>
          <ManualGradeForm
            submission={grading}
            maxScore={assignment?.max_score ?? 100}
            onSuccess={async (updated) => {
              setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s))
              setGrading(null)
            }}
          />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className={styles.skeletons}>
          {[1,2,3,4,5].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          No submissions{filter !== 'all' ? ` with status "${filter}"` : ''} yet.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Repository</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Auto score</th>
                <th>Final score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sub => {
                const st = STATUS_MAP[sub.submission_status] ?? { label: sub.submission_status, cls: '' }
                return (
                  <tr key={sub.id} className={styles.row}>
                    <td className={styles.tdStudent}>
                      <div className={styles.avatar}>
                        {sub.student?.first_name?.[0]}{sub.student?.last_name?.[0]}
                      </div>
                      <div>
                        <p className={styles.studentName}>
                          {sub.student?.full_name ?? `${sub.student?.first_name} ${sub.student?.last_name}`}
                        </p>
                        <p className={styles.studentEmail}>{sub.student?.email}</p>
                      </div>
                    </td>
                    <td className={styles.tdRepo}>
                      <a href={sub.github_repo_url ?? '#'} target="_blank" rel="noreferrer" className={styles.repoLink}>
                        {(sub.github_repo_url ?? 'N/A').replace('https://github.com/', '')}
                      </a>
                      {sub.is_late && <span className={styles.latePill}>Late</span>}
                    </td>
                    <td className={styles.tdDate}>
                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      }) : '—'}
                    </td>
                    <td><span className={`${styles.badge} ${st.cls}`}>{st.label}</span></td>
                    <td className={styles.tdScore}>
                      {sub.auto_grade_score !== null ? `${sub.auto_grade_score}/100` : '—'}
                    </td>
                    <td className={styles.tdScore}>
                      {sub.final_score !== null
                        ? <strong>{sub.final_score}/100</strong>
                        : '—'}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link to={`/submissions/${sub.id}`} className={styles.viewBtn}>View</Link>
                        <button
                          className={styles.gradeBtn}
                          onClick={() => setGrading(sub)}
                        >
                          Grade
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
