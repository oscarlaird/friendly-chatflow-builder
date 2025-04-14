
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
import { FileSpreadsheet, Mail, Link2, Loader2, Plus } from 'lucide-react';

// Updated app configuration with proper interface definition
interface AppConfig {
  name: string;
  icon: React.ForwardRefExoticComponent<any>;
  color: string;
  available: boolean;
  comingSoon?: boolean;
}

// App configuration with proper icons and connection details
const AVAILABLE_APPS: Record<string, AppConfig> = {
  google_sheets: {
    name: 'Google Sheets',
    icon: FileSpreadsheet,
    color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    available: true
  },
  gmail: {
    name: 'Gmail',
    icon: Mail,
    color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    available: true
  },
  outlook: {
    name: 'Outlook',
    icon: Mail,
    color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
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
          const AppIcon = appConfig.icon;
          
          return (
            <DropdownMenuItem
              key={appId}
              className={`${appConfig.color} rounded-md mb-1 ${!appConfig.available ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <AppIcon className="mr-2 h-4 w-4" />
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
