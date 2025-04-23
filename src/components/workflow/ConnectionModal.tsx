
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AppConnectButton } from '@/components/chat/AppConnectButton';
import { Button } from '@/components/ui/button';
import { useOAuthFlow } from '@/hooks/useOAuthFlow';
import { APP_CONFIG } from '@/hooks/useOAuthFlow';
import { Play } from 'lucide-react';

interface ConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingConnections: string[];
  onContinue: () => void;
}

export function ConnectionModal({ open, onOpenChange, missingConnections, onContinue }: ConnectionModalProps) {
  const { connectingApp, initiateOAuthFlow } = useOAuthFlow();
  const { isAppConnected } = useOAuthConnections();
  const allConnected = missingConnections.every(app => isAppConnected(app));
  
  if (missingConnections.length === 0) {
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
          {missingConnections.map((appName) => (
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
          {allConnected ? (
            <Button 
              onClick={() => {
                onOpenChange(false);
                onContinue();
              }}
              className="gap-1 bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue))/80]"
            >
              <Play className="h-4 w-4" />
              Run Workflow
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
