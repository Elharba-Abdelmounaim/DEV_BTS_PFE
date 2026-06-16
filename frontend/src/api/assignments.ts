import client from './client';
import type { Assignment, Submission, Notification } from '../types';

// Function-based exports
export async function getAssignment(id: string): Promise<Assignment> {
  const { data } = await client.get<{ data: Assignment }>(`/assignments/${id}`);
  return data.data;
}

export async function createAssignment(payload: any): Promise<Assignment> {
  const { data } = await client.post<{ data: Assignment }>('/assignments', payload);
  return data.data;
}

export async function getMySubmissions(): Promise<Submission[]> {
  const { data } = await client.get<{ data: Submission[] }>('/submissions/my');
  return data.data;
}

export async function getSubmission(id: string): Promise<Submission> {
  const { data } = await client.get<{ data: Submission }>(`/submissions/${id}`);
  return data.data;
}

export async function submitAssignment(
  assignmentId: string,
  payload: { github_repo_url: string; github_branch: string; github_commit_sha: string }
): Promise<Submission> {
  const { data } = await client.post<{ data: Submission }>(
    '/submissions',
    {
      assignment_id: assignmentId,
      ...payload
    }
  );
  return data.data;
}

export async function getAssignmentSubmissions(assignmentId: string): Promise<Submission[]> {
  const { data } = await client.get<{ data: Submission[] }>(`/assignments/${assignmentId}/submissions`);
  return data.data;
}

export async function gradeSubmission(
  id: string,
  payload: { final_score: number; teacher_feedback: string }
): Promise<Submission> {
  const { data } = await client.patch<{ data: Submission }>(`/submissions/${id}`, payload);
  return data.data;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await client.get<{ data: Notification[] }>('/notifications');
  return data.data;
}

export async function markAsRead(id: string): Promise<void> {
  await client.post(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await client.post('/notifications/read-all');
}

// ── Object-based APIs (للـ CourseDetail.tsx و غيره) ─────────────────────────────
export const assignmentsApi = {
  list: (courseId?: string) =>
    client.get<{ data: Assignment[] }>(courseId ? `/courses/${courseId}/assignments` : '/assignments').then(r => r.data.data),
  byCourse: (courseId: string) =>
    client.get<{ data: Assignment[] }>(`/courses/${courseId}/assignments`).then(r => r.data.data),
  get: (id: string) =>
    client.get<{ data: Assignment }>(`/assignments/${id}`).then(r => r.data.data),
  create: (payload: any) =>
    client.post<{ data: Assignment }>('/assignments', payload).then(r => r.data.data),
  update: (id: string, payload: Partial<Assignment>) =>
    client.put<{ data: Assignment }>(`/assignments/${id}`, payload).then(r => r.data.data),
  delete: (id: string) =>
    client.delete(`/assignments/${id}`),
};

export const submissionsApi = {
  list: () =>
    client.get<{ data: Submission[] }>('/submissions/my').then(r => r.data.data),
  byAssignment: (assignmentId: string) =>
    client.get<{ data: Submission[] }>(`/assignments/${assignmentId}/submissions`).then(r => r.data.data),
  get: (id: string) =>
    client.get<{ data: Submission }>(`/submissions/${id}`).then(r => r.data.data),
  submit: (assignmentId: string, payload: any) =>
    client.post<{ data: Submission }>('/submissions', {
      assignment_id: assignmentId,
      github_repo_url: payload.github_url || payload.github_repo_url,
      github_branch: payload.branch || payload.github_branch,
      github_commit_sha: payload.commit_sha || payload.github_commit_sha,
      student_notes: payload.student_notes
    }).then(r => r.data.data),
  grade: (id: string, payload: { final_score: number; teacher_feedback: string }) =>
    client.patch<{ data: Submission }>(`/submissions/${id}`, payload).then(r => r.data.data),
};
