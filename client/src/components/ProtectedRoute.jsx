import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  // Not logged in at all
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role (e.g. customer trying to access brand dashboard)
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'brand' ? '/dashboard' : '/marketplace'} replace />;
  }

  return children;
};

export default ProtectedRoute;