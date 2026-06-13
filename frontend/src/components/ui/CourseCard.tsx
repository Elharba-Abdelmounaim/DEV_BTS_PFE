import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: Course;
  enrolled?: boolean;
  onEnroll?: (courseId: string) => void;
}

export default function CourseCard({ course, enrolled, onEnroll }: CourseCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.code}>{course.code}</span>
        <span className={styles.credits}>{course.credits} crédits</span>
      </div>
      <h3 className={styles.title}>{course.title}</h3>
      {course.description && (
        <p className={styles.description}>{course.description}</p>
      )}
      <div className={styles.meta}>
        <span>📅 {course.academic_year} - {course.semester}</span>
        <span>👥 {course.max_students} places</span>
      </div>
      <div className={styles.footer}>
        <Link to={`/courses/${course.id}`} className={styles.viewBtn}>
          Voir le cours
        </Link>
        {onEnroll && !enrolled && (
          <button
            onClick={() => onEnroll(course.id)}
            className={styles.enrollBtn}
          >
            S'inscrire
          </button>
        )}
        {enrolled && (
          <span className={styles.enrolledBadge}>✓ Inscrit</span>
        )}
      </div>
    </div>
  );
}