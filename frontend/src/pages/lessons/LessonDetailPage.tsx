// src/pages/lessons/LessonDetailPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { lessonsApi } from '../../api/lessons';
import LessonViewer from '../courses/lessons/LessonViewer';
import type { Lesson, CourseProgress } from '../../types';
import styles from './LessonDetailPage.module.css';

export default function LessonDetailPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress] = useState<CourseProgress | null>(null);

  useEffect(() => {
    if (courseId && lessonId) {
      loadLesson();
    }
  }, [courseId, lessonId]);

  const loadLesson = async () => {
    if (!courseId || !lessonId) return;
    try {
      setLoading(true);
      // Note: You'll need to get moduleId from somewhere
      // For now, we'll just show the lesson viewer
      const data = await lessonsApi.get(courseId, 'moduleId', lessonId);
      setLesson(data);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading lesson...</div>;
  }

  if (!lesson) {
    return <div className={styles.error}>Lesson not found</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to={`/courses/${courseId}`}>Course</Link>
        <span>›</span>
        <Link to={`/courses/${courseId}/lessons`}>Lessons</Link>
        <span>›</span>
        <span>{lesson.title}</span>
      </div>
      
      <LessonViewer
        lesson={lesson}
        courseId={courseId || ''}
        isTeacher={false}
        progress={progress || undefined}
        onComplete={(result) => {
          console.log('Lesson completed:', result);
        }}
        onNext={() => {}}
        onPrev={() => {}}
      />
    </div>
  );
}