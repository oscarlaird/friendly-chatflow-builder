
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AppConnectButton } from '@/components/chat/AppConnectButton';
import { Button } from '@/components/ui/button';
import { useOAuthFlow } from '@/hooks/useOAuthFlow';
import { APP_CONFIG } from '@/hooks/useOAuthFlow';
import { useOAuthConnections } from '@/hooks/useOAuthConnections';

interface ConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingConnections: string[];
  onContinue: () => void;
}

export function ConnectionModal({ open, onOpenChange, missingConnections, onContinue }: ConnectionModalProps) {
  const { connectingApp, initiateOAuthFlow } = useOAuthFlow();
  const { isAppConnected } = useOAuthConnections();
  const [localMissingConnections, setLocalMissingConnections] = useState<string[]>(missingConnections);
  
  // Update local state when props change
  useEffect(() => {
    setLocalMissingConnections(missingConnections);
  }, [missingConnections]);
  
  // Check if all previously missing connections are now connected
  const allConnected = localMissingConnections.every(app => isAppConnected(app));
  
  if (localMissingConnections.length === 0) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Required Integrations</DialogTitle>
          <DialogDescription>
            This workflow requires the following integrations. Please connect them before running the workflow.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {localMissingConnections.map((appName) => (
            <AppConnectButton
              key={appName}
              appName={appName}
              isConnecting={connectingApp === appName}
              isConnected={isAppConnected(appName)}
              onConnect={initiateOAuthFlow}
            />
          ))}
        </div>
        
        <DialogFooter>
          <Button onClick={onContinue} disabled={!allConnected}>
            Continue to Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
