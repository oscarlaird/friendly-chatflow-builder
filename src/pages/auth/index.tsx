
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Retrieve the intended route from session storage or default to home
      const intendedRoute = sessionStorage.getItem('intendedRoute') || '/';
      
      // Clear the stored route
      sessionStorage.removeItem('intendedRoute');
      
      // Navigate to the intended route
      navigate(intendedRoute, { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is already logged in, don't render the auth form
  if (user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Mill</h1>
          <p className="text-muted-foreground mt-2">Sign in or create an account to continue</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
