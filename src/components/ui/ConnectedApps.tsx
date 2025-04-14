
import React, { useEffect } from 'react';
import { useOAuthConnections } from '@/hooks/useOAuthConnections';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Chrome, Mail, FileSpreadsheet, Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// App configuration with proper icons
const APP_CONFIG = {
  google_sheets: {
    name: 'Google Sheets',
    icon: FileSpreadsheet,
    color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  },
  gmail: {
    name: 'Gmail',
    icon: Mail,
    color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  },
  outlook: {
    name: 'Outlook',
    icon: Mail,
    color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  },
};

export function ConnectedApps() {
  const { connectedApps, loading } = useOAuthConnections();
  
  // Log the connected apps for debugging
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
  
  if (connectedApps.length === 0) {
    return null;
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 h-auto py-1 px-3">
          <Link2 className="h-4 w-4" />
          <span className="text-sm whitespace-nowrap">Connected Apps</span>
          <Badge variant="secondary" className="ml-1 text-xs py-0">
            {connectedApps.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Connected Applications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {connectedApps.map((app) => {
          const appConfig = APP_CONFIG[app.provider as keyof typeof APP_CONFIG];
          if (!appConfig) {
            console.log('No config found for app provider:', app.provider);
            return null;
          }
          
          const AppIcon = appConfig.icon;
          
          return (
            <DropdownMenuItem key={app.id} className={appConfig.color + " rounded-md mb-1"}>
              <AppIcon className="mr-2 h-4 w-4" />
              <span>{appConfig.name}</span>
              {app.scopes && app.scopes.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground truncate max-w-[100px]" title={app.scopes.join(', ')}>
                  {app.scopes.length > 1 ? `${app.scopes.length} scopes` : app.scopes[0].split('/').pop()}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
