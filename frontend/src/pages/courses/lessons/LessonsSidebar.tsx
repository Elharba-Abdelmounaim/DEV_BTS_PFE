import styles from './LessonsSidebar.module.css'
import type { CourseModule, LessonSummary } from '@/types/lessons'

interface Props {
  modules:          CourseModule[]
  activeLessonId:   string | null
  onSelectLesson:   (lesson: LessonSummary, module: CourseModule) => void
  isTeacher?:       boolean
  onAddModule?:     () => void
  onAddLesson?:     (moduleId: string) => void
}

const LESSON_TYPE_ICON: Record<string, string> = {
  video:   '▶',
  reading: '📄',
  quiz:    '✏️',
  lab:     '⚗️',
}

function formatDuration(lesson: LessonSummary): string | null {
  if (lesson.lesson_type === 'video' && lesson.duration_minutes) {
    return `${lesson.duration_minutes} min`
  }
  if (lesson.lesson_type === 'reading' && lesson.reading_time_minutes) {
    return `${lesson.reading_time_minutes} min read`
  }
  return null
}

export default function LessonsSidebar({
  modules,
  activeLessonId,
  onSelectLesson,
  isTeacher,
  onAddModule,
  onAddLesson,
}: Props) {
  if (modules.length === 0) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.empty}>
          {isTeacher ? (
            <>
              <p>No modules yet.</p>
              <button className={styles.addModuleBtn} onClick={onAddModule}>
                + Add first module
              </button>
            </>
          ) : (
            <p>Content coming soon.</p>
          )}
        </div>
      </aside>
    )
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.moduleList}>
        {modules.map(module => {
          const lessons = module.lessons ?? []
          const completedIds = module.completed_lesson_ids ?? []
          const doneCount = completedIds.length
          const allDone = lessons.length > 0 && doneCount === lessons.length

          return (
            <div key={module.id} className={styles.module}>
              {/* Module header */}
              <div className={styles.moduleHead}>
                <div className={styles.moduleMeta}>
                  {allDone && <span className={styles.moduleDone}>✓</span>}
                  <span className={styles.moduleTitle}>{module.title}</span>
                </div>
                <span className={styles.moduleCount}>
                  {!isTeacher && doneCount > 0
                    ? `${doneCount}/${lessons.length}`
                    : lessons.length}
                </span>
              </div>

              {/* Lesson rows */}
              <ul className={styles.lessonList}>
                {lessons.map(lesson => {
                  const isActive    = lesson.id === activeLessonId
                  const isCompleted = completedIds.includes(lesson.id) || lesson.is_completed
                  const duration    = formatDuration(lesson)

                  return (
                    <li key={lesson.id}>
                      <button
                        className={`${styles.lessonRow} ${isActive ? styles.lessonActive : ''} ${isCompleted ? styles.lessonDone : ''}`}
                        onClick={() => onSelectLesson(lesson, module)}
                      >
                        {/* Completion indicator */}
                        <span className={`${styles.lessonDot} ${isCompleted ? styles.lessonDotDone : ''}`}>
                          {isCompleted ? '✓' : LESSON_TYPE_ICON[lesson.lesson_type] ?? '•'}
                        </span>

                        <div className={styles.lessonInfo}>
                          <span className={styles.lessonTitle}>{lesson.title}</span>
                          <div className={styles.lessonMeta}>
                            {!lesson.is_published && isTeacher && (
                              <span className={styles.draftPill}>Draft</span>
                            )}
                            {lesson.is_free_preview && (
                              <span className={styles.freePill}>Free</span>
                            )}
                            {duration && (
                              <span className={styles.duration}>{duration}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}

                {/* Teacher: add lesson button */}
                {isTeacher && (
                  <li>
                    <button
                      className={styles.addLessonBtn}
                      onClick={() => onAddLesson?.(module.id)}
                    >
                      + Add lesson
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Teacher: add module button */}
      {isTeacher && (
        <button className={styles.addModuleBtn} onClick={onAddModule}>
          + Add module
        </button>
      )}
    </aside>
  )
}
