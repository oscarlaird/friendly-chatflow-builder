
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AppConnectButton } from '@/components/chat/AppConnectButton';
import { Button } from '@/components/ui/button';
import { useOAuthFlow } from '@/hooks/useOAuthFlow';
import { APP_CONFIG } from '@/hooks/useOAuthFlow';

interface ConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingConnections: string[];
  onContinue: () => void;
}

export function ConnectionModal({ open, onOpenChange, missingConnections, onContinue }: ConnectionModalProps) {
  const { connectingApp, initiateOAuthFlow } = useOAuthFlow();
  
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
              isConnected={false}
              onConnect={initiateOAuthFlow}
            />
          ))}
        </div>
        
        <DialogFooter>
          <Button onClick={onContinue} disabled={missingConnections.length > 0}>
            Continue to Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
