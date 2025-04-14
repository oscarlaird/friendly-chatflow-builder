
import React, { useEffect } from 'react';
import { useOAuthConnections } from '@/hooks/useOAuthConnections';
import { useOAuthFlow } from '@/hooks/useOAuthFlow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Link2, Loader2, Plus } from 'lucide-react';
import { OAuthIcon } from '@/components/ui/oauth-icons';

// Updated app configuration with proper interface definition
interface AppConfig {
  name: string;
  provider: string;
  color: string;
  available: boolean;
  comingSoon?: boolean;
}

// App configuration with proper icons and connection details
const AVAILABLE_APPS: Record<string, AppConfig> = {
  google_sheets: {
    name: 'Google Sheets',
    provider: 'google_sheets',
    color: 'bg-[#34A853]/10 text-[#34A853] hover:bg-[#34A853]/20',
    available: true
  },
  gmail: {
    name: 'Gmail',
    provider: 'gmail',
    color: 'bg-[#EA4335]/10 text-[#EA4335] hover:bg-[#EA4335]/20',
    available: true
  },
  outlook: {
    name: 'Outlook',
    provider: 'outlook',
    color: 'bg-[#0078D4]/10 text-[#0078D4] hover:bg-[#0078D4]/20',
    available: false,
    comingSoon: true
  }
};

export function ConnectedApps() {
  const { connectedApps, loading } = useOAuthConnections();
  const { initiateOAuthFlow, connectingApp } = useOAuthFlow();
  
  useEffect(() => {
    console.log('ConnectedApps component - connected apps:', connectedApps);
  }, [connectedApps]);
  
  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="flex items-center gap-2 h-auto py-1 px-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm whitespace-nowrap">Loading apps...</span>
      </Button>
    );
  }
  
  const connectedAppIds = new Set(connectedApps.map(app => app.provider));
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 h-auto py-1 px-2">
          <Link2 className="h-4 w-4" />
          <span className="text-sm whitespace-nowrap">Connected Apps</span>
          <Badge variant="secondary" className="ml-1 text-xs py-0">
            {connectedApps.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Applications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(AVAILABLE_APPS).map(([appId, appConfig]) => {
          const isConnected = connectedAppIds.has(appId);
          
          return (
            <DropdownMenuItem
              key={appId}
              className={`${appConfig.color} rounded-md mb-1 ${!appConfig.available ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <OAuthIcon 
                    provider={appConfig.provider as keyof typeof OAuthIcons} 
                    isConnected={isConnected}
                    size={16}
                    className="mr-2"
                  />
                  <span>{appConfig.name}</span>
                </div>
                
                {appConfig.comingSoon ? (
                  <Badge variant="outline" className="ml-2">Coming Soon</Badge>
                ) : isConnected ? (
                  <Badge variant="outline" className="ml-2 bg-white/10">Connected</Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 hover:bg-white/20"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      initiateOAuthFlow(appId);
                    }}
                    disabled={connectingApp === appId || !appConfig.available}
                  >
                    {connectingApp === appId ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
