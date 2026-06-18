// src/pages/courses/lessons/CourseContentTab.tsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { modulesApi, lessonsApi } from '../../../api/lessons';
import type { CourseModule, CourseProgress as CourseProgressType, Lesson, LessonSummary } from '../../../types';
import CourseProgressComponent from '../../../components/layout/CourseProgress';
import LessonsSidebar from './LessonsSidebar';
import LessonViewer from './LessonViewer';
import LessonForm from './LessonForm';
import styles from './CourseContentTab.module.css';

interface Props {
  courseId: string;
}

export default function CourseContentTab({ courseId }: Props) {
  const { isTeacher } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState<CourseProgressType | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formModule, setFormModule] = useState<CourseModule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // ── Computed Values ──────────────────────────────────────────────────────
  const allLessons = useMemo(() => {
    return modules.flatMap(m => 
      ((m as any).lessons ?? []).map((l: LessonSummary) => ({ lesson: l, module: m }))
    );
  }, [modules]);

  const currentIdx = useMemo(() => {
    return activeLesson
      ? allLessons.findIndex(x => x.lesson.id === activeLesson.id)
      : -1;
  }, [allLessons, activeLesson]);

  const totalLessons = useMemo(() => {
    return modules.reduce((sum, m) => sum + ((m as any).lessons?.length || 0), 0);
  }, [modules]);

  const completedLessons = useMemo(() => {
    return modules.reduce((sum, m) => {
      const completedIds = (m as any).completed_lesson_ids || [];
      return sum + completedIds.length;
    }, 0);
  }, [modules]);

  const progressPercent = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  // ── Load Modules ──────────────────────────────────────────────────────────
  const loadModules = useCallback(async () => {
    try {
      const result = await modulesApi.list(courseId);
      setModules(result.data);
      return result.data;
    } catch (err: any) {
      setError(err?.message || 'Failed to load modules');
      return [];
    }
  }, [courseId]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const mods = await loadModules();

        // Auto-open first available lesson for students
        if (!isTeacher && mods.length > 0) {
          const firstModule = mods[0];
          const firstLesson = (firstModule as any).lessons?.[0];
          if (firstLesson) {
            await handleSelectLesson(firstLesson, firstModule);
          }
        }

        // Load progress for students
        if (!isTeacher) {
          try {
            const prog = await lessonsApi.progress(courseId);
            setProgress(prog);
          } catch (err) {
            console.error('Failed to load progress:', err);
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to initialize course content');
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, isTeacher]);

  // ── Select Lesson ────────────────────────────────────────────────────────
  const handleSelectLesson = async (summary: LessonSummary, mod: CourseModule) => {
    setActiveModule(mod);
    setLoadingLesson(true);
    setShowForm(false);
    setError(null);
    
    try {
      const full = await lessonsApi.get(courseId, mod.id, summary.id);
      setActiveLesson(full);
    } catch (err: any) {
      setError(err?.message || 'Failed to load lesson');
      setActiveLesson(null);
    } finally {
      setLoadingLesson(false);
    }
  };

  // ── Progress Update ──────────────────────────────────────────────────────
  const handleComplete = (result: { 
    is_completed: boolean; 
    completed_count: number; 
    total_lessons: number 
  }) => {
    // Update sidebar completion state
    setModules((prev: CourseModule[]) =>
      prev.map(mod => {
        if (!activeLesson || !activeLesson.module_id || mod.id !== activeLesson.module_id) return mod;
        const completedIds = (mod as any).completed_lesson_ids ?? [];
        const newIds = result.is_completed
          ? [...new Set([...completedIds, activeLesson.id])]
          : completedIds.filter((id: string) => id !== activeLesson.id);
        return { ...mod, completed_lesson_ids: newIds };
      })
    );

    // Update progress bar
    setProgress((prev: CourseProgressType | null) => prev
      ? { 
          ...prev, 
          completed_lessons: result.completed_count, 
          percent: Math.round((result.completed_count / result.total_lessons) * 100) 
        }
      : null
    );

    // Update active lesson is_completed flag
    setActiveLesson((prev: Lesson | null) => 
      prev ? { ...prev, is_completed: result.is_completed } : null
    );
  };

  // ── Navigation ───────────────────────────────────────────────────────────
  const goPrev = currentIdx > 0
    ? () => handleSelectLesson(allLessons[currentIdx - 1].lesson, allLessons[currentIdx - 1].module)
    : undefined;

  const goNext = currentIdx < allLessons.length - 1
    ? () => handleSelectLesson(allLessons[currentIdx + 1].lesson, allLessons[currentIdx + 1].module)
    : undefined;

  // ── Teacher: Add/Edit Lesson ────────────────────────────────────────────
  const openAddLesson = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    setFormModule(mod);
    setEditingLesson(null);
    setShowForm(true);
    setActiveLesson(null);
  };

  const openEditLesson = () => {
    if (!activeLesson || !activeModule) return;
    setFormModule(activeModule);
    setEditingLesson(activeLesson);
    setShowForm(true);
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) {
      setError('Module title is required');
      return;
    }
    
    try {
      const mod = await modulesApi.create(courseId, { 
        title: newModuleTitle.trim(), 
        is_published: true 
      });
      setModules(prev => [...prev, { ...mod, lessons: [] }]);
      setShowAddModuleModal(false);
      setNewModuleTitle('');
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to create module');
    }
  };

  const handleFormSuccess = async (saved: Lesson) => {
    setShowForm(false);
    setEditingLesson(null);
    const mods = await loadModules();
    if (mods && formModule) {
      const updatedModule = mods.find(m => m.id === formModule.id);
      if (updatedModule) {
        const savedSummary = (updatedModule as any).lessons?.find((l: LessonSummary) => l.id === saved.id);
        if (savedSummary) {
          await handleSelectLesson(savedSummary, updatedModule);
        }
      }
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonLayout}>
          <div className={styles.skeletonSidebar}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.skeletonItem} />
            ))}
          </div>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonBody} />
            <div className={styles.skeletonActions} />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && !modules.length) {
    return (
      <div className={styles.errorContainer}>
        <span className={styles.errorIcon}>😕</span>
        <h3 className={styles.errorTitle}>Something went wrong</h3>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryBtn} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // ── Empty State ──────────────────────────────────────────────────────────
  if (!modules.length && !loading) {
    return (
      <div className={styles.emptyContainer}>
        <span className={styles.emptyIcon}>📚</span>
        <h3 className={styles.emptyTitle}>No content yet</h3>
        <p className={styles.emptyText}>
          {isTeacher 
            ? 'Start building your course by adding modules and lessons.'
            : 'This course has no content available yet. Check back later!'}
        </p>
        {isTeacher && (
          <button 
            className={styles.emptyBtn}
            onClick={() => setShowAddModuleModal(true)}
          >
            ➕ Add First Module
          </button>
        )}
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.headerTitle}>
            <span className={styles.headerIcon}>📖</span>
            Course Content
          </h2>
          <span className={styles.headerStats}>
            {totalLessons} lessons · {modules.length} modules
            {!isTeacher && progress && (
              <span className={styles.headerProgress}>
                · {progressPercent}% complete
              </span>
            )}
          </span>
        </div>
        {isTeacher && (
          <div className={styles.headerActions}>
            <button 
              className={styles.addModuleBtn}
              onClick={() => setShowAddModuleModal(true)}
            >
              <span className={styles.btnIcon}>➕</span>
              New Module
            </button>
          </div>
        )}
      </div>

      {/* ── Progress Bar ──────────────────────────────────────────────────── */}
      {!isTeacher && progress && progress.total_lessons > 0 && (
        <CourseProgressComponent
          completed={progress.completed_lessons}
          total={progress.total_lessons}
          pct={progress.percent}
        />
      )}

      {/* ── Layout ────────────────────────────────────────────────────────── */}
      <div className={styles.layout}>
        {/* Sidebar */}
        <LessonsSidebar
          modules={modules}
          activeLessonId={activeLesson?.id ?? null}
          onSelectLesson={handleSelectLesson}
          isTeacher={isTeacher}
          onAddModule={() => setShowAddModuleModal(true)}
          onAddLesson={openAddLesson}
        />

        {/* Main Content */}
        <main className={styles.main}>
          {showForm && formModule ? (
            <LessonForm
              courseId={courseId}
              module={formModule}
              lesson={editingLesson}
              onSuccess={handleFormSuccess}
              onCancel={() => { 
                setShowForm(false); 
                setEditingLesson(null); 
              }}
            />
          ) : loadingLesson ? (
            <div className={styles.lessonSkeleton}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonBody} />
            </div>
          ) : activeLesson ? (
            <LessonViewer
              lesson={activeLesson}
              courseId={courseId}
              isTeacher={isTeacher}
              progress={progress ?? undefined}
              onComplete={handleComplete}
              onEdit={isTeacher ? openEditLesson : undefined}
              onNext={goNext}
              onPrev={goPrev}
            />
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>👈</span>
              <p className={styles.emptyText}>
                {isTeacher
                  ? 'Select a lesson from the sidebar to preview, or add new content.'
                  : 'Select a lesson from the sidebar to start learning!'}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ── Add Module Modal ─────────────────────────────────────────────── */}
      {showAddModuleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModuleModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>📦</div>
            <h3 className={styles.modalTitle}>Create New Module</h3>
            <p className={styles.modalText}>
              A module is a collection of lessons grouped by topic or week.
            </p>
            <div className={styles.modalForm}>
              <label className={styles.modalLabel}>
                Module Title
              </label>
              <input
                type="text"
                className={styles.modalInput}
                placeholder="e.g., Week 1: Introduction"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                autoFocus
              />
              {error && (
                <span className={styles.modalError}>{error}</span>
              )}
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalCancelBtn}
                onClick={() => {
                  setShowAddModuleModal(false);
                  setNewModuleTitle('');
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.modalSubmitBtn}
                onClick={handleAddModule}
                disabled={!newModuleTitle.trim()}
              >
                Create Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}