import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { modulesApi, lessonsApi } from '@/api/lessons'
import type { CourseModule, CourseProgress as CourseProgressType, Lesson, LessonSummary } from '../../../types'
import CourseProgressComponent from '@/components/layout/CourseProgress'
import LessonsSidebar from './LessonsSidebar'
import LessonViewer   from './LessonViewer'
import LessonForm     from './LessonForm'
import styles from './CourseContentTab.module.css'

interface Props {
  courseId: string
}

export default function CourseContentTab({ courseId }: Props) {
  const { isTeacher } = useAuth()

  const [modules,        setModules]        = useState<CourseModule[]>([])
  const [progress,       setProgress]       = useState<CourseProgressType | null>(null)
  const [activeLesson,   setActiveLesson]   = useState<Lesson | null>(null)
  const [activeModule,   setActiveModule]   = useState<CourseModule | null>(null)
  const [loadingLesson,  setLoadingLesson]  = useState(false)
  const [loading,        setLoading]        = useState(true)
  const [showForm,       setShowForm]       = useState(false)
  const [editingLesson,  setEditingLesson]  = useState<Lesson | null>(null)
  const [formModule,     setFormModule]     = useState<CourseModule | null>(null)

  // ── Load modules ────────────────────────────────────────────────────────────
  const loadModules = useCallback(async () => {
    const result = await modulesApi.list(courseId)
    setModules(result.data)
    return result.data
  }, [courseId])

  useEffect(() => {
    const init = async () => {
      try {
        const mods = await loadModules()

        // Auto-open first available lesson
        if (!isTeacher && mods.length > 0) {
          const firstModule  = mods[0]
          const firstLesson  = (firstModule as any).lessons?.[0]
          if (firstLesson) {
            handleSelectLesson(firstLesson, firstModule)
          }
        }

        // Load progress for students
        if (!isTeacher) {
          const prog = await lessonsApi.progress(courseId)
          setProgress(prog)
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [courseId, isTeacher])

  // ── Select and load a lesson ─────────────────────────────────────────────────
  const handleSelectLesson = async (summary: LessonSummary, mod: CourseModule) => {
    setActiveModule(mod)
    setLoadingLesson(true)
    setShowForm(false)
    try {
      const full = await lessonsApi.get(courseId, mod.id, summary.id)
      setActiveLesson(full)
    } finally {
      setLoadingLesson(false)
    }
  }

  // ── Progress update after completing a lesson ────────────────────────────────
  const handleComplete = (result: { is_completed: boolean; completed_count: number; total_lessons: number }) => {
    // Update sidebar completion state
    setModules((prev: CourseModule[]) =>
      prev.map(mod => {
        if (!activeLesson || !activeLesson.module_id || mod.id !== activeLesson.module_id) return mod
        const completedIds = (mod as any).completed_lesson_ids ?? []
        const newIds = result.is_completed
          ? [...new Set([...completedIds, activeLesson.id])]
          : completedIds.filter((id: string) => id !== activeLesson.id)
        return { ...mod, completed_lesson_ids: newIds }
      })
    )

    // Update progress bar
    setProgress((prev: CourseProgressType | null) => prev
      ? { ...prev, completed_lessons: result.completed_count, percent: Math.round((result.completed_count / result.total_lessons) * 100) }
      : null
    )

    // Update active lesson is_completed flag
    setActiveLesson((prev: Lesson | null) => prev ? { ...prev, is_completed: result.is_completed } : null)
  }

  // ── Navigation: prev/next lesson ────────────────────────────────────────────
  const allLessons = modules.flatMap(m => ((m as any).lessons ?? []).map((l: LessonSummary) => ({ lesson: l, module: m })))
  const currentIdx = activeLesson
    ? allLessons.findIndex(x => x.lesson.id === activeLesson.id)
    : -1

  const goPrev = currentIdx > 0
    ? () => handleSelectLesson(allLessons[currentIdx - 1].lesson, allLessons[currentIdx - 1].module)
    : undefined

  const goNext = currentIdx < allLessons.length - 1
    ? () => handleSelectLesson(allLessons[currentIdx + 1].lesson, allLessons[currentIdx + 1].module)
    : undefined

  // ── Teacher: add/edit lesson form ────────────────────────────────────────────
  const openAddLesson = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId)
    if (!mod) return
    setFormModule(mod)
    setEditingLesson(null)
    setShowForm(true)
    setActiveLesson(null)
  }

  const openEditLesson = () => {
    if (!activeLesson || !activeModule) return
    setFormModule(activeModule)
    setEditingLesson(activeLesson)
    setShowForm(true)
  }

  const openAddModule = async () => {
    const title = window.prompt('Module title (e.g. "Week 1: Introduction")')
    if (!title) return
    const mod = await modulesApi.create(courseId, { title, is_published: true })
    setModules(prev => [...prev, { ...mod, lessons: [] }])
  }

  const handleFormSuccess = async (saved: Lesson) => {
    setShowForm(false)
    setEditingLesson(null)
    await loadModules()
    if (formModule) {
      handleSelectLesson({ ...saved, is_completed: false }, formModule)
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
      </div>
    )
  }

  return (
    <div className={styles.root}>
      {/* Progress bar (student only) */}
      {!isTeacher && progress && progress.total_lessons > 0 && (
        <CourseProgressComponent
          completed={progress.completed_lessons}
          total={progress.total_lessons}
          pct={progress.percent}
        />
      )}

      <div className={styles.layout}>
        {/* Sidebar */}
        <LessonsSidebar
          modules={modules}
          activeLessonId={activeLesson?.id ?? null}
          onSelectLesson={handleSelectLesson}
          isTeacher={isTeacher}
          onAddModule={openAddModule}
          onAddLesson={openAddLesson}
        />

        {/* Main content area */}
        <main className={styles.main}>
          {showForm && formModule ? (
            <LessonForm
              courseId={courseId}
              module={formModule}
              lesson={editingLesson}
              onSuccess={handleFormSuccess}
              onCancel={() => { setShowForm(false); setEditingLesson(null) }}
            />
          ) : loadingLesson ? (
            <div className={styles.lessonSkeleton} />
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
              {isTeacher
                ? <p>Select a lesson to preview, or add a new module to get started.</p>
                : <p>Select a lesson from the sidebar to begin learning.</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
