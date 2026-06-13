import { useNavigate, Link } from 'react-router-dom'
import { coursesApi } from '@/api/courses'
import { useForm } from '@/hooks/useForm'
import Input from '@/components/ui/Input'
import type { CreateCoursePayload } from '@/types'
import styles from './CourseForm.module.css'

const CURRENT_YEAR = new Date().getFullYear()

export default function CreateCoursePage() {
  const navigate = useNavigate()

  const { values, errors, globalError, loading, handleChange, handleSubmit } =
    useForm<CreateCoursePayload>({
      initialValues: {
        code:          '',
        title:         '',
        description:   '',
        academic_year: CURRENT_YEAR,
        semester:      'Fall',
        credits:       3,
        max_students:  30,
        is_active:     true,
      },
      onSubmit: async (vals) => {
        const course = await coursesApi.create({
          ...vals,
          academic_year: Number(vals.academic_year),
          credits:       Number(vals.credits),
          max_students:  Number(vals.max_students),
        })
        navigate(`/courses/${course.id}`)
      },
    })

  return (
    <div className={`${styles.root} page-enter`}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/courses">Courses</Link>
        <span>›</span>
        <span>New course</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.main}>
          <h1 className={styles.title}>Create course</h1>
          <p className={styles.sub}>Fill in the details to add a new course for your students.</p>

          {globalError && <div className={styles.alert}>{globalError}</div>}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>

            {/* Identity */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Course identity</legend>

              <div className={styles.row2}>
                <Input
                  label="Course code"
                  name="code"
                  placeholder="e.g. CS301"
                  value={values.code}
                  onChange={handleChange}
                  error={errors.code}
                  required
                  hint="Must be unique — students will see this."
                />
                <Input
                  label="Credits"
                  name="credits"
                  type="number"
                  min={1}
                  max={6}
                  value={String(values.credits)}
                  onChange={handleChange}
                  error={errors.credits}
                />
              </div>

              <Input
                label="Course title"
                name="title"
                placeholder="e.g. Data Structures & Algorithms"
                value={values.title}
                onChange={handleChange}
                error={errors.title}
                required
              />

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  name="description"
                  placeholder="What will students learn in this course?"
                  value={values.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </fieldset>

            {/* Schedule */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Schedule & capacity</legend>

              <div className={styles.row3}>
                <div className={styles.field}>
                  <label className={styles.label}>Academic year</label>
                  <select
                    name="academic_year"
                    value={String(values.academic_year)}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Semester</label>
                  <select
                    name="semester"
                    value={values.semester}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                <Input
                  label="Max students"
                  name="max_students"
                  type="number"
                  min={1}
                  max={500}
                  value={String(values.max_students)}
                  onChange={handleChange}
                  error={errors.max_students}
                />
              </div>
            </fieldset>

            {/* Actions */}
            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={() => navigate('/courses')}>
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Create course'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar tips */}
        <aside className={styles.sidebar}>
          <div className={styles.tipCard}>
            <h3 className={styles.tipTitle}>Tips</h3>
            <ul className={styles.tipList}>
              <li>Course code must be unique across the platform (e.g. <code>CS301-F24</code>).</li>
              <li>You can add assignments after creating the course.</li>
              <li>Set <strong>max students</strong> before publishing — it can't be lowered once students enroll.</li>
              <li>Courses are active by default and visible to all students immediately.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
