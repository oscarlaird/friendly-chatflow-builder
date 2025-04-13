
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type ConnectedApp = {
  provider: string;
  status: string;
  id: number;
  scopes?: string[];
};

export function useOAuthConnections() {
  const { user } = useAuth();
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConnectedApps([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Initial fetch of connected apps
    const fetchConnectedApps = async () => {
      try {
        const { data, error } = await supabase
          .from('oauth_sessions')
          .select('id, provider, status, scopes')
          .eq('uid', user.id);

        if (error) {
          console.error('Error fetching OAuth connections:', error);
          return;
        }

        console.log('Initial OAuth connections fetch:', data);
        setConnectedApps(data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedApps();

    // Set up real-time subscription for OAuth sessions table
    const channel = supabase
      .channel('oauth-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'oauth_sessions',
          filter: `uid=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time update for oauth_sessions:', payload);
          
          // Handle different change types
          if (payload.eventType === 'INSERT') {
            setConnectedApps(prev => [...prev, payload.new as ConnectedApp]);
            
            if (payload.new.status === 'connected') {
              toast.success(`${payload.new.provider} connected successfully`);
            }
          } else if (payload.eventType === 'UPDATE') {
            setConnectedApps(prev => 
              prev.map(app => app.id === payload.new.id ? payload.new as ConnectedApp : app)
            );
            
            // Show toast when an app becomes connected
            if (payload.new.status === 'connected' && payload.old.status !== 'connected') {
              const appName = payload.new.provider.replace('_', ' ');
              toast.success(`${appName} connected successfully`);
            }
          } else if (payload.eventType === 'DELETE') {
            setConnectedApps(prev => 
              prev.filter(app => app.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isAppConnected = (appName: string) => {
    return connectedApps.some(app => 
      app.provider === appName && app.status === 'connected'
    );
  };

  return {
    connectedApps: connectedApps.filter(app => app.status === 'connected'),
    isAppConnected,
    loading
  };
}
