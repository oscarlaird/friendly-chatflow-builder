
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { APP_CONFIG } from '@/hooks/useOAuthFlow';
import { Icons } from '@/components/ui/icons';

interface AppConnectButtonProps {
  appName: string;
  isConnecting: boolean;
  isConnected: boolean;
  onConnect: (appName: string) => void;
}

export function AppConnectButton({ 
  appName, 
  isConnecting, 
  isConnected, 
  onConnect 
}: AppConnectButtonProps) {
  const app = APP_CONFIG[appName as keyof typeof APP_CONFIG];
  if (!app) return null;

  // Map app names to icon components
  const iconMap = {
    google_sheets: Icons.fileSpreadsheet,
    gmail: Icons.mail,
    outlook: Icons.mail,
  };

  const AppIcon = iconMap[appName as keyof typeof iconMap] || Icons.link;

  return (
    <Button
      className={
        isConnected 
          ? 'bg-green-600/50 hover:bg-green-600/50' 
          : 'bg-primary hover:bg-primary/90'
      }
      disabled={isConnecting || isConnected}
      onClick={() => onConnect(appName)}
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
}
