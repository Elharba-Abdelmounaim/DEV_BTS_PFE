export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: 'student' | 'teacher';
  github_username?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  academic_year: number;
  semester: string;
  credits: number;
  max_students: number;
  is_active: boolean;
  instructor_id: string;
  instructor?: User;
  assignments?: Assignment[];
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  due_date: string;
  is_published: boolean;
  max_score: number;
  course?: Course;
  submissions?: Submission[];
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  github_url?: string;
  github_repo_url?: string;
  branch?: string;
  commit_sha?: string;
  submission_status: 'pending' | 'queued' | 'grading' | 'graded' | 'failed';
  score?: number | null;
  auto_grade_score?: number | null;
  final_score?: number | null;
  feedback?: string;
  graded_at?: string;
  submitted_at?: string;
  is_late?: boolean;
  student?: User;
  assignment?: Assignment;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'active' | 'dropped' | 'completed';
  enrolled_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read_at?: string;
  created_at: string;
}

export interface TestCase {
  id: string;
  name: string;
  weight: number;
  strategy: string;
  expected?: string;
  hint?: string;
}

export interface CreateCoursePayload {
  code: string;
  title: string;
  description?: string;
  academic_year: number;
  semester: string;
  credits: number;
  max_students: number;
  is_active?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'student' | 'teacher';
  github_username?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}


 

export interface TestCaseBuilderProps {
  testCases: TestCase[];
  onChange: React.Dispatch<React.SetStateAction<TestCase[]>>;
  maxScore: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}