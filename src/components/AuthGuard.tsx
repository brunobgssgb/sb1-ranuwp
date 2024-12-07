import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const { currentUser, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, isInitialized, navigate]);

  if (!isInitialized || !currentUser) {
    return null;
  }

  return <>{children}</>;
}