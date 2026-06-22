export type LessonType = 'video' | 'reading' | 'quiz' | 'assignment'

export interface RecentActivity {
  id: number
  type: 'grade' | 'submission' | 'enrollment' | 'course'
  title: string
  description: string
  created_at: string
}

export interface Course {
  id: number
  title: string
  code?: string
  category?: string
  cover_url?: string
  instructor?: { full_name: string }
}

export interface Enrollment {
  id: number
  course: Course
  progress: { completed_lessons: number; total_lessons: number; percent: number }
  next_lesson?: { type: LessonType; title: string }
}
