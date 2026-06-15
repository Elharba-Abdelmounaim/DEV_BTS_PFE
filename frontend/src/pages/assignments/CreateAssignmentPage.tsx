import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { assignmentsApi } from '@/api/assignments'
import { useForm } from '@/hooks/useForm'
import Input from '@/components/ui/Input'
import TestCaseBuilder from './TestCaseBuilder'
import type { TestCase } from '@/types'
import styles from './AssignmentForm.module.css'

export default function CreateAssignmentPage() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const courseId      = params.get('course_id') ?? ''
  const [testCases,   setTestCases]   = useState<TestCase[]>([])
  const [useAutoGrade, setUseAutoGrade] = useState(false)

  const { values, errors, globalError, loading, handleChange, handleSubmit } =
    useForm<{
      course_id: string; title: string; description: string
      assignment_type: string; max_score: string; due_date: string
      late_submission_allowed: string; late_penalty_percentage: string
      language: string; is_published: string
    }>({
      initialValues: {
        course_id:               courseId,
        title:                   '',
        description:             '',
        assignment_type:         'code',
        max_score:               '100',
        due_date:                '',
        late_submission_allowed: 'false',
        late_penalty_percentage: '0',
        language:                'python',
        is_published:            'false',
      },
      onSubmit: async (vals) => {
        const payload: Record<string, unknown> = {
          course_id:               vals.course_id,
          title:                   vals.title,
          description:             vals.description || undefined,
          assignment_type:         vals.assignment_type,
          max_score:               Number(vals.max_score),
          due_date:                vals.due_date,
          late_submission_allowed: vals.late_submission_allowed === 'true',
          late_penalty_percentage: Number(vals.late_penalty_percentage),
          language:                vals.language || undefined,
          is_published:            vals.is_published === 'true',
        }
        if (useAutoGrade && testCases.length > 0) {
          payload.test_cases   = testCases
          payload.docker_config = {
            image:        `${vals.language}:latest`,
            memory_limit: '128m',
            cpu_limit:    '0.5',
            timeout:      30,
            network:      'none',
          }
        }
        const assignment = await assignmentsApi.create(payload as never)
        navigate(`/assignments/${assignment.id}`)
      },
    })

  return (
    <div className={`${styles.root} page-enter`}>

      <nav className={styles.breadcrumb}>
        {courseId && <><Link to={`/courses/${courseId}`}>Course</Link><span>›</span></>}
        <span>New assignment</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.main}>
          <h1 className={styles.title}>Create assignment</h1>
          <p className={styles.sub}>Define the task, due date, and optionally configure auto-grading.</p>

          {globalError && <div className={styles.alert}>{globalError}</div>}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>

            {/* Basic info */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Assignment details</legend>

              <Input
                label="Title"
                name="title"
                placeholder="e.g. Fibonacci Sequence Implementation"
                value={values.title}
                onChange={handleChange}
                error={errors.title}
                required
              />

              <div className={styles.field}>
                <label className={styles.label}>Instructions</label>
                <textarea
                  name="description"
                  placeholder="Describe what students need to implement, constraints, examples…"
                  value={values.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={5}
                />
              </div>

              <div className={styles.row3}>
                <div className={styles.field}>
                  <label className={styles.label}>Type</label>
                  <select name="assignment_type" value={values.assignment_type} onChange={handleChange} className={styles.select}>
                    <option value="code">Code</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                <Input label="Max score" name="max_score" type="number" min={1} max={1000} value={values.max_score} onChange={handleChange} error={errors.max_score} />
                <Input label="Due date" name="due_date" type="datetime-local" value={values.due_date} onChange={handleChange} error={errors.due_date} required />
              </div>
            </fieldset>

            {/* Late policy */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Late submission policy</legend>
              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.toggleLabel}>Allow late submissions</p>
                  <p className={styles.toggleSub}>Students can submit after the due date with a penalty.</p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={values.late_submission_allowed === 'true'}
                    onChange={e => {
                      const synth = { target: { name: 'late_submission_allowed', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>
                      handleChange(synth)
                    }}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
              {values.late_submission_allowed === 'true' && (
                <Input
                  label="Penalty (%)"
                  name="late_penalty_percentage"
                  type="number"
                  min={0}
                  max={100}
                  value={values.late_penalty_percentage}
                  onChange={handleChange}
                  error={errors.late_penalty_percentage}
                  hint="Percentage deducted from the final score for late submissions."
                />
              )}
            </fieldset>

            {/* Auto-grading */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Auto-grading (Phase 2)</legend>

              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.toggleLabel}>Enable auto-grading</p>
                  <p className={styles.toggleSub}>Student repos will be graded automatically via Docker.</p>
                </div>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={useAutoGrade} onChange={e => setUseAutoGrade(e.target.checked)} />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              {useAutoGrade && (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>Programming language</label>
                    <select name="language" value={values.language} onChange={handleChange} className={styles.select}>
                      <option value="python">Python</option>
                      <option value="node">Node.js</option>
                      <option value="java">Java</option>
                      <option value="go">Go</option>
                    </select>
                  </div>
                  <TestCaseBuilder testCases={testCases} onChange={setTestCases} maxScore={Number(values.max_score)} />
                </>
              )}
            </fieldset>

            {/* Publish */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Visibility</legend>
              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.toggleLabel}>Publish immediately</p>
                  <p className={styles.toggleSub}>Students will see this assignment as soon as it's created.</p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={values.is_published === 'true'}
                    onChange={e => {
                      const synth = { target: { name: 'is_published', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>
                      handleChange(synth)
                    }}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </fieldset>

            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Create assignment'}
              </button>
            </div>
          </form>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.tipCard}>
            <h3 className={styles.tipTitle}>Auto-grading tips</h3>
            <ul className={styles.tipList}>
              <li>Add at least one test case before enabling auto-grading.</li>
              <li>Each test case has a <strong>weight</strong> — total weights determine the score.</li>
              <li>Use <code>exit_zero</code> strategy for "program runs" checks.</li>
              <li>Use <code>output_contains</code> to check for specific output strings.</li>
              <li>Students won't see test cases — only their score and feedback.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
