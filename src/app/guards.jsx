   import { Navigate } from 'react-router-dom';
  import { useAuth } from '../shared/utils/AuthContext';
  import { Spinner } from '../shared/components/ui';

  export function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <Navigate to="/login" replace />;

    return children;
  }

  export function GuestRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;

    if (user) {
      const roleRoutes = {
        SUPER_ADMIN: '/superadmin',
        ADMIN: '/admin',
        SALES_AGENT: '/sales-agent',
        BRANCH_ADMIN: '/branch-admin',
        BILLING: '/billing',
        SALE: '/sale',
        PURCHASE: '/purchase',
      };
      return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
    }

    return children;
  }