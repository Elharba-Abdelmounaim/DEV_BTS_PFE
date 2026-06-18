// src/pages/courses/CreateCoursePage.tsx
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coursesApi } from '../../api/courses';
import { useForm } from '../../hooks/useForm';
import type { CreateCoursePayload } from '../../types';
import styles from './CourseForm.module.css';

const CURRENT_YEAR = new Date().getFullYear();

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Form Setup ──────────────────────────────────────────────────────────────
  const { 
    values, 
    errors, 
    globalError, 
    loading, 
    handleChange, 
    handleSubmit,
    setErrors 
  } = useForm<CreateCoursePayload>({
    initialValues: {
      code: '',
      title: '',
      description: '',
      academic_year: CURRENT_YEAR,
      semester: 'Fall',
      credits: 3,
      max_students: 30,
      is_active: true,
    },
    onSubmit: async (vals) => {
      try {
        const course = await coursesApi.create({
          ...vals,
          academic_year: Number(vals.academic_year),
          credits: Number(vals.credits),
          max_students: Number(vals.max_students),
        });
        
        // Navigate to the new course with success state
        navigate(`/courses/${course.id}`, { 
          state: { created: true, courseTitle: course.title } 
        });
      } catch (err: any) {
        // Handle validation errors from API
        if (err?.response?.data?.errors) {
          setErrors(err.response.data.errors);
        }
        throw err;
      }
    },
  });

  // ── Quick Actions ──────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      navigate('/courses');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all form fields?')) {
      // Reset to initial values
      window.location.reload();
    }
  };

  return (
    <div className={`${styles.page} page-enter`}>
      
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/courses" className={styles.backLink}>
            <span className={styles.backArrow}>←</span> 
            Back to Courses
          </Link>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🚀</span>
            Create New Course
          </h1>
          <p className={styles.subtitle}>
            Build a new course and start empowering your students
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.instructorBadge}>
            <span className={styles.instructorAvatar}>
              {user?.first_name?.[0] || '👤'}
            </span>
            <span className={styles.instructorName}>
              {user?.full_name || user?.first_name || 'Instructor'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Layout ────────────────────────────────────────────────────────── */}
      <div className={styles.layout}>

        {/* ── Main Form ────────────────────────────────────────────────────── */}
        <div className={styles.main}>
          
          {/* Error Banner */}
          {globalError && (
            <div className={styles.errorBanner}>
              <span className={styles.errorBannerIcon}>❌</span>
              <div>
                <span className={styles.errorBannerTitle}>Oops! Something went wrong</span>
                <span className={styles.errorBannerText}>{globalError}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className={styles.form}>

            {/* ── Course Identity ────────────────────────────────────────── */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>📋</span>
                  Course Identity
                </h3>
                <p className={styles.sectionDesc}>
                  Basic information about your course
                </p>
              </div>

              <div className={styles.sectionBody}>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Course Code <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      placeholder="e.g., CS301-F24"
                      value={values.code}
                      onChange={handleChange}
                      className={`${styles.input} ${errors.code ? styles.inputError : ''}`}
                      required
                    />
                    {errors.code ? (
                      <span className={styles.fieldError}>{errors.code}</span>
                    ) : (
                      <span className={styles.fieldHint}>
                        Must be unique - students will use this to find your course
                      </span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Credits <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      name="credits"
                      min={1}
                      max={6}
                      value={String(values.credits)}
                      onChange={handleChange}
                      className={`${styles.input} ${errors.credits ? styles.inputError : ''}`}
                      required
                    />
                    {errors.credits && (
                      <span className={styles.fieldError}>{errors.credits}</span>
                    )}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Course Title <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g., Data Structures & Algorithms"
                    value={values.title}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                    required
                  />
                  {errors.title ? (
                    <span className={styles.fieldError}>{errors.title}</span>
                  ) : (
                    <span className={styles.fieldHint}>
                      Clear, descriptive title that attracts students
                    </span>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    name="description"
                    placeholder="What will students learn in this course? What are the key topics and objectives?"
                    value={values.description}
                    onChange={handleChange}
                    className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                    rows={4}
                  />
                  <div className={styles.fieldFooter}>
                    <span className={styles.fieldHint}>
                      {values.description?.length || 0} characters
                    </span>
                    {errors.description && (
                      <span className={styles.fieldError}>{errors.description}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Schedule & Capacity ────────────────────────────────────── */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>📅</span>
                  Schedule & Capacity
                </h3>
                <p className={styles.sectionDesc}>
                  When and how many students can enroll
                </p>
              </div>

              <div className={styles.sectionBody}>
                <div className={styles.row3}>
                  <div className={styles.field}>
                    <label className={styles.label}>Academic Year</label>
                    <select
                      name="academic_year"
                      value={String(values.academic_year)}
                      onChange={handleChange}
                      className={`${styles.select} ${styles.input}`}
                    >
                      {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2].map(y => (
                        <option key={y} value={y}>
                          {y} - {y + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Semester</label>
                    <select
                      name="semester"
                      value={values.semester}
                      onChange={handleChange}
                      className={`${styles.select} ${styles.input}`}
                    >
                      <option value="Fall">🍂 Fall</option>
                      <option value="Spring">🌸 Spring</option>
                      <option value="Summer">☀️ Summer</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Max Students <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      name="max_students"
                      min={1}
                      max={500}
                      value={String(values.max_students)}
                      onChange={handleChange}
                      className={`${styles.input} ${errors.max_students ? styles.inputError : ''}`}
                      required
                    />
                    {errors.max_students ? (
                      <span className={styles.fieldError}>{errors.max_students}</span>
                    ) : (
                      <span className={styles.fieldHint}>
                        Can't be lowered once students enroll
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Active Status Toggle ────────────────────────────────── */}
                <div className={styles.toggleWrapper}>
                  <label className={styles.toggleLabel}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleIcon}>🟢</span>
                      <div>
                        <span className={styles.toggleTitle}>Active</span>
                        <span className={styles.toggleDesc}>
                          Course will be visible to students immediately after creation
                        </span>
                      </div>
                    </div>
                    <div className={styles.toggle}>
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={values.is_active}
                        onChange={handleChange}
                        className={styles.toggleInput}
                      />
                      <span className={styles.toggleSlider} />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Form Actions ─────────────────────────────────────────────── */}
            <div className={styles.actions}>
              <div className={styles.actionsLeft}>
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={handleReset}
                  disabled={loading}
                >
                  <span className={styles.resetIcon}>↺</span>
                  Reset
                </button>
              </div>
              <div className={styles.actionsRight}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner} />
                      Creating Course...
                    </>
                  ) : (
                    <>
                      <span className={styles.submitIcon}>🚀</span>
                      Create Course
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          
          {/* ── Tips Card ────────────────────────────────────────────────── */}
          <div className={styles.tipCard}>
            <div className={styles.tipCardHeader}>
              <span className={styles.tipCardIcon}>💡</span>
              <h3 className={styles.tipCardTitle}>Pro Tips</h3>
            </div>
            <ul className={styles.tipList}>
              <li>
                <span className={styles.tipBullet}>📌</span>
                <span>
                  <strong>Unique code</strong> — Choose a code that's unique and easy to remember
                </span>
              </li>
              <li>
                <span className={styles.tipBullet}>✏️</span>
                <span>
                  <strong>Clear title</strong> — Use descriptive titles that reflect course content
                </span>
              </li>
              <li>
                <span className={styles.tipBullet}>📊</span>
                <span>
                  <strong>Credit hours</strong> — Typically 3 credits for core courses, 1-2 for labs
                </span>
              </li>
              <li>
                <span className={styles.tipBullet}>👥</span>
                <span>
                  <strong>Capacity planning</strong> — Set max students wisely. Can't be lowered after enrollment
                </span>
              </li>
              <li>
                <span className={styles.tipBullet}>📝</span>
                <span>
                  <strong>Assignments later</strong> — You can add assignments after creating the course
                </span>
              </li>
            </ul>
          </div>

          {/* ── Quick Preview Card ───────────────────────────────────────── */}
          <div className={styles.previewCard}>
            <h4 className={styles.previewTitle}>📄 Course Preview</h4>
            <div className={styles.previewContent}>
              <div className={styles.previewCode}>
                {values.code || 'CSXXX'}
              </div>
              <div className={styles.previewTitle}>
                {values.title || 'Course Title'}
              </div>
              <div className={styles.previewMeta}>
                <span>{values.semester} {values.academic_year}</span>
                <span>•</span>
                <span>{values.credits} Credits</span>
                <span>•</span>
                <span>{values.max_students} Students</span>
              </div>
              <div className={styles.previewStatus}>
                <span className={`${styles.previewDot} ${values.is_active ? styles.previewActive : styles.previewInactive}`} />
                {values.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* ── Help Card ──────────────────────────────────────────────────── */}
          <div className={styles.helpCard}>
            <h4 className={styles.helpTitle}>🆘 Need Help?</h4>
            <p className={styles.helpText}>
              Check the documentation or contact support for assistance.
            </p>
            <Link to="/help" className={styles.helpLink}>
              View Documentation →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}