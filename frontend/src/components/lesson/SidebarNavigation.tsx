// src/components/lesson/SidebarNavigation.tsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './SidebarNavigation.module.css';

interface LessonSummary {
  id: string;
  title: string;
  lesson_type: string;
  duration_minutes?: number;
  is_completed?: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons?: LessonSummary[];
  completed_lesson_ids?: string[];
}

interface SidebarNavigationProps {
  modules: Module[];
  activeLessonId: string | null;
  onSelectLesson: (lesson: LessonSummary, module: Module) => void;
  isTeacher?: boolean;
  onAddModule?: () => void;
  onAddLesson?: (moduleId: string) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  modules,
  activeLessonId,
  onSelectLesson,
  isTeacher,
  onAddModule,
  onAddLesson,
}) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>📚 Course Content</h3>
        {isTeacher && (
          <button className={styles.addModuleBtn} onClick={onAddModule}>
            + Module
          </button>
        )}
      </div>

      <div className={styles.moduleList}>
        {modules.map((module) => {
          const lessons = module.lessons || [];
          const completedIds = module.completed_lesson_ids || [];
          const completedCount = lessons.filter(l => completedIds.includes(l.id) || l.is_completed).length;
          const totalCount = lessons.length;
          const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div key={module.id} className={styles.module}>
              <div className={styles.moduleHeader}>
                <span className={styles.moduleTitle}>{module.title}</span>
                <span className={styles.moduleProgress}>
                  {completedCount}/{totalCount}
                </span>
              </div>

              <div className={styles.moduleProgressBar}>
                <div 
                  className={styles.moduleProgressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ul className={styles.lessonList}>
                {lessons.map((lesson) => {
                  const isActive = lesson.id === activeLessonId;
                  const isCompleted = completedIds.includes(lesson.id) || lesson.is_completed;

                  // Get icon based on lesson type
                  const getIcon = () => {
                    if (isCompleted) return '✅';
                    switch (lesson.lesson_type) {
                      case 'video': return '▶️';
                      case 'quiz': return '✏️';
                      case 'assignment': return '📝';
                      default: return '📄';
                    }
                  };

                  return (
                    <li key={lesson.id}>
                      <button
                        className={`${styles.lessonItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                        onClick={() => onSelectLesson(lesson, module)}
                      >
                        <span className={styles.lessonIcon}>{getIcon()}</span>
                        <span className={styles.lessonTitle}>{lesson.title}</span>
                        {lesson.duration_minutes && (
                          <span className={styles.lessonDuration}>{lesson.duration_minutes}m</span>
                        )}
                      </button>
                    </li>
                  );
                })}

                {isTeacher && (
                  <li>
                    <button 
                      className={styles.addLessonBtn}
                      onClick={() => onAddLesson?.(module.id)}
                    >
                      + Add Lesson
                    </button>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};