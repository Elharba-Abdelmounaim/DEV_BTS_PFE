import client from './client';
import type { Course, CreateCoursePayload } from '../types';

// Function-based exports (للـ Dashboard)
export async function getCourses(): Promise<Course[]> {
  const { data } = await client.get<{ data: Course[] }>('/courses');
  return data.data;
}

export async function getCourse(id: string): Promise<Course> {
  const { data } = await client.get<{ data: Course }>(`/courses/${id}`);
  return data.data;
}

export async function createCourse(payload: Partial<Course>): Promise<Course> {
  const { data } = await client.post<{ data: Course }>('/courses', payload);
  return data.data;
}

export async function updateCourse(id: string, payload: Partial<Course>): Promise<Course> {
  const { data } = await client.put<{ data: Course }>(`/courses/${id}`, payload);
  return data.data;
}

export async function deleteCourse(id: string): Promise<void> {
  await client.delete(`/courses/${id}`);
}

export async function enrollInCourse(courseId: string): Promise<void> {
  await client.post(`/courses/${courseId}/enroll`);
}

// ── Object-based API (للـ Claude original code) ────────────────────────────────
export const coursesApi = {
  list: () => client.get<{ data: Course[]; total: number }>('/courses').then(r => r.data),
  get: (id: string) => client.get<{ data: Course }>(`/courses/${id}`).then(r => r.data.data),
  create: (payload: CreateCoursePayload) =>
    client.post<{ data: Course }>('/courses', payload).then(r => r.data.data),
  update: (id: string, payload: Partial<CreateCoursePayload>) =>
    client.put<{ data: Course }>(`/courses/${id}`, payload).then(r => r.data.data),
  delete: (id: string) => client.delete(`/courses/${id}`),
  enroll: (id: string) => client.post(`/courses/${id}/enroll`),
};