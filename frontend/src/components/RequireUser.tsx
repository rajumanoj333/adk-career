import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function RequireUser({ children }: { children: JSX.Element }) {
  const { session } = useApp();
  const location = useLocation();

  if (!session.userId) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }

  return children;
}
