
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Check, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthCallback = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [appName, setAppName] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        console.log("AuthCallback: Starting OAuth callback processing...");
        console.log("AuthCallback: Current user state:", user);
        
        // Get the code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        // Verify the state matches what we sent
        const savedState = localStorage.getItem('oauth_state');
        const provider = localStorage.getItem('oauth_provider');
        
        console.log("AuthCallback: Code received:", code ? "Yes" : "No");
        console.log("AuthCallback: State comparison:", { 
          received: state, 
          saved: savedState,
          match: state === savedState 
        });
        console.log("AuthCallback: Provider:", provider);
        
        if (!code) {
          throw new Error('No authorization code received');
        }
        
        if (state !== savedState) {
          throw new Error('State verification failed');
        }
        
        if (!provider) {
          throw new Error('No provider information found');
        }
        
        // Check if the user is authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          console.error("AuthCallback: User is not authenticated");
          // Instead of throwing an error, redirect to auth page
          setStatus('error');
          setMessage('Please log in before connecting external apps');
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
          return;
        }
        
        const currentUser = sessionData.session.user;
        
        // Clean up localStorage
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_provider');
        
        // Set provider-specific app name for display
        let displayName = 'App';
        let scopes = '';
        
        if (provider === 'google_sheets') {
          displayName = 'Google Sheets';
          scopes = 'https://www.googleapis.com/auth/spreadsheets';
        } else if (provider === 'gmail') {
          displayName = 'Gmail';
          scopes = 'https://www.googleapis.com/auth/gmail.modify';
        } else if (provider === 'outlook') {
          displayName = 'Outlook';
          scopes = 'offline_access mail.read mail.send';
        }
        
        setAppName(displayName);
        
        console.log("AuthCallback: Storing auth code for user:", currentUser.id);
        
        // Store the auth code in Supabase
        const { error } = await supabase
          .from('oauth_sessions')
          .insert({
            uid: currentUser.id,
            auth_code: code,
            status: 'pending',
            provider: provider,
            scopes: scopes
          });
        
        if (error) {
          console.error("AuthCallback: Database error:", error);
          throw error;
        }
        
        // Everything went well
        setStatus('success');
        setMessage(`${displayName} has been successfully connected!`);
        
        // Notify the opener window that connection was successful
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'OAUTH_SUCCESS', 
            provider: provider 
          }, window.location.origin);
        }
        
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to complete authentication');
      }
    };
    
    processOAuthCallback();
  }, [user, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Processing</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-semibold mb-2">Connection Successful</h2>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
          </>
        )}
        
        <p className="text-muted-foreground mb-6">{message}</p>
        
        {status !== 'loading' && (
          <p className="text-sm">
            {status === 'error' && message.includes('log in') 
              ? 'Redirecting to login page...'
              : 'You can close this window and return to the application.'}
            {status === 'success' && ` Your ${appName} is now connected.`}
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
