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
  trends?: { date: string; count: number }[];
}

export interface RecentActivity {
  id: string;
  type: 'submission' | 'enrollment' | 'grade' | 'course';
  title: string;
  description: string;
  created_at: string;
  link?: string;
}

// ── Dashboard stats ────────────────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await client.get('/dashboard/stats');
  return res.data.data;
}

// Keep export aliases for backward compatibility in components
export const getTeacherStats = getDashboardStats;
export const getStudentStats = getDashboardStats;

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
