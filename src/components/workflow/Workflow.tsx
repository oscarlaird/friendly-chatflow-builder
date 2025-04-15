
import { useState, useEffect, useRef } from 'react';
import { Play, Loader2, Link, FlowChart, ListOrdered } from 'lucide-react';
import { WorkflowDisplay } from './WorkflowDisplay';
import { WorkflowGraph } from './WorkflowGraph';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMessages } from '@/hooks/useMessages';
import { CodeRewritingStatus, Chat } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { nestSteps } from './utils/nestingUtils';
import { useSelectedChat } from '@/hooks/useChats';
import { useRequiredApps } from '@/hooks/useRequiredApps';
import { ConnectionModal } from './ConnectionModal';
import { APP_CONFIG } from '@/hooks/useOAuthFlow';
import { Icons } from '@/components/ui/icons';
import { OAuthIcon } from '@/components/ui/oauth-icons';
import { useOAuthConnections } from '@/hooks/useOAuthConnections';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface WorkflowProps {
  steps?: any[];
  initialSteps?: any[];
  chatId?: string;
  compact?: boolean;
  className?: string;
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
  initialSteps = [],
  steps= [],
  chatId,
  compact = false,
  className = '',
}: WorkflowProps) => {

  useEffect(() => {
    console.log('RENDER - Workflow component rendered');
  });
  
  const [workflowSteps, setWorkflowSteps] = useState<any[]>(steps.length > 0 ? steps : initialSteps);
  const [browserEvents, setBrowserEvents] = useState<Record<string, any[]>>({});
  const [userInputs, setUserInputs] = useState<Record<string, any>>({});
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  
  const { sendMessage } = useMessages(chatId || null);
  
  // Use our hooks for selected chat, code rewriting status, and required apps
  const { selectedChat, codeRewritingStatus } = useSelectedChat(chatId || null);
  const { requiredApps, missingConnections, allAppsConnected, loading: loadingApps } = useRequiredApps(chatId);
  
  // When selectedChat changes, log its properties
  useEffect(() => {
    if (selectedChat) {
      console.log('Workflow: Selected chat updated:', {
        id: selectedChat.id,
        requires_code_rewrite: selectedChat.requires_code_rewrite,
        code_approved: selectedChat.code_approved,
        codeRewritingStatus: codeRewritingStatus,
        apps: selectedChat.apps
      });
    } else {
      console.log('Workflow: Selected chat is null');
    }
  }, [selectedChat, codeRewritingStatus]);
  
  // Initialize with steps coming from props or selected chat
  useEffect(() => {
    let stepsToUse: any[] = [];

    if (selectedChat?.steps && Array.isArray(selectedChat.steps)) {
      stepsToUse = selectedChat.steps;
    }
      
    setWorkflowSteps(stepsToUse);
    
    // Initialize user input values from steps if applicable
    if (stepsToUse.length > 0) {
      const userInputStep = stepsToUse.find(step => step.type === 'user_input');
      if (userInputStep?.output && Object.keys(userInputStep.output).length > 0) {
        // Only set initial values if we don't have any
        setUserInputs(JSON.parse(JSON.stringify(userInputStep.output)));
      }
    }
   
  }, [selectedChat]);
  
  const handleRunWorkflow = async () => {
    console.log('handleRunWorkflow - userInputs', userInputs);
    
    if (!chatId) return;
    
    // Check if all required apps are connected
    if (!allAppsConnected && requiredApps.length > 0) {
      setShowConnectionModal(true);
      return;
    }
    
    try {
      // Send an empty message instead of "Run workflow"
      const data = await sendMessage("", "user", "code_run", userInputs);
      
      console.log("Message sent:", data);
      const messageId = data.id;
      window.postMessage({
        type: 'CREATE_AGENT_RUN_WINDOW',
        payload: {
          chatId: chatId,
          roomId: messageId
        }
      }, '*');
    } catch (error) {
      console.error("Error running workflow:", error);
    }
  };
  
  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-background z-10 flex-shrink-0">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">Workflow</h2>
          {requiredApps.length > 0 && !loadingApps && (
            <AppIntegrationIcons apps={requiredApps} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'list' | 'graph')}
            className="mr-2"
          >
            <TabsList className="h-8">
              <TabsTrigger value="list" className="h-7 px-3 text-xs">
                <ListOrdered className="h-3.5 w-3.5 mr-1" />
                List
              </TabsTrigger>
              <TabsTrigger value="graph" className="h-7 px-3 text-xs">
                <FlowChart className="h-3.5 w-3.5 mr-1" />
                Graph
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' ? (
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
        ) : (
          <div className="h-full">
            <WorkflowGraph
              steps={workflowSteps}
              chatId={chatId}
              browserEvents={browserEvents}
              userInputs={userInputs}
              setUserInputs={setUserInputs}
            />
          </div>
        )}
      </div>
      
      {/* Connection Modal */}
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
