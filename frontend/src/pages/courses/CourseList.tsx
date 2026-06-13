import { useEffect, useState } from 'react';
import { getCourses, enrollInCourse } from '../../api/courses';
import CourseCard from '../../components/ui/CourseCard';
import type { Course } from '../../types';
import styles from './CourseList.module.css';

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollInCourse(courseId);
      await loadCourses();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
        <p>Chargement des cours...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Cours disponibles</h1>
        <p>Parcourez les cours actifs et inscrivez-vous</p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {courses.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📚</div>
          <p>Aucun cours disponible pour le moment</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      )}
    </div>
  );
}