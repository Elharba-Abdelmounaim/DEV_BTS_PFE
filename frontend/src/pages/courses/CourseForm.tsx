// src/pages/courses/CourseForm.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course, CreateCoursePayload } from '../../types';
import styles from './CourseForm.module.css';

interface CourseFormProps {
  initialData?: Partial<Course>;
  onSubmit: (data: CreateCoursePayload) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
  mode: 'create' | 'edit';
}

export const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  error,
  mode,
}) => {
  const navigate = useNavigate();
  
  // ── State ──────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<CreateCoursePayload>({
    code: '',
    title: '',
    description: '',
    academic_year: new Date().getFullYear(),
    semester: 'Fall',
    credits: 3,
    max_students: 30,
    is_active: true,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ── Computed Values ──────────────────────────────────────────────────────
  const academicYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - 1 + i);
  }, []);

  const semesters = ['Fall', 'Spring', 'Summer'];

  const isFormValid = useMemo(() => {
    return (
      formData.code.trim().length > 0 &&
      formData.title.trim().length > 0 &&
      formData.credits >= 1 &&
      formData.credits <= 10 &&
      formData.max_students >= 1 &&
      formData.max_students <= 500
    );
  }, [formData]);

  // ── Populate Form ────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        title: initialData.title || '',
        description: initialData.description || '',
        academic_year: initialData.academic_year || new Date().getFullYear(),
        semester: initialData.semester || 'Fall',
        credits: initialData.credits || 3,
        max_students: initialData.max_students || 30,
        is_active: initialData.is_active ?? true,
      });
      setIsDirty(false);
      setTouched({});
    }
  }, [initialData]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : type === 'number' 
        ? Number(value) 
        : value;

    setFormData(prev => ({ ...prev, [name]: val }));
    setIsDirty(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Validation
    if (!isFormValid) {
      // Mark all fields as touched to show errors
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    await onSubmit(formData);
    if (!error) {
      setIsDirty(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm(
      mode === 'create' 
        ? 'You have unsaved changes. Are you sure you want to leave? All entered data will be lost.'
        : 'You have unsaved changes. Are you sure you want to leave?'
    )) {
      return;
    }
    navigate('/courses');
  };

  const handleReset = () => {
    if (!window.confirm('Are you sure you want to reset all fields?')) {
      return;
    }
    
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        title: initialData.title || '',
        description: initialData.description || '',
        academic_year: initialData.academic_year || new Date().getFullYear(),
        semester: initialData.semester || 'Fall',
        credits: initialData.credits || 3,
        max_students: initialData.max_students || 30,
        is_active: initialData.is_active ?? true,
      });
    } else {
      setFormData({
        code: '',
        title: '',
        description: '',
        academic_year: new Date().getFullYear(),
        semester: 'Fall',
        credits: 3,
        max_students: 30,
        is_active: true,
      });
    }
    setIsDirty(false);
    setTouched({});
  };

  // ── Field Error Helper ──────────────────────────────────────────────────
  const getFieldError = (fieldName: keyof CreateCoursePayload) => {
    if (!submitAttempted && !touched[fieldName]) return null;
    
    const value = formData[fieldName];
    
    switch (fieldName) {
      case 'code':
        if (typeof value !== 'string' || !value.trim()) return 'Course code is required';
        if (value.length < 2) return 'Course code must be at least 2 characters';
        return null;
      case 'title':
        if (typeof value !== 'string' || !value.trim()) return 'Course title is required';
        if (value.length < 3) return 'Course title must be at least 3 characters';
        return null;
      case 'credits':
        if (typeof value !== 'number' || value < 1) return 'Minimum 1 credit';
        if (value > 10) return 'Maximum 10 credits';
        return null;
      case 'max_students':
        if (typeof value !== 'number' || value < 1) return 'Minimum 1 student';
        if (value > 500) return 'Maximum 500 students';
        return null;
      default:
        return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={styles.formHeader}>
        <div className={styles.formHeaderLeft}>
          <h2 className={styles.formTitle}>
            {mode === 'create' ? '🚀 Create New Course' : '✏️ Edit Course'}
          </h2>
          <p className={styles.formSubtitle}>
            {mode === 'create' 
              ? 'Fill in the details to create a new course for your students'
              : 'Update the course information and settings'}
          </p>
        </div>
        {isDirty && (
          <div className={styles.unsavedBadge}>
            <span className={styles.unsavedDot} />
            Unsaved changes
          </div>
        )}
      </div>

      {/* ── Error Message ───────────────────────────────────────────────── */}
      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>❌</span>
          <div className={styles.errorContent}>
            <span className={styles.errorTitle}>Error</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        </div>
      )}

      {/* ── Form Body ───────────────────────────────────────────────────── */}
      <div className={styles.formBody}>
        {/* ── Course Identity Section ──────────────────────────────────── */}
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
            {/* Code & Title */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="code" className={styles.formLabel}>
                  Course Code <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${styles.formInput} ${
                      getFieldError('code') ? styles.inputError : ''
                    } ${touched.code && !getFieldError('code') && formData.code ? styles.inputSuccess : ''}`}
                    placeholder="e.g., CS301-F24"
                    required
                    disabled={isLoading}
                  />
                  {touched.code && !getFieldError('code') && formData.code && (
                    <span className={styles.inputSuccessIcon}>✅</span>
                  )}
                </div>
                {getFieldError('code') ? (
                  <span className={styles.inputErrorText}>{getFieldError('code')}</span>
                ) : (
                  <span className={styles.inputHint}>
                    Unique code that students will use to find this course
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="credits" className={styles.formLabel}>
                  Credits <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="credits"
                    name="credits"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.credits}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${styles.formInput} ${
                      getFieldError('credits') ? styles.inputError : ''
                    }`}
                    required
                    disabled={isLoading}
                  />
                </div>
                {getFieldError('credits') && (
                  <span className={styles.inputErrorText}>{getFieldError('credits')}</span>
                )}
                <span className={styles.inputHint}>
                  Usually 3 for core courses, 1-2 for labs
                </span>
              </div>
            </div>

            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.formLabel}>
                Course Title <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.formInput} ${
                    getFieldError('title') ? styles.inputError : ''
                  } ${touched.title && !getFieldError('title') && formData.title ? styles.inputSuccess : ''}`}
                  placeholder="e.g., Data Structures & Algorithms"
                  required
                  disabled={isLoading}
                />
                {touched.title && !getFieldError('title') && formData.title && (
                  <span className={styles.inputSuccessIcon}>✅</span>
                )}
              </div>
              {getFieldError('title') ? (
                <span className={styles.inputErrorText}>{getFieldError('title')}</span>
              ) : (
                <span className={styles.inputHint}>
                  Clear, descriptive title that attracts students
                </span>
              )}
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.formLabel}>
                Description
                <span className={styles.labelOptional}>(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${styles.formTextarea} ${
                  (formData.description?.length ?? 0) > 500 ? styles.inputError : ''
                }`}
                rows={4}
                placeholder="Describe the course content, objectives, and what students will learn..."
                maxLength={500}
                disabled={isLoading}
              />
              <div className={styles.charCounter}>
                <span className={(formData.description?.length ?? 0) > 400 ? styles.charWarning : ''}>
                  {formData.description?.length || 0}/500
                </span>
                {(formData.description?.length ?? 0) > 450 && (
                  <span className={styles.charWarning}>⚠️ Almost at limit</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Schedule & Capacity Section ───────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📅</span>
              Schedule & Capacity
            </h3>
            <p className={styles.sectionDesc}>
              When the course runs and how many students can enroll
            </p>
          </div>

          <div className={styles.sectionBody}>
            {/* Academic Year & Semester */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="academic_year" className={styles.formLabel}>
                  Academic Year
                </label>
                <select
                  id="academic_year"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={styles.formSelect}
                  disabled={isLoading}
                >
                  {academicYears.map(year => (
                    <option key={year} value={year}>
                      {year} - {year + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="semester" className={styles.formLabel}>
                  Semester
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={styles.formSelect}
                  disabled={isLoading}
                >
                  {semesters.map(s => (
                    <option key={s} value={s}>
                      {s === 'Fall' ? '🍂' : s === 'Spring' ? '🌸' : '☀️'} {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Max Students */}
            <div className={styles.formGroup}>
              <label htmlFor="max_students" className={styles.formLabel}>
                Max Students <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="max_students"
                  name="max_students"
                  type="number"
                  min={1}
                  max={500}
                  value={formData.max_students}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.formInput} ${
                    getFieldError('max_students') ? styles.inputError : ''
                  }`}
                  required
                  disabled={isLoading}
                />
              </div>
              {getFieldError('max_students') ? (
                <span className={styles.inputErrorText}>{getFieldError('max_students')}</span>
              ) : (
                <span className={styles.inputHint}>
                  ⚠️ Cannot be lowered once students are enrolled
                </span>
              )}
            </div>

            {/* Active Status Toggle */}
            <div className={styles.toggleWrapper}>
              <label className={styles.toggleLabel}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleIcon}>
                    {formData.is_active ? '🟢' : '🔴'}
                  </span>
                  <div>
                    <span className={styles.toggleTitle}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={styles.toggleDesc}>
                      {formData.is_active 
                        ? 'Course is visible to students'
                        : 'Course is hidden from students'}
                    </span>
                  </div>
                </div>
                <div className={styles.toggle}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className={styles.toggleInput}
                    disabled={isLoading}
                  />
                  <span className={styles.toggleSlider} />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── Progress Preview ────────────────────────────────────────────── */}
        <div className={styles.progressPreview}>
          <div className={styles.progressPreviewHeader}>
            <span className={styles.progressPreviewIcon}>📊</span>
            <span className={styles.progressPreviewTitle}>Course Progress</span>
          </div>
          <div className={styles.progressPreviewBody}>
            <div className={styles.progressPreviewItem}>
              <span className={styles.progressPreviewLabel}>Completion</span>
              <div className={styles.progressPreviewBar}>
                <div 
                  className={styles.progressPreviewFill} 
                  style={{ 
                    width: `${Math.min(
                      ((formData.code ? 20 : 0) + 
                       (formData.title ? 20 : 0) + 
                       (formData.description ? 20 : 0) + 
                       (formData.credits ? 20 : 0) + 
                       (formData.max_students ? 20 : 0)), 
                      100
                    )}%` 
                  }} 
                />
              </div>
              <span className={styles.progressPreviewPercent}>
                {Math.min(
                  ((formData.code ? 20 : 0) + 
                   (formData.title ? 20 : 0) + 
                   (formData.description ? 20 : 0) + 
                   (formData.credits ? 20 : 0) + 
                   (formData.max_students ? 20 : 0)), 
                  100
                )}%
              </span>
            </div>
            <div className={styles.progressPreviewSteps}>
              <span className={`${styles.progressPreviewStep} ${formData.code ? styles.progressPreviewStepDone : ''}`}>
                {formData.code ? '✅' : '⬜'} Code
              </span>
              <span className={`${styles.progressPreviewStep} ${formData.title ? styles.progressPreviewStepDone : ''}`}>
                {formData.title ? '✅' : '⬜'} Title
              </span>
              <span className={`${styles.progressPreviewStep} ${formData.description ? styles.progressPreviewStepDone : ''}`}>
                {formData.description ? '✅' : '⬜'} Description
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Actions ────────────────────────────────────────────────── */}
      <div className={styles.formActions}>
        <div className={styles.formActionsLeft}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={isLoading || !isDirty}
          >
            <span className={styles.resetIcon}>↺</span>
            Reset
          </button>
        </div>
        <div className={styles.formActionsRight}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading || !isDirty}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>
                <span className={styles.submitIcon}>
                  {mode === 'create' ? '🚀' : '💾'}
                </span>
                {mode === 'create' ? 'Create Course' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};