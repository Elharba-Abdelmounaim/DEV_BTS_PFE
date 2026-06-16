import client from './client';
import type { Course, Enrollment, CreateCoursePayload } from '../types';

// Function-based exports
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

export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  const { data } = await client.post<{ data: Enrollment }>('/enrollments', { course_id: courseId });
  return data.data;
}

export async function getMyEnrollments(): Promise<Enrollment[]> {
  const { data } = await client.get<{ data: Enrollment[] }>('/enrollments');
  return data.data;
}

// ── Object-based API (للـ CourseDetail.tsx و غيره) ──────────────────────────────
export const coursesApi = {
  list: () => client.get<{ data: Course[]; total: number }>('/courses').then(r => r.data),
  get: (id: string) => client.get<{ data: Course }>(`/courses/${id}`).then(r => r.data.data),
  create: (payload: CreateCoursePayload) =>
    client.post<{ data: Course }>('/courses', payload).then(r => r.data.data),
  update: (id: string, payload: Partial<CreateCoursePayload>) =>
    client.put<{ data: Course }>(`/courses/${id}`, payload).then(r => r.data.data),
  delete: (id: string) => client.delete(`/courses/${id}`),
  enroll: (id: string) => client.post<{ data: Enrollment }>('/enrollments', { course_id: id }).then(r => r.data.data),
  myEnrollments: () => client.get<{ data: Enrollment[] }>('/enrollments').then(r => r.data.data),
};
