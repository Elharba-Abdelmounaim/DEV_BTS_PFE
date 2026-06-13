import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourse } from '../../api/courses';
import type { Course, Assignment } from '../../types';
import styles from './CourseDetail.module.css';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseId) loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const data = await getCourse(courseId!);
      setCourse(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={styles.error}>
        {error || 'Cours introuvable'}
      </div>
    );
  }

  const assignments: Assignment[] = (course as any).assignments || [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.code}>{course.code}</div>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className={styles.meta}>
          <span>📅 {course.academic_year} - {course.semester}</span>
          <span>🎓 {course.credits} crédits</span>
          <span>👥 {course.max_students} places</span>
        </div>
      </header>

      <section className={styles.section}>
        <h2>Devoirs ({assignments.length})</h2>
        {assignments.length === 0 ? (
          <div className={styles.empty}>
            <p>Aucun devoir pour le moment</p>
          </div>
        ) : (
          <div className={styles.assignments}>
            {assignments.map((assignment) => (
              <Link
                key={assignment.id}
                to={`/assignments/${assignment.id}`}
                className={styles.assignmentCard}
              >
                <div className={styles.assignmentHeader}>
                  <h3>{assignment.title}</h3>
                  {assignment.is_published ? (
                    <span className={styles.published}>Publié</span>
                  ) : (
                    <span className={styles.draft}>Brouillon</span>
                  )}
                </div>
                {assignment.description && (
                  <p>{assignment.description}</p>
                )}
                <div className={styles.assignmentMeta}>
                  <span>📅 Échéance: {new Date(assignment.due_date).toLocaleDateString('fr-FR')}</span>
                  <span>🏆 {assignment.max_score} points</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}