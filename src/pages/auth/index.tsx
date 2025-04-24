
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';

const AuthPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { createChat } = useChats();

  useEffect(() => {
    if (user && !loading) {
      const handleAuthentication = async () => {
        // Check for pending prompt
        const pendingPrompt = sessionStorage.getItem('pendingPrompt');
        if (pendingPrompt) {
          // Clear the pending prompt
          sessionStorage.removeItem('pendingPrompt');
          
          // Create a new chat with the pending prompt
          try {
            const newChat = await createChat('New Workflow');
            if (newChat) {
              navigate(`/workflow/${newChat.id}?initialPrompt=${encodeURIComponent(pendingPrompt)}`);
              return;
            }
          } catch (error) {
            console.error('Error creating workflow:', error);
          }
        }
        
        // If no pending prompt, redirect to home
        const redirectPath = sessionStorage.getItem('redirectPath') || '/';
        sessionStorage.removeItem('redirectPath');
        navigate(redirectPath);
      };

      handleAuthentication();
    }
  }, [user, loading, navigate, createChat]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Welcome to SupaMill</h1>
        <p className="text-muted-foreground mt-2">Sign in or create an account to start building workflows</p>
      </div>
      <AuthForm />
    </div>
  );
};

export default AuthPage;
