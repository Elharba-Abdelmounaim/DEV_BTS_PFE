import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PrivateRoute, TeacherOnly, StudentOnly } from './components/ui/RoleGuard';
import AppShell from './components/layout/AppShell';
import AuthShell from './components/layout/AuthShell';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';

// Week 2 — Student flows
import CourseList from './pages/courses/CourseList';
import CourseDetail from './pages/courses/CourseDetail';
import AssignmentDetail from './pages/assignments/AssignmentDetail';
import SubmitForm from './pages/assignments/SubmitForm';
import SubmissionStatus from './pages/submissions/SubmissionStatus';
import SubmissionList from './pages/submissions/SubmissionList';

// Week 3 — Teacher flows
import CreateCoursePage from './pages/courses/CreateCoursePage';
import EditCoursePage from './pages/courses/EditCoursePage';
import CreateAssignmentPage from './pages/assignments/CreateAssignmentPage';
import TeacherSubmissions from './pages/assignments/TeacherSubmissions';

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
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <RegisterPage />}
        />
      </Route>

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />

          {/* Shared routes between Student and Teacher */}
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />

          {/* Student routes */}
          <Route element={<StudentOnly />}>
            <Route path="/assignments/:assignmentId" element={<AssignmentDetail />} />
            <Route path="/assignments/:assignmentId/submit" element={<SubmitForm />} />
            <Route path="/submissions/:submissionId" element={<SubmissionStatus />} />
            <Route path="/submissions" element={<SubmissionList />} />
          </Route>

          {/* Teacher routes */}
          <Route element={<TeacherOnly />}>
            <Route path="/courses/new" element={<CreateCoursePage />} />
            <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />
            <Route path="/assignments/new" element={<CreateAssignmentPage />} />
            <Route path="/assignments/:assignmentId/submissions" element={<TeacherSubmissions />} />
          </Route>

          {/* Shared routes */}
          <Route path="/notifications" element={<div>Notifications (à venir)</div>} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}