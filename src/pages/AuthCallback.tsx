
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Check, XCircle, Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [appName, setAppName] = useState('');
  
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get the code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        // Verify the state matches what we sent
        const savedState = localStorage.getItem('oauth_state');
        const provider = localStorage.getItem('oauth_provider');
        
        if (!code) {
          throw new Error('No authorization code received');
        }
        
        if (state !== savedState) {
          throw new Error('State verification failed');
        }
        
        if (!provider) {
          throw new Error('No provider information found');
        }
        
        // Clean up localStorage
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('oauth_provider');
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
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
        
        // Store the auth code in Supabase
        const { error } = await supabase
          .from('oauth_sessions')
          .insert({
            uid: user.id,
            auth_code: code,
            status: 'pending',
            provider: provider,
            scopes: scopes
          });
        
        if (error) throw error;
        
        // Everything went well
        setStatus('success');
        setMessage(`${displayName} has been successfully connected!`);
        
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to complete authentication');
      }
    };
    
    processOAuthCallback();
  }, [user]);
  
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
            You can close this window and return to the application.
            {status === 'success' && ` Your ${appName} is now connected.`}
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
