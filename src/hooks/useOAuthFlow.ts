
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface OAuthFlowConfig {
  provider: string;
  scopes: string[];
  appName: string;
}

export const APP_CONFIG = {
  google_sheets: {
    name: 'Google Sheets',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  },
  gmail: {
    name: 'Gmail',
    scopes: ['https://www.googleapis.com/auth/gmail.modify'],
  },
  outlook: {
    name: 'Outlook',
    scopes: ['offline_access', 'mail.read', 'mail.send'],
  },
  google_drive: {
    name: 'Google Drive',
    scopes: ['https://www.googleapis.com/auth/drive'],
  },
  salesforce: {
    name: 'Salesforce',
    scopes: ['api', 'refresh_token'],
  },
  zapier: {
    name: 'Zapier',
    scopes: ['zapier.api'],
  },
  dropbox: {
    name: 'Dropbox',
    scopes: ['files.content.read', 'files.content.write'],
  },
} as const;

export function useOAuthFlow() {
  const { user } = useAuth();
  const [connectingApp, setConnectingApp] = useState<string | null>(null);

  const initiateOAuthFlow = async (appName: string) => {
    if (!user) {
      toast.error('Authentication required', {
        description: 'Please sign in to connect applications',
      });
      return;
    }

    setConnectingApp(appName);

    try {
      const app = APP_CONFIG[appName as keyof typeof APP_CONFIG];
      if (!app) throw new Error(`Unknown app: ${appName}`);

      // Generate state for CSRF protection
      const state = Math.random().toString(36).substring(2);
      localStorage.setItem('oauth_state', state);
      localStorage.setItem('oauth_provider', appName);

      // Generate redirect URI
      const redirectUri = `${window.location.origin}/auth-callback`;

      // Build OAuth URL based on provider
      let authUrl: string;

      if (appName === 'google_sheets' || appName === 'gmail' || appName === 'google_drive') {
        authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + 
          `client_id=1011255092960-rdmg43m71oubmr1rgvm6r234uop3fseu.apps.googleusercontent.com&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(app.scopes.join(' '))}&` +
          `state=${state}&` +
          'response_type=code&' +
          'access_type=offline&' +
          'prompt=consent';
      } else if (appName === 'outlook') {
        // Placeholder - actual implementation would need Microsoft client ID
        authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' +
          `client_id=YOUR_MICROSOFT_CLIENT_ID&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(app.scopes.join(' '))}&` +
          `state=${state}&` +
          'response_type=code';
      } else {
        throw new Error(`OAuth URL not configured for app: ${appName}`);
      }

      const authWindow = window.open(authUrl, 'oauth_window', 'width=800,height=600');
      if (!authWindow) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }

      // Clear connecting state after timeout
      setTimeout(() => {
        if (connectingApp === appName) {
          setConnectingApp(null);
          toast.error('Connection timed out', {
            description: 'Please try again',
          });
        }
      }, 120000);

    } catch (error: any) {
      console.error('Error initiating OAuth flow:', error);
      toast.error('Connection error', {
        description: error.message || 'Failed to start connection process',
      });
      setConnectingApp(null);
    }
  };

  return {
    connectingApp,
    setConnectingApp,
    initiateOAuthFlow
  };
}
