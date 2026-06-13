import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { coursesApi } from '@/api/courses'
import { useForm } from '@/hooks/useForm'
import Input from '@/components/ui/Input'
import type { Course, CreateCoursePayload } from '@/types'
import styles from './CourseForm.module.css'

const CURRENT_YEAR = new Date().getFullYear()

export default function EditCoursePage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loadingCourse, setLoadingCourse] = useState(true)

  const { values, errors, globalError, loading, handleChange, handleSubmit, setValues } =
    useForm<CreateCoursePayload>({
      initialValues: {
        code: '', title: '', description: '',
        academic_year: CURRENT_YEAR, semester: 'Fall',
        credits: 3, max_students: 30, is_active: true,
      },
      onSubmit: async (vals) => {
        await coursesApi.update(id!, {
          ...vals,
          academic_year: Number(vals.academic_year),
          credits:       Number(vals.credits),
          max_students:  Number(vals.max_students),
        })
        navigate(`/courses/${id}`)
      },
    })

  useEffect(() => {
    if (!id) return
    coursesApi.get(id).then(c => {
      setCourse(c)
      setValues({
        code:          c.code,
        title:         c.title,
        description:   c.description ?? '',
        academic_year: c.academic_year,
        semester:      c.semester,
        credits:       c.credits,
        max_students:  c.max_students,
        is_active:     c.is_active,
      })
    }).finally(() => setLoadingCourse(false))
  }, [id])

  if (loadingCourse) return <div className={styles.skeleton} style={{ height: 400, borderRadius: 12, background: 'var(--color-border)', animation: 'shimmer 1.4s infinite linear' }} />

  if (!course) return <p style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-3)' }}>Course not found.</p>

  return (
    <div className={`${styles.root} page-enter`}>
      <nav className={styles.breadcrumb}>
        <Link to="/courses">Courses</Link>
        <span>›</span>
        <Link to={`/courses/${id}`}>{course.code}</Link>
        <span>›</span>
        <span>Edit</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.main}>
          <h1 className={styles.title}>Edit course</h1>
          <p className={styles.sub}>Update course details for <strong>{course.title}</strong>.</p>

          {globalError && <div className={styles.alert}>{globalError}</div>}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Course identity</legend>
              <div className={styles.row2}>
                <Input label="Course code" name="code" value={values.code} onChange={handleChange} error={errors.code} required />
                <Input label="Credits" name="credits" type="number" min={1} max={6} value={String(values.credits)} onChange={handleChange} error={errors.credits} />
              </div>
              <Input label="Course title" name="title" value={values.title} onChange={handleChange} error={errors.title} required />
              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea name="description" value={values.description} onChange={handleChange} className={styles.textarea} rows={4} />
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Schedule & capacity</legend>
              <div className={styles.row3}>
                <div className={styles.field}>
                  <label className={styles.label}>Academic year</label>
                  <select name="academic_year" value={String(values.academic_year)} onChange={handleChange} className={styles.select}>
                    {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Semester</label>
                  <select name="semester" value={values.semester} onChange={handleChange} className={styles.select}>
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <Input label="Max students" name="max_students" type="number" min={1} max={500} value={String(values.max_students)} onChange={handleChange} error={errors.max_students} />
              </div>

              {/* Active toggle */}
              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.toggleLabel}>Course active</p>
                  <p className={styles.toggleSub}>Inactive courses are hidden from students.</p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={values.is_active}
                    onChange={e => setValues({ ...values, is_active: e.target.checked })}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </fieldset>

            <div className={styles.actions}>
              <button type="button" className={styles.dangerBtn} onClick={async () => {
                if (!window.confirm('Delete this course? This cannot be undone.')) return
                await coursesApi.delete(id!)
                navigate('/courses')
              }}>
                Delete course
              </button>
              <button type="button" className={styles.cancelBtn} onClick={() => navigate(`/courses/${id}`)}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.tipCard}>
            <h3 className={styles.tipTitle}>Caution</h3>
            <ul className={styles.tipList}>
              <li>Lowering <strong>max students</strong> won't remove existing enrollments — it only prevents new ones.</li>
              <li>Deactivating the course hides it from all students immediately.</li>
              <li>Deleting a course removes all its assignments. Submissions are preserved for audit.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
