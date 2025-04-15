
import { useState, useEffect, useRef } from 'react';
import { Play, Loader2, Eye, ChevronLeft } from 'lucide-react';
import { WorkflowDisplay } from './WorkflowDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMessages } from '@/hooks/useMessages';
import { CodeRewritingStatus, Chat } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSelectedChat } from '@/hooks/useChats';
import { useRequiredApps } from '@/hooks/useRequiredApps';
import { ConnectionModal } from './ConnectionModal';
import { APP_CONFIG } from '@/hooks/useOAuthFlow';
import { Icons } from '@/components/ui/icons';
import { OAuthIcon } from '@/components/ui/oauth-icons';
import { useOAuthConnections } from '@/hooks/useOAuthConnections';


interface WorkflowProps {
  steps?: any[];
  initialSteps?: any[];
  chatId?: string;
  compact?: boolean;
  className?: string;
  pastRunMessageId?: string | null;
  onClosePastRun?: () => void;
}

const StatusBadge = ({ status }: { status: CodeRewritingStatus }) => {
  const isReady = status === 'done';
  const prevStatusRef = useRef<CodeRewritingStatus>(status);

  
  // Only log when status changes, not on every render
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      console.log('StatusBadge status changed to:', status);
      prevStatusRef.current = status;
    }
  }, [status]);

  return (
    <div className="flex items-center gap-1">
      {!isReady && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      <Badge 
        variant={isReady ? "default" : "outline"}
        className={cn(
          "text-sm font-medium px-2.5 py-1",
          isReady ? "bg-green-600 hover:bg-green-700" : "border-yellow-500 text-yellow-600"
        )}
      >
        {isReady ? "Ready" : status === 'thinking' ? "Thinking..." : "Rebuilding Workflow"}
      </Badge>
    </div>
  );
};

// Helper component to render app icons
const AppIntegrationIcons = ({ apps }: { apps: string[] }) => {
  const { isAppConnected } = useOAuthConnections();
  
  if (!apps || apps.length === 0) return null;
  
  return (
    <div className="flex items-center gap-1.5 ml-2">
      {apps.map(app => {
        const isConnected = isAppConnected(app);
        const appName = APP_CONFIG[app as keyof typeof APP_CONFIG]?.name || app;
        
        return (
          <Badge key={app} variant="outline" className="px-1.5 flex items-center gap-1">
            <OAuthIcon 
              provider={app as any}
              size={14}
              isConnected={isConnected}
            />
            <span className="text-xs">{appName}</span>
          </Badge>
        );
      })}
    </div>
  );
};

export const Workflow = ({ 
  steps = [],
  initialSteps = [],
  chatId,
  compact = false,
  className = '',
  pastRunMessageId,
  onClosePastRun,
}: WorkflowProps) => {
  const [workflowSteps, setWorkflowSteps] = useState<any[]>(steps.length > 0 ? steps : initialSteps);
  const [browserEvents, setBrowserEvents] = useState<Record<string, any[]>>({});
  const [userInputs, setUserInputs] = useState<Record<string, any>>({});
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  
  const { dataState, sendMessage } = useMessages(chatId || null);
  const { selectedChat, codeRewritingStatus } = useSelectedChat(chatId || null);
  const { requiredApps, missingConnections, allAppsConnected, loading: loadingApps } = useRequiredApps(chatId);

  // Find the current running message if any
  const runningMessage = Object.values(dataState.messages).find(
    msg => msg.type === 'code_run' && msg.code_run_state === 'running'
  );

  // Get past run message if viewing one
  const pastRunMessage = pastRunMessageId ? dataState.messages[pastRunMessageId] : null;

  // Background color based on whether viewing past run
  const bgColor = pastRunMessage ? 'bg-muted/30' : 'bg-background';
  
  // Update workflowSteps when pastRunMessage changes
  useEffect(() => {
    if (pastRunMessage && pastRunMessage.steps) {
      console.log("Displaying steps from past run message:", pastRunMessage.steps);
      setWorkflowSteps(pastRunMessage.steps);
    } else if (selectedChat && selectedChat.steps) {
      console.log("Displaying steps from selected chat:", selectedChat.steps);
      setWorkflowSteps(selectedChat.steps);
    } else if (initialSteps.length > 0) {
      console.log("Displaying initial steps:", initialSteps);
      setWorkflowSteps(initialSteps);
    }
  }, [pastRunMessage, selectedChat, initialSteps]);
  
  const handleRunWorkflow = async () => {
    if (!chatId) return;
    
    if (!allAppsConnected && requiredApps.length > 0) {
      setShowConnectionModal(true);
      return;
    }
    
    try {
      const data = await sendMessage("", "user", "code_run", userInputs);
      window.postMessage({
        type: 'CREATE_AGENT_RUN_WINDOW',
        payload: {
          chatId: chatId,
          roomId: data.id
        }
      }, '*');
    } catch (error) {
      console.error("Error running workflow:", error);
    }
  };

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      <div className={cn(
        "p-3 border-b flex items-center justify-between sticky top-0 bg-background z-10 flex-shrink-0",
        bgColor
      )}>
        <div className="flex items-center">
          {pastRunMessage && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClosePastRun}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-lg font-semibold">
            {pastRunMessage ? 'Past Run' : 'Workflow'}
          </h2>
          {requiredApps.length > 0 && !loadingApps && (
            <AppIntegrationIcons apps={requiredApps} />
          )}
        </div>
        <div className="flex items-center gap-2">
          {!pastRunMessage && (
            <>
              <StatusBadge status={codeRewritingStatus} />
              <Button 
                size="sm" 
                className="gap-1 ml-1" 
                onClick={handleRunWorkflow} 
                disabled={codeRewritingStatus !== 'done' || !workflowSteps || workflowSteps.length === 0}
              >
                <Play className="h-4 w-4" />
                Run
              </Button>
            </>
          )}
          {pastRunMessage && (
            <Button 
              variant="secondary"
              size="sm" 
              onClick={onClosePastRun}
            >
              Close Past Run
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {(!workflowSteps || workflowSteps.length === 0) ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No workflow steps defined
              </div>
            ) : (
              <WorkflowDisplay 
                steps={workflowSteps} 
                browserEvents={browserEvents}
                compact={compact}
                userInputs={userInputs}
                setUserInputs={setUserInputs}
              />
            )}
          </div>
        </ScrollArea>
      </div>
      
      <ConnectionModal 
        open={showConnectionModal}
        onOpenChange={setShowConnectionModal}
        missingConnections={missingConnections}
        onContinue={() => {
          setShowConnectionModal(false);
          if (allAppsConnected) {
            handleRunWorkflow();
          }
        }}
      />
    </div>
  );
};
