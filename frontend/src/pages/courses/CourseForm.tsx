// src/pages/courses/CourseForm.tsx
import React, { useState, useEffect } from 'react';
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

  // Populate form with initial data
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
    }
  }, [initialData]);

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
    
    // Validation
    if (!formData.code.trim() || !formData.title.trim()) {
      setTouched({ code: true, title: true });
      return;
    }

    await onSubmit(formData);
    if (!error) {
      setIsDirty(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/courses');
  };

  const academicYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  const semesters = ['Fall', 'Spring', 'Summer'];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          {mode === 'create' ? '📚 Create New Course' : '✏️ Edit Course'}
        </h2>
        <p className={styles.formSubtitle}>
          {mode === 'create' 
            ? 'Fill in the details to create a new course' 
            : 'Update the course information'}
        </p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>❌</span>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.formBody}>
        {/* Code & Title */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="code" className={styles.formLabel}>
              Course Code <span className={styles.required}>*</span>
            </label>
            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.formInput} ${
                touched.code && !formData.code.trim() ? styles.inputError : ''
              }`}
              placeholder="e.g., CS101"
              required
              disabled={isLoading}
            />
            {touched.code && !formData.code.trim() && (
              <span className={styles.inputHint}>Course code is required</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.formLabel}>
              Course Title <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.formInput} ${
                touched.title && !formData.title.trim() ? styles.inputError : ''
              }`}
              placeholder="e.g., Introduction to Computer Science"
              required
              disabled={isLoading}
            />
            {touched.title && !formData.title.trim() && (
              <span className={styles.inputHint}>Course title is required</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.formLabel}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.formTextarea}
            rows={4}
            placeholder="Describe the course content and objectives..."
            maxLength={500}
            disabled={isLoading}
          />
          <div className={styles.charCounter}>
            <span>{(formData.description?.length || 0)}/500</span>
          </div>
        </div>

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
                <option key={year} value={year}>{year}-{year + 1}</option>
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
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Credits & Max Students */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="credits" className={styles.formLabel}>
              Credits
            </label>
            <input
              id="credits"
              name="credits"
              type="number"
              value={formData.credits}
              onChange={handleChange}
              onBlur={handleBlur}
              className={styles.formInput}
              min={1}
              max={10}
              disabled={isLoading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="max_students" className={styles.formLabel}>
              Max Students
            </label>
            <input
              id="max_students"
              name="max_students"
              type="number"
              value={formData.max_students}
              onChange={handleChange}
              onBlur={handleBlur}
              className={styles.formInput}
              min={1}
              max={500}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Active Status */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={isLoading}
            />
            <span className={styles.checkboxText}>
              <strong>Active</strong>
              <span className={styles.checkboxSubtext}>
                — Course will be visible to students
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className={styles.formActions}>
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
            mode === 'create' ? '🚀 Create Course' : '💾 Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};