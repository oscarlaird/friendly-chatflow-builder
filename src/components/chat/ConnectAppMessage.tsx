
import React, { useState, useEffect } from 'react';
import { Chrome, Mail, FileSpreadsheet, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Define available apps and their configurations
const APP_CONFIG = {
  google_sheets: {
    name: 'Google Sheets',
    icon: FileSpreadsheet,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    color: 'bg-green-600 hover:bg-green-700',
  },
  gmail: {
    name: 'Gmail',
    icon: Mail,
    scope: 'https://www.googleapis.com/auth/gmail.modify',
    color: 'bg-red-600 hover:bg-red-700',
  },
  outlook: {
    name: 'Outlook',
    icon: Mail,
    scope: 'offline_access mail.read mail.send',
    color: 'bg-blue-600 hover:bg-blue-700',
  },
};

// Google OAuth client ID
const GOOGLE_CLIENT_ID = '1011255092960-rdmg43m71oubmr1rgvm6r234uop3fseu.apps.googleusercontent.com';

interface ConnectAppMessageProps {
  message: Message;
}

export const ConnectAppMessage = ({ message }: ConnectAppMessageProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connectingApp, setConnectingApp] = useState<string | null>(null);
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>({});
  
  // Parse apps from the message
  const apps = message.apps ? message.apps.split(',').map(app => app.trim()) : [];
  
  // Check if specific apps are already connected
  const checkAppConnection = async (appName: string) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('oauth_sessions')
        .select('*')
        .eq('uid', user.id)
        .eq('provider', appName)
        .eq('status', 'active')
        .maybeSingle();
        
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error(`Error checking ${appName} connection:`, error);
      return false;
    }
  };
  
  // Check connection status for all apps when component mounts or user changes
  useEffect(() => {
    if (!user) return;
    
    const checkAllApps = async () => {
      const connectionStatus: Record<string, boolean> = {};
      
      for (const app of apps) {
        connectionStatus[app] = await checkAppConnection(app);
      }
      
      setConnectedApps(connectionStatus);
    };
    
    checkAllApps();
    
    // Add event listener for OAuth success message
    const handleOAuthMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin && 
        event.data && 
        event.data.type === 'OAUTH_SUCCESS' && 
        event.data.provider
      ) {
        // Update the connection status when OAuth succeeds
        setConnectedApps(prev => ({
          ...prev,
          [event.data.provider]: true
        }));
        setConnectingApp(null);
        
        const appName = APP_CONFIG[event.data.provider as keyof typeof APP_CONFIG]?.name || event.data.provider;
        toast.success(`${appName} connected successfully`);
      }
    };
    
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
    
  }, [user, apps]);
  
  // Handle OAuth flow initiation
  const handleConnectApp = (appName: string) => {
    if (!user) {
      toast.error('Authentication required', {
        description: 'Please sign in to connect applications',
      });
      navigate('/auth');
      return;
    }
    
    setConnectingApp(appName);
    
    try {
      const app = APP_CONFIG[appName as keyof typeof APP_CONFIG];
      if (!app) throw new Error(`Unknown app: ${appName}`);
      
      // Generate a random state for CSRF protection
      const state = Math.random().toString(36).substring(2);
      
      // Store the state in localStorage for verification when the user returns
      localStorage.setItem('oauth_state', state);
      localStorage.setItem('oauth_provider', appName);
      
      // Generate the redirect URI (current origin + /auth-callback)
      const redirectUri = `${window.location.origin}/auth-callback`;
      
      // Build the OAuth URL
      let authUrl: string;
      
      if (appName === 'google_sheets' || appName === 'gmail') {
        // Google OAuth URL
        authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + 
          `client_id=${GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(app.scope)}&` +
          `state=${state}&` +
          'response_type=code&' +
          'access_type=offline&' +
          'prompt=consent';
      } else if (appName === 'outlook') {
        // Outlook/Microsoft OAuth URL
        // This is a placeholder, you would need to replace with the actual Microsoft app registration
        authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' +
          `client_id=YOUR_MICROSOFT_CLIENT_ID&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(app.scope)}&` +
          `state=${state}&` +
          'response_type=code';
      } else {
        throw new Error(`OAuth URL not configured for app: ${appName}`);
      }
      
      // Open the OAuth URL in a new window
      const authWindow = window.open(authUrl, 'oauth_window', 'width=800,height=600');
      
      // Check if the window was blocked by a popup blocker
      if (!authWindow) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }
      
      // Start a timeout to clear the connecting state if the user takes too long
      setTimeout(() => {
        if (connectingApp === appName) {
          setConnectingApp(null);
          toast.error('Connection timed out', {
            description: 'Please try again',
          });
        }
      }, 120000); // 2 minute timeout
      
    } catch (error: any) {
      console.error('Error initiating OAuth flow:', error);
      toast.error('Connection error', {
        description: error.message || 'Failed to start connection process',
      });
      setConnectingApp(null);
    }
  };
  
  return (
    <div className="flex justify-center mb-4 w-full">
      <Card className="w-full max-w-[95%] p-4">
        <div className="mb-3">
          <h3 className="font-medium mb-2">Connect External Applications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your accounts to enable AI-powered workflows with your data
          </p>
          
          <div className="flex flex-wrap gap-3">
            {apps.map(appName => {
              const app = APP_CONFIG[appName as keyof typeof APP_CONFIG];
              if (!app) return null;
              
              const AppIcon = app.icon;
              const isConnecting = connectingApp === appName;
              const isConnected = connectedApps[appName];
              
              return (
                <Button
                  key={appName}
                  className={`${app.color} gap-2`}
                  disabled={isConnecting || isConnected}
                  onClick={() => handleConnectApp(appName)}
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isConnected ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AppIcon className="h-4 w-4" />
                  )}
                  {app.name}
                  {isConnected && (
                    <Badge variant="outline" className="ml-1 bg-white/10">
                      Connected
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
