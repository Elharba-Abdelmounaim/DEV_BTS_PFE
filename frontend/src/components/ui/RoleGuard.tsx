import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function PrivateRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function TeacherOnly() {
  const { isTeacher } = useAuth();
  return isTeacher ? <Outlet /> : <Navigate to="/" replace />;
}

export function StudentOnly() {
  const { isStudent } = useAuth();
  return isStudent ? <Outlet /> : <Navigate to="/" replace />;
}