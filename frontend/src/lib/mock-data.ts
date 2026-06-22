import type { RecentActivity } from './types'

export const recentActivity: RecentActivity[] = [
  { id: 1, type: 'grade',      title: 'Assignment graded',   description: 'Python basics — 18/20',   created_at: new Date(Date.now() - 3_600_000).toISOString() },
  { id: 2, type: 'submission', title: 'Assignment submitted', description: 'React project',           created_at: new Date(Date.now() - 86_400_000).toISOString() },
  { id: 3, type: 'enrollment', title: 'Course enrolled',      description: 'Web Development',         created_at: new Date(Date.now() - 172_800_000).toISOString() },
  { id: 4, type: 'course',     title: 'Course completed',     description: 'HTML & CSS Fundamentals', created_at: new Date(Date.now() - 259_200_000).toISOString() },
]

export const categories = [
  { id: 1, label: 'Programming',  tone: 'primary', count: 12 },
  { id: 2, label: 'DevOps',       tone: 'blue',    count: 8  },
  { id: 3, label: 'AI & ML',      tone: 'amber',   count: 6  },
  { id: 4, label: 'Cloud',        tone: 'rose',    count: 4  },
  { id: 5, label: 'Security',     tone: 'primary', count: 5  },
  { id: 6, label: 'Data Science', tone: 'blue',    count: 7  },
]

export const enrolledCourses = [
  {
    course: {
      id: 1,
      title: 'Python for Beginners',
      code: 'PY101',
      category: 'Programming',
      cover_url: '',
      instructor: { full_name: 'Dr. Ahmed Benali' },
    },
    progress: { completed_lessons: 8, total_lessons: 12, percent: 65 },
    next_lesson: { type: 'video' as const, title: 'Functions & Modules' },
  },
  {
    course: {
      id: 2,
      title: 'React Advanced Patterns',
      code: 'RE201',
      category: 'Web Dev',
      cover_url: '',
      instructor: { full_name: 'Prof. Sara Idrissi' },
    },
    progress: { completed_lessons: 3, total_lessons: 10, percent: 30 },
    next_lesson: { type: 'reading' as const, title: 'Custom Hooks' },
  },
]

export const currentStudent = {
  id: 1,
  full_name: 'Mohammed Elharba',
  first_name: 'Mohammed',
  github_username: 'elharba',
  avatar_url: '',
  role: 'student',
}

export const overallProgressPercent = 48

export const dashboardStats = {
  coursesCount: 4,
  avgScore: 76,
  pendingCount: 2,
  unreadNotifications: 3,
}

export const profileStats = {
  completedLessons: 11,
  totalLessons: 22,
  averageScore: 76,
  totalSubmissions: 8,
}





export const weeklyActivity = [
  { day: 'Mon', hours: 0.75, lessons: 2 },
  { day: 'Tue', hours: 0.5,  lessons: 1 },
  { day: 'Wed', hours: 1.5,  lessons: 3 },
  { day: 'Thu', hours: 0,    lessons: 0 },
  { day: 'Fri', hours: 1,    lessons: 2 },
  { day: 'Sat', hours: 2,    lessons: 4 },
  { day: 'Sun', hours: 0.33, lessons: 1 },
]


export const assignments = [
  { id: '1', title: 'Build a REST API',    course: { code: 'PY101', name: 'Python'  }, due_date: '2026-06-25', status: 'pending'   as const },
  { id: '2', title: 'React Final Project', course: { code: 'RE201', name: 'React'   }, due_date: '2026-06-28', status: 'pending'   as const },
  { id: '3', title: 'Docker Compose Lab',  course: { code: 'DO101', name: 'DevOps'  }, due_date: '2026-06-30', status: 'submitted' as const },
]


export const submissions: Array<{
  id: number
  assignment_id: string
  title: string
  course: { code: string }
  submitted_at: string
  submission_status: 'graded' | 'grading' | 'queued' | 'failed' | 'submitted'
  final_score: number | null
}> = [
  { id: 1, assignment_id: '1', title: 'HTML Basics Quiz',   course: { code: 'WD101' }, submitted_at: '2026-06-18', submission_status: 'graded',    final_score: 18   },
  { id: 2, assignment_id: '2', title: 'Python Variables',   course: { code: 'PY101' }, submitted_at: '2026-06-19', submission_status: 'graded',    final_score: 16   },
  { id: 3, assignment_id: '3', title: 'CSS Layout Project', course: { code: 'WD101' }, submitted_at: '2026-06-20', submission_status: 'grading',   final_score: null },
  { id: 4, assignment_id: '4', title: 'Docker Lab',         course: { code: 'DO101' }, submitted_at: '2026-06-21', submission_status: 'queued',    final_score: null },
  { id: 5, assignment_id: '5', title: 'SQL Basics',         course: { code: 'DB101' }, submitted_at: '2026-06-21', submission_status: 'failed',    final_score: null },
  { id: 6, assignment_id: '6', title: 'Git Flow',           course: { code: 'GI101' }, submitted_at: '2026-06-21', submission_status: 'submitted', final_score: null },
]
