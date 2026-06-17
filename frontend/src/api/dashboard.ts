import client from './client';
import type { Course, Submission, Notification, Enrollment, CourseProgress } from '../types';

export interface DashboardStats {
  coursesCount: number;
  submissionsCount: number;
  gradedCount: number;
  pendingCount: number;
  avgScore: number | null;
  unreadNotifications: number;
  enrollmentsCount: number;
}

export interface RecentActivity {
  id: string;
  type: 'submission' | 'enrollment' | 'grade' | 'course';
  title: string;
  description: string;
  created_at: string;
  link?: string;
}

// ── Teacher stats ──────────────────────────────────────────────────────────────
export async function getTeacherStats(): Promise<DashboardStats> {
  const [coursesRes, submissionsRes, notifsRes] = await Promise.all([
    client.get('/courses'),
    client.get('/submissions'),
    client.get('/notifications/unread'),
  ]);

  const courses: Course[] = coursesRes.data.data ?? [];
  const submissions: Submission[] = submissionsRes.data.data ?? [];
  const notifications: Notification[] = notifsRes.data.data ?? [];

  const graded = submissions.filter(s => s.submission_status === 'graded');
  const avgScore = graded.length
    ? Math.round(graded.reduce((sum, s) => sum + (Number(s.final_score) || 0), 0) / graded.length)
    : null;

  return {
    coursesCount: courses.length,
    submissionsCount: submissions.length,
    gradedCount: graded.length,
    pendingCount: submissions.filter(s => s.submission_status === 'pending').length,
    avgScore,
    unreadNotifications: notifications.length,
    enrollmentsCount: courses.reduce((sum, c) => sum + (c.enrollments_count ?? 0), 0),
  };
}

// ── Student stats ──────────────────────────────────────────────────────────────
export async function getStudentStats(): Promise<DashboardStats> {
  const [coursesRes, submissionsRes, notifsRes, enrollmentsRes] = await Promise.all([
    client.get('/courses'),
    client.get('/submissions/my'),
    client.get('/notifications/unread'),
    client.get('/enrollments'),
  ]);

  const courses: Course[] = coursesRes.data.data ?? [];
  const submissions: Submission[] = submissionsRes.data.data ?? [];
  const notifications: Notification[] = notifsRes.data.data ?? [];
  const enrollments: Enrollment[] = enrollmentsRes.data.data ?? [];

  const graded = submissions.filter(s => s.submission_status === 'graded');
  const avgScore = graded.length
    ? Math.round(graded.reduce((sum, s) => sum + (Number(s.final_score) || 0), 0) / graded.length)
    : null;

  return {
    coursesCount: courses.length,
    submissionsCount: submissions.length,
    gradedCount: graded.length,
    pendingCount: submissions.filter(s => s.submission_status === 'pending').length,
    avgScore,
    unreadNotifications: notifications.length,
    enrollmentsCount: enrollments.filter(e => e.status === 'active').length,
  };
}

// ── Recent activity (submissions + notifications merged) ───────────────────────
export async function getRecentActivity(limit = 8): Promise<RecentActivity[]> {
  const [submissionsRes, notifsRes] = await Promise.all([
    client.get('/submissions/my'),
    client.get('/notifications'),
  ]);

  const submissions: Submission[] = submissionsRes.data.data ?? [];
  const notifications: Notification[] = notifsRes.data.data ?? [];

  const activities: RecentActivity[] = [
    ...submissions.slice(0, limit).map((sub): RecentActivity => ({
      id: `sub-${sub.id}`,
      type: sub.submission_status === 'graded' ? 'grade' : 'submission',
      title: sub.assignment?.title ?? 'Assignment',
      description: sub.submission_status === 'graded'
        ? `Graded: ${sub.final_score ?? 0}/100`
        : `Status: ${sub.submission_status}`,
      created_at: sub.submitted_at || sub.created_at,
      link: `/submissions/${sub.id}`,
    })),
    ...notifications.slice(0, limit).map((notif): RecentActivity => ({
      id: `notif-${notif.id}`,
      type: 'course',
      title: notif.title,
      description: notif.message,
      created_at: notif.created_at,
    })),
  ];

  return activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

// ── Course progress for students ───────────────────────────────────────────────
export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  const res = await client.get(`/courses/${courseId}/progress`);
  return res.data;
}
