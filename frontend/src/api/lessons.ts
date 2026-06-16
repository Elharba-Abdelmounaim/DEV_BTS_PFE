import { api } from './client'
import type {
  CourseModule,
  CourseProgress,
  Lesson,
  LessonSummary,
} from '../types'

// ── Modules ───────────────────────────────────────────────────────────────────

export const modulesApi = {
  /** List all modules for a course (with lesson summaries). */
  list: (courseId: string) =>
    api.get<{ data: CourseModule[]; total_lessons: number }>(
      `/courses/${courseId}/modules`
    ).then(r => r.data),

  get: (courseId: string, moduleId: string) =>
    api.get<CourseModule>(`/courses/${courseId}/modules/${moduleId}`).then(r => r.data),

  create: (courseId: string, payload: {
    title: string
    description?: string
    is_published?: boolean
  }) =>
    api.post<CourseModule>(`/courses/${courseId}/modules`, payload).then(r => r.data),

  update: (courseId: string, moduleId: string, payload: Partial<{
    title: string
    description: string
    is_published: boolean
    order_index: number
  }>) =>
    api.put<CourseModule>(`/courses/${courseId}/modules/${moduleId}`, payload).then(r => r.data),

  delete: (courseId: string, moduleId: string) =>
    api.delete(`/courses/${courseId}/modules/${moduleId}`).then(r => r.data),

  reorder: (courseId: string, order: string[]) =>
    api.post(`/courses/${courseId}/modules/reorder`, { order }).then(r => r.data),
}

// ── Lessons ───────────────────────────────────────────────────────────────────

export const lessonsApi = {
  list: (courseId: string, moduleId: string) =>
    api.get<LessonSummary[]>(
      `/courses/${courseId}/modules/${moduleId}/lessons`
    ).then(r => r.data),

  get: (courseId: string, moduleId: string, lessonId: string) =>
    api.get<Lesson>(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`
    ).then(r => r.data),

  create: (courseId: string, moduleId: string, payload: Partial<Lesson>) =>
    api.post<Lesson>(
      `/courses/${courseId}/modules/${moduleId}/lessons`,
      payload
    ).then(r => r.data),

  update: (courseId: string, moduleId: string, lessonId: string, payload: Partial<Lesson>) =>
    api.put<Lesson>(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      payload
    ).then(r => r.data),

  delete: (courseId: string, moduleId: string, lessonId: string) =>
    api.delete(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`
    ).then(r => r.data),

  /** Toggle lesson completion. Returns updated progress. */
  complete: (courseId: string, moduleId: string, lessonId: string) =>
    api.post<{ is_completed: boolean; completed_count: number; total_lessons: number }>(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/complete`
    ).then(r => r.data),

  completions: (courseId: string, moduleId: string, lessonId: string) =>
    api.get(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/completions`).then(r => r.data),

  reorder: (courseId: string, moduleId: string, order: string[]) =>
    api.post(
      `/courses/${courseId}/modules/${moduleId}/lessons/reorder`,
      { order }
    ).then(r => r.data),

  progress: (courseId: string) =>
    api.get<CourseProgress>(`/courses/${courseId}/progress`).then(r => r.data),
}
