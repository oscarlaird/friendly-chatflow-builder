
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Message } from '@/types';
import { useOAuthFlow } from '@/hooks/useOAuthFlow';
import { useOAuthConnections } from '@/hooks/useOAuthConnections';
import { AppConnectButton } from './AppConnectButton';
import { Loader2 } from 'lucide-react';

interface ConnectAppMessageProps {
  message: Message;
}

export const ConnectAppMessage = ({ message }: ConnectAppMessageProps) => {
  const { connectingApp, initiateOAuthFlow, setConnectingApp } = useOAuthFlow();
  const { isAppConnected, loading: connectionsLoading } = useOAuthConnections();
  
  const apps = message.apps || [];
  
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin && 
        event.data?.type === 'OAUTH_SUCCESS' && 
        event.data?.provider
      ) {
        setConnectingApp(null);
      }
    };
    
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [setConnectingApp]);
  
  if (connectionsLoading) {
    return (
      <div className="flex justify-center mb-4 w-full">
        <Card className="w-full max-w-[95%] p-4">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading connection status...</span>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center mb-4 w-full">
      <Card className="w-full max-w-[95%] p-4">
        <div className="mb-3">
          <h3 className="font-medium mb-2">Connect External Applications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your accounts to enable AI-powered workflows with your data
          </p>
          
          <div className="flex flex-wrap gap-3">
            {apps.map(appName => (
              <AppConnectButton
                key={appName}
                appName={appName}
                isConnecting={connectingApp === appName}
                isConnected={isAppConnected(appName)}
                onConnect={initiateOAuthFlow}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
