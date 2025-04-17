import { useState, useEffect, useRef } from 'react';
import { Play, Loader2, Eye, ChevronLeft } from 'lucide-react';
import { WorkflowDisplay } from './WorkflowDisplay';
import { FlowchartDisplay } from './FlowchartDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMessages } from '@/hooks/useMessages';
import { CodeRewritingStatus, Chat } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSelectedChat } from '@/hooks/useChats';
import { useRequiredApps } from '@/hooks/useRequiredApps';
import { ConnectionModal } from './ConnectionModal';
import { formatDistanceToNow } from 'date-fns';
import { Icons } from '@/components/ui/icons';
import { OAuthIcon } from '@/components/ui/oauth-icons';
import { useOAuthConnections } from '@/hooks/useOAuthConnections';
import { APP_CONFIG } from '@/hooks/useOAuthFlow';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowProps {
  steps?: any[];
  initialSteps?: any[];
  chatId?: string;
  compact?: boolean;
  className?: string;
  pastRunMessageId?: string | null;
  onClosePastRun?: () => void;
}

// Add new component for screenshot preview
const ScreenshotPreview = ({ chatId }: { chatId?: string }) => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("16/9");
  const screenshotInterval = useRef<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    // Listen for screenshot responses
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'AGENT_SCREENSHOT_RESPONSE' && 
          event.data.payload?.screenshot) {
        setScreenshot(event.data.payload.screenshot);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Request screenshots every 300ms if we have a chatId
    if (chatId) {
      screenshotInterval.current = setInterval(() => {
        window.postMessage({
          type: 'REQUEST_AGENT_SCREENSHOT',
          payload: { roomId: chatId }
        }, '*');
      }, 300);
    }
    
    return () => {
      window.removeEventListener('message', handleMessage);
      if (screenshotInterval.current) {
        clearInterval(screenshotInterval.current);
      }
    };
  }, [chatId]);
  
  // Detect the aspect ratio once the image loads
  const handleImageLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      setAspectRatio(`${naturalWidth}/${naturalHeight}`);
    }
  };
  
  if (!screenshot) return null;
  
  return (
    <div className="mt-2 rounded-md overflow-hidden border border-border">
      <img 
        ref={imgRef}
        src={screenshot} 
        alt="Agent Screenshot" 
        className="w-full h-auto object-contain max-h-50"
        style={{ aspectRatio, maxWidth: "100%" }}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

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
  
  // Update workflowSteps when pastRunMessage changes or running message updates
  useEffect(() => {
    if (pastRunMessage && pastRunMessage.steps) {
      console.log("Displaying steps from past run message:", pastRunMessage.steps);
      setWorkflowSteps(pastRunMessage.steps);
      
      // If past run had user inputs, show them
      if (pastRunMessage.user_inputs && Object.keys(pastRunMessage.user_inputs).length > 0) {
        setUserInputs(pastRunMessage.user_inputs);
      }
    } else if (runningMessage && runningMessage.steps) {
      console.log("Displaying steps from running message:", runningMessage.steps);
      setWorkflowSteps(runningMessage.steps);
      
      // If running message has user inputs, show them
      if (runningMessage.user_inputs && Object.keys(runningMessage.user_inputs).length > 0) {
        setUserInputs(runningMessage.user_inputs);
      }
    } else if (selectedChat && selectedChat.steps) {
      console.log("Displaying steps from selected chat:", selectedChat.steps);
      setWorkflowSteps(selectedChat.steps);
      
      // Initialize user inputs from selected chat
      if (selectedChat.user_inputs && Object.keys(selectedChat.user_inputs).length > 0) {
        console.log("Setting user inputs from chat:", selectedChat.user_inputs);
        setUserInputs(selectedChat.user_inputs);
      } else {
        // Try to get user inputs from steps if not available in chat
        const userInputStep = selectedChat.steps.find(step => step.type === 'user_input');
        if (userInputStep?.output && Object.keys(userInputStep.output).length > 0) {
          setUserInputs(userInputStep.output);
        }
      }
    } else if (initialSteps.length > 0) {
      console.log("Displaying initial steps:", initialSteps);
      setWorkflowSteps(initialSteps);
    }
  }, [pastRunMessage, runningMessage, selectedChat, initialSteps]);
  
  // Set up real-time subscription for messages
  useEffect(() => {
    if (!chatId) return;
    
    // Subscribe to real-time updates for messages
    const messagesChannel = supabase
      .channel('messages-steps-updates')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const updatedMessage = payload.new;
          console.log('Real-time message update received:', updatedMessage);
          
          // If this is the currently running message, update workflow steps
          if (
            updatedMessage.type === 'code_run' && 
            updatedMessage.code_run_state === 'running' &&
            updatedMessage.steps
          ) {
            console.log('Updating workflow steps from real-time data:', updatedMessage.steps);
            setWorkflowSteps(updatedMessage.steps);
          }
          
          // If we're viewing a past run that got updated, update its steps
          if (pastRunMessageId && updatedMessage.id === pastRunMessageId && updatedMessage.steps) {
            setWorkflowSteps(updatedMessage.steps);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount or when chatId changes
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [chatId, pastRunMessageId]);
  
  // Handle persisting user inputs to database
  const handleUserInputChange = async (inputs: Record<string, any>) => {
    if (!chatId) return;
    
    // Update local state immediately
    setUserInputs(inputs);
    
    try {
      console.log('Saving user inputs to database:', inputs);
      
      // Save to Supabase - FIX: Use type assertion to bypass TypeScript error
      const { error } = await supabase
        .from('chats')
        .update({ 
          user_inputs: inputs 
        } as any) // Using type assertion to bypass TypeScript error
        .eq('id', chatId);
      
      if (error) {
        console.error('Error saving user inputs:', error);
      }
    } catch (err) {
      console.error('Exception saving user inputs:', err);
    }
  };

  const handleRunWorkflow = async () => {
    if (!chatId) return;
    
    if (!allAppsConnected && requiredApps.length > 0) {
      setShowConnectionModal(true);
      return;
    }
    
    try {
      console.log('Running workflow with user inputs:', userInputs);
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
        <div className="flex items-center gap-2">
          {pastRunMessage && (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClosePastRun}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">Past Run</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(pastRunMessage.created_at), { addSuffix: true })}</span>
                  <span>•</span>
                  <span className="capitalize">{pastRunMessage.code_run_state?.replace('_', ' ')}</span>
                </div>
              </div>
            </>
          )}
          {!pastRunMessage && (
            <>
              <h2 className="text-lg font-semibold">Workflow</h2>
              {requiredApps.length > 0 && !loadingApps && (
                <AppIntegrationIcons apps={requiredApps} />
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!pastRunMessage && (
            <>
              <StatusBadge status={codeRewritingStatus} />
              <Button 
                size="sm" 
                className="gap-1 ml-1 bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue))/80]" 
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
      
      {/* Add Screenshot preview below header if extension is installed */}
      { runningMessage && (
        <div className="px-3 py-2 border-b">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Eye className="h-3.5 w-3.5" />
            <span>Live Preview</span>
          </div>
          <ScreenshotPreview chatId={chatId} />
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {(!workflowSteps || workflowSteps.length === 0) ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No workflow steps defined
              </div>
            ) : (
              <FlowchartDisplay 
                steps={workflowSteps} 
                browserEvents={browserEvents}
                compact={compact}
                userInputs={userInputs}
                setUserInputs={handleUserInputChange}
                autoActivateSteps={true}
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
