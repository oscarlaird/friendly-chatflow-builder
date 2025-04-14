
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOAuthConnections } from '@/hooks/useOAuthConnections';
import { useOAuthFlow } from '@/hooks/useOAuthFlow';
import { Icons } from '@/components/ui/icons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function ConnectedAppsSettings() {
  const { connectedApps, loading: connectionsLoading } = useOAuthConnections();
  const { initiateOAuthFlow, connectingApp } = useOAuthFlow();
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const handleDisconnect = async (provider: string) => {
    try {
      setDisconnecting(provider);
      
      const { error } = await supabase
        .from('oauth_sessions')
        .delete()
        .eq('provider', provider);

      if (error) throw error;
      
      toast.success(`Disconnected from ${provider}`);
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error(`Failed to disconnect from ${provider}`);
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Applications</CardTitle>
        <CardDescription>
          Manage your connected applications and services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionsLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {['google_sheets', 'gmail', 'outlook'].map((appId) => {
              const isConnected = connectedApps.some(app => app.provider === appId);
              const AppIcon = Icons[appId === 'google_sheets' ? 'fileSpreadsheet' : 
                             appId === 'gmail' ? 'mail' : 'mail'];
              const appName = appId === 'google_sheets' ? 'Google Sheets' :
                            appId === 'gmail' ? 'Gmail' : 'Outlook';
              
              return (
                <div 
                  key={appId}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <AppIcon className="h-5 w-5" />
                    <span className="font-medium">{appName}</span>
                  </div>
                  
                  {isConnected ? (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      disabled={disconnecting === appId}
                      onClick={() => handleDisconnect(appId)}
                    >
                      {disconnecting === appId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Disconnect'
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={connectingApp === appId}
                      onClick={() => initiateOAuthFlow(appId)}
                    >
                      {connectingApp === appId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
