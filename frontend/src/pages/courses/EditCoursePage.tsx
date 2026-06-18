// src/pages/courses/EditCoursePage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { coursesApi } from '../../api/courses';
import { CourseForm } from './CourseForm';
import type { Course, CreateCoursePayload } from '../../types';
import styles from './CourseForm.module.css';

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Load Course ──────────────────────────────────────────────────────────
  const loadCourse = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await coursesApi.get(id);
      setCourse(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSubmit = async (data: CreateCoursePayload) => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);
      
      await coursesApi.update(id, {
        ...data,
        academic_year: Number(data.academic_year),
        credits: Number(data.credits),
        max_students: Number(data.max_students),
      });

      navigate(`/courses/${id}`, { 
        state: { updated: true, courseTitle: data.title } 
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update course');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleteLoading(true);
      await coursesApi.delete(id);
      navigate('/courses', { 
        state: { deleted: true, courseTitle: course?.title } 
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete course');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
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
  if (error && !course) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>😕</span>
          <h2 className={styles.errorTitle}>Course not found</h2>
          <p className={styles.errorText}>{error}</p>
          <Link to="/courses" className={styles.errorBackLink}>
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>🔍</span>
          <h2 className={styles.errorTitle}>Course not found</h2>
          <p className={styles.errorText}>The course you are looking for does not exist.</p>
          <Link to="/courses" className={styles.errorBackLink}>
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.page} page-enter`}>
      
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to={`/courses/${id}`} className={styles.backLink}>
            <span className={styles.backArrow}>←</span> 
            Back to Course
          </Link>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>✏️</span>
            Edit Course
          </h1>
          <p className={styles.subtitle}>
            Update details for <strong>"{course.title}"</strong>
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.courseStatusBadge}>
            <span className={`${styles.statusDot} ${course.is_active ? styles.statusActive : styles.statusInactive}`} />
            {course.is_active ? 'Active' : 'Inactive'}
          </div>
          <div className={styles.courseCodeBadge}>
            {course.code}
          </div>
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────────── */}
      <CourseForm
        initialData={course}
        onSubmit={handleSubmit}
        isLoading={saving}
        error={error}
        mode="edit"
      />

      {/* ── Delete Modal ───────────────────────────────────────────────────── */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>⚠️</div>
            <h3 className={styles.modalTitle}>Delete Course?</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete <strong>"{course.title}"</strong>?
              This action cannot be undone and will remove:
            </p>
            <ul className={styles.modalList}>
              <li>📚 All course content and materials</li>
              <li>📝 All assignments and submissions</li>
              <li>👥 All student enrollments</li>
              <li>📊 All progress and grades</li>
            </ul>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalCancelBtn}
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className={styles.modalDeleteBtn}
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span className={styles.spinner} />
                    Deleting...
                  </>
                ) : (
                  '🗑️ Delete Course'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Button (floating) ───────────────────────────────────────── */}
      <div className={styles.deleteButtonWrapper}>
        <button
          className={styles.deleteFloatingBtn}
          onClick={() => setShowDeleteModal(true)}
        >
          🗑️ Delete Course
        </button>
      </div>
    </div>
  );
}