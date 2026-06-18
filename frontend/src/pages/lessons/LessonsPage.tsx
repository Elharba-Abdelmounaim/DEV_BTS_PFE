// src/pages/lessons/LessonsPage.tsx
import { useParams } from 'react-router-dom';
import CourseContentTab from '../courses/lessons/CourseContentTab';
import styles from './LessonsPage.module.css';

export default function LessonsPage() {
  const { courseId } = useParams<{ courseId: string }>();

  if (!courseId) {
    return <div>Course not found</div>;
  }

  return (
    <div className={styles.page}>
      <CourseContentTab courseId={courseId} />
    </div>
  );
}