// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PrivateRoute, TeacherOnly, StudentOnly } from './components/ui/RoleGuard';
import AppShell from './components/layout/AppShell';

import AuthShell from './components/layout/AuthShell';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import NotificationCenter from './pages/notifications/NotificationCenter';
import PortfolioPage from './pages/portfolio/PortfolioPage';

// ── Courses ────────────────────────────────────────────────────────────────
import CourseList from './pages/courses/CourseList';
import CourseDetail from './pages/courses/CourseDetail';
import CreateCoursePage from './pages/courses/CreateCoursePage';
import EditCoursePage from './pages/courses/EditCoursePage';

// ── Lessons ─────────────────────────────────────────────────────────────────
import LessonsPage from './pages/lessons/LessonsPage';
import LessonDetailPage from './pages/lessons/LessonDetailPage';

// ── Assignments ─────────────────────────────────────────────────────────────
import AssignmentListPage from './pages/assignments/AssignmentListPage';
import AssignmentDetailPage from './pages/assignments/AssignmentDetailPage';
import CreateAssignmentPage from './pages/assignments/CreateAssignmentPage';
import TeacherSubmissions from './pages/assignments/TeacherSubmissions';
import SubmitForm from './pages/assignments/SubmitForm'; 

// ── Submissions ─────────────────────────────────────────────────────────────
import SubmissionList from './pages/submissions/SubmissionList';
import SubmissionStatus from './pages/submissions/SubmissionStatus';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#1a2f4a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthShell />}>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />

          {/* ── Courses ──────────────────────────────────────────────────── */}
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          
          {/* Teacher courses */}
          <Route element={<TeacherOnly />}>
            <Route path="/courses/new" element={<CreateCoursePage />} />
            <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />
          </Route>

          {/* ── Lessons ──────────────────────────────────────────────────── */}
          <Route path="/courses/:courseId/lessons" element={<LessonsPage />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonDetailPage />} />

          {/* ── Assignments ────────────────────────────────────────────────── */}
          <Route path="/assignments" element={<AssignmentListPage />} />
          <Route path="/assignments/:assignmentId" element={<AssignmentDetailPage />} />
          
          {/* Student assignments */}
          <Route element={<StudentOnly />}>
            <Route path="/assignments/:assignmentId/submit" element={<SubmitForm />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
          </Route>
          
          {/* Teacher assignments */}
          <Route element={<TeacherOnly />}>
            <Route path="/assignments/new" element={<CreateAssignmentPage />} />
            <Route path="/assignments/:assignmentId/submissions" element={<TeacherSubmissions />} />
          </Route>

          {/* ── Submissions ────────────────────────────────────────────────── */}
          <Route path="/submissions" element={<SubmissionList />} />
          <Route path="/submissions/:submissionId" element={<SubmissionStatus />} />

          {/* ── Profile ────────────────────────────────────────────────────── */}
          <Route path="/profile" element={<Profile />} />

          {/* ── Notifications ─────────────────────────────────────────────── */}
          <Route path="/notifications" element={<NotificationCenter />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}