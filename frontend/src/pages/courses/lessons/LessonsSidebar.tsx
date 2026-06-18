// src/pages/courses/lessons/LessonsSidebar.tsx
import { useState } from 'react';
import styles from './LessonsSidebar.module.css';
import type { CourseModule, LessonSummary, LessonType } from '../../../types';

interface Props {
  modules: CourseModule[];
  activeLessonId: string | null;
  onSelectLesson: (lesson: LessonSummary, module: CourseModule) => void;
  isTeacher?: boolean;
  onAddModule?: () => void;
  onAddLesson?: (moduleId: string) => void;
}

const LESSON_TYPE_ICON: Record<LessonType, string> = {
  video: '▶️',
  reading: '📖',
  quiz: '✏️',
  assignment: '⚗️',
};

const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  video: 'Video',
  reading: 'Reading',
  quiz: 'Quiz',
  assignment: 'Lab',
};

function formatDuration(lesson: LessonSummary): string | null {
  if (lesson.lesson_type === 'video' && lesson.duration_minutes) {
    return `${lesson.duration_minutes}m`;
  }
  if (lesson.lesson_type === 'reading' && lesson.reading_time_minutes) {
    return `${lesson.reading_time_minutes}min read`;
  }
  return null;
}

// ── Module Component ─────────────────────────────────────────────────────────
function ModuleItem({ 
  module, 
  activeLessonId, 
  onSelectLesson, 
  isTeacher, 
  onAddLesson,
  isExpanded: initialExpanded,
}: {
  module: CourseModule;
  activeLessonId: string | null;
  onSelectLesson: (lesson: LessonSummary, module: CourseModule) => void;
  isTeacher?: boolean;
  onAddLesson?: (moduleId: string) => void;
  isExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(initialExpanded ?? true);
  
  const lessons: LessonSummary[] = (module as any).lessons ?? [];
  const completedIds: string[] = (module as any).completed_lesson_ids ?? [];
  const doneCount = completedIds.length;
  const allDone = lessons.length > 0 && doneCount === lessons.length;
  const progressPercent = lessons.length > 0 ? Math.round((doneCount / lessons.length) * 100) : 0;

  const toggleExpand = () => setExpanded(!expanded);

  // Check if this module contains the active lesson
  const hasActiveLesson = lessons.some(l => l.id === activeLessonId);
  
  // Auto-expand if it has the active lesson
  if (hasActiveLesson && !expanded) {
    // We'll use useEffect pattern, but for simplicity we'll just set it
    setTimeout(() => setExpanded(true), 0);
  }

  return (
    <div className={styles.module}>
      {/* Module header */}
      <div 
        className={`${styles.moduleHead} ${allDone ? styles.moduleHeadDone : ''}`}
        onClick={toggleExpand}
      >
        <div className={styles.moduleHeadLeft}>
          <span className={`${styles.moduleChevron} ${expanded ? styles.moduleChevronOpen : ''}`}>
            ▶
          </span>
          <div className={styles.moduleMeta}>
            <span className={styles.moduleTitle}>{module.title}</span>
            {allDone && (
              <span className={styles.moduleDoneBadge}>
                <span className={styles.moduleDoneIcon}>✅</span> Done
              </span>
            )}
            {!isTeacher && !allDone && progressPercent > 0 && (
              <span className={styles.moduleProgressText}>
                {progressPercent}%
              </span>
            )}
          </div>
        </div>
        <div className={styles.moduleHeadRight}>
          {!isTeacher && (
            <div className={styles.moduleProgress}>
              <div 
                className={styles.moduleProgressFill} 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
          <span className={styles.moduleCount}>
            {lessons.length}
          </span>
        </div>
      </div>

      {/* Lesson list */}
      {expanded && (
        <ul className={styles.lessonList}>
          {lessons.map((lesson: LessonSummary) => {
            const isActive = lesson.id === activeLessonId;
            const isCompleted = completedIds.includes(lesson.id) || lesson.is_completed;
            const duration = formatDuration(lesson);
            const typeIcon = LESSON_TYPE_ICON[lesson.lesson_type] ?? '📚';
            const typeLabel = LESSON_TYPE_LABEL[lesson.lesson_type] ?? 'Lesson';

            return (
              <li key={lesson.id}>
                <button
                  className={`${styles.lessonRow} 
                    ${isActive ? styles.lessonActive : ''} 
                    ${isCompleted ? styles.lessonDone : ''}`}
                  onClick={() => onSelectLesson(lesson, module)}
                >
                  {/* Status indicator */}
                  <span className={styles.lessonStatus}>
                    {isCompleted ? (
                      <span className={styles.lessonStatusDone}>✅</span>
                    ) : isActive ? (
                      <span className={styles.lessonStatusActive}>●</span>
                    ) : (
                      <span className={styles.lessonStatusIcon}>{typeIcon}</span>
                    )}
                  </span>

                  <div className={styles.lessonInfo}>
                    <span className={styles.lessonTitle}>
                      {lesson.title}
                    </span>
                    <div className={styles.lessonMeta}>
                      <span className={styles.lessonType}>{typeLabel}</span>
                      {!lesson.is_published && isTeacher && (
                        <span className={styles.draftPill}>Draft</span>
                      )}
                      {lesson.is_free_preview && (
                        <span className={styles.freePill}>🔓 Free</span>
                      )}
                      {duration && (
                        <span className={styles.lessonDuration}>{duration}</span>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <span className={styles.lessonActiveIndicator}>
                      <span className={styles.lessonActiveDot} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}

          {/* Teacher: add lesson button */}
          {isTeacher && (
            <li>
              <button
                className={styles.addLessonBtn}
                onClick={() => onAddLesson?.(module.id)}
              >
                <span className={styles.addLessonIcon}>＋</span>
                Add Lesson
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LessonsSidebar({
  modules,
  activeLessonId,
  onSelectLesson,
  isTeacher,
  onAddModule,
  onAddLesson,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  // ── Filter modules by search ──────────────────────────────────────────────
  const filteredModules = modules.filter(module => {
    if (!searchQuery) return true;
    const lessons: LessonSummary[] = (module as any).lessons ?? [];
    const matchesModule = module.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLesson = lessons.some(l => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesModule || matchesLesson;
  });

  // ── Empty State ────────────────────────────────────────────────────────────
  if (modules.length === 0) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📚</span>
          <p className={styles.emptyText}>
            {isTeacher 
              ? 'No modules yet. Start building your course!'
              : 'Content coming soon.'}
          </p>
          {isTeacher && (
            <button className={styles.emptyAddBtn} onClick={onAddModule}>
              ＋ Add First Module
            </button>
          )}
        </div>
      </aside>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <aside className={styles.sidebar}>
      {/* Search */}
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search lessons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className={styles.searchClear}
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Module count */}
      <div className={styles.sidebarStats}>
        <span className={styles.statsModules}>
          {modules.length} Module{modules.length > 1 ? 's' : ''}
        </span>
        <span className={styles.statsLessons}>
          {modules.reduce((acc, m) => acc + ((m as any).lessons?.length || 0), 0)} Lessons
        </span>
        {!isTeacher && (
          <span className={styles.statsProgress}>
            {Math.round(
              (modules.reduce((acc, m) => {
                const ids: string[] = (m as any).completed_lesson_ids ?? [];
                return acc + ids.length;
              }, 0) / modules.reduce((acc, m) => acc + ((m as any).lessons?.length || 0), 0)) * 100
            ) || 0}% Complete
          </span>
        )}
      </div>

      {/* Module List */}
      <div className={styles.moduleList}>
        {filteredModules.length === 0 ? (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>🔍</span>
            <p className={styles.noResultsText}>
              No lessons found for "{searchQuery}"
            </p>
          </div>
        ) : (
          filteredModules.map((module: CourseModule) => (
            <ModuleItem
              key={module.id}
              module={module}
              activeLessonId={activeLessonId}
              onSelectLesson={onSelectLesson}
              isTeacher={isTeacher}
              onAddLesson={onAddLesson}
              isExpanded={module.id === modules[0]?.id}
            />
          ))
        )}
      </div>

      {/* Teacher: add module button */}
      {isTeacher && (
        <div className={styles.sidebarFooter}>
          <button className={styles.addModuleBtn} onClick={onAddModule}>
            <span className={styles.addModuleIcon}>＋</span>
            Add Module
          </button>
        </div>
      )}
    </aside>
  );
}