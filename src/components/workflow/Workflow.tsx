import { useState, useEffect, useRef } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { WorkflowDisplay } from './WorkflowDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { CodeRewritingStatus, Chat } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkflowProps {
  initialSteps?: any[];
  steps?: any[];
  chatId?: string;
  onStepsChange?: (steps: any[]) => void;
  autoStart?: boolean;
  allowRestart?: boolean;
  compact?: boolean;
  className?: string;
  input_editable?: boolean;
}

const StatusBadge = ({ status }: { status: CodeRewritingStatus }) => {
  const isReady = status === 'done';

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

export const Workflow = ({ 
  initialSteps, 
  steps: propSteps = [],
  chatId,
  onStepsChange, 
  autoStart = false,
  allowRestart = false,
  compact = false,
  className = '',
  input_editable = false,
}: WorkflowProps) => {
  // Use either initialSteps or steps prop, prioritizing steps if both are provided
  const [workflowSteps, setWorkflowSteps] = useState<any[]>(propSteps?.length > 0 ? propSteps : (initialSteps || []));
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [browserEvents, setBrowserEvents] = useState<Record<string, any[]>>({});
  const [codeRewritingStatus, setCodeRewritingStatus] = useState<CodeRewritingStatus>('thinking');
  const [chatData, setChatData] = useState<Chat | null>(null);
  
  const workflowRef = useRef<{ getUserInputs: () => any }>(null);
  const { sendMessage } = useMessages(chatId || null);
  const fetchingRef = useRef(false);
  const subscriptionRef = useRef<any>(null);
  
  // Initialize with steps coming from props
  useEffect(() => {
    const stepsToUse = propSteps?.length > 0 ? propSteps : initialSteps;
    if (stepsToUse && stepsToUse.length > 0) {
      setWorkflowSteps(stepsToUse);
      
      // Auto-start if indicated
      if (autoStart) {
        startWorkflow();
      }
    }
  }, [initialSteps, propSteps, autoStart]);
  
  // Initial data fetch and real-time subscription
  useEffect(() => {
    // Clean up previous subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    if (!chatId) {
      setWorkflowSteps(propSteps?.length > 0 ? propSteps : (initialSteps || []));
      setChatData(null);
      setCodeRewritingStatus('thinking');
      return;
    }

    const fetchChatData = async () => {
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();

        if (error) {
          console.error('Error fetching chat data:', error);
          return;
        }

        setChatData(data);

        // Set steps from chat data if available and ensure it's an array
        if (data.steps && Array.isArray(data.steps)) {
          setWorkflowSteps(data.steps);
        } else {
          setWorkflowSteps(propSteps?.length > 0 ? propSteps : (initialSteps || []));
        }

        // Set code rewriting status based on chat data
        updateCodeRewritingStatus(data);
      } catch (error) {
        console.error('Error in initial data fetch:', error);
      } finally {
        fetchingRef.current = false;
      }
    };

    fetchChatData();

    // Set up real-time subscription with a unique channel name to prevent duplication
    const channel = supabase
      .channel(`workflow-chat-${chatId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setChatData(null);
            setCodeRewritingStatus('thinking');
            setWorkflowSteps(propSteps?.length > 0 ? propSteps : (initialSteps || []));
          } else {
            // Handle chat insertion or update
            const updatedChat = payload.new as Chat;
            setChatData(updatedChat);
            
            // Update steps if available and ensure it's an array
            if (updatedChat.steps && Array.isArray(updatedChat.steps)) {
              setWorkflowSteps(updatedChat.steps);
            }
            
            // Update status
            updateCodeRewritingStatus(updatedChat);
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [chatId, propSteps, initialSteps]);

  // Helper function to update code rewriting status
  const updateCodeRewritingStatus = (chat: Chat | null) => {
    if (!chat) {
      setCodeRewritingStatus('thinking');
      return;
    }

    if (chat.requires_code_rewrite === null) {
      setCodeRewritingStatus('thinking');
    } else if (chat.requires_code_rewrite === false) {
      setCodeRewritingStatus('done');
    } else {
      // requires_code_rewrite is true
      setCodeRewritingStatus(chat.code_approved ? 'done' : 'rewriting_code');
    }
  };
  
  const startWorkflow = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentStepIndex(0);
    
    // Reset active state on all steps
    const updatedSteps = workflowSteps.map(step => ({ ...step, active: false }));
    setWorkflowSteps(updatedSteps);
    setBrowserEvents({});
  };
  
  const stopWorkflow = () => {
    setIsRunning(false);
    setCurrentStepIndex(-1);
    
    // Remove active state from all steps
    const updatedSteps = workflowSteps.map(step => ({ ...step, active: false }));
    setWorkflowSteps(updatedSteps);
    
    if (onStepsChange) {
      onStepsChange(updatedSteps);
    }
  };
  
  // Progress workflow, showing one step every interval
  useEffect(() => {
    let timeoutId: any;
    
    if (isRunning && currentStepIndex >= 0) {
      if (currentStepIndex < workflowSteps.length) {
        // Update the next step to be active
        const updatedSteps = [...workflowSteps];
        updatedSteps[currentStepIndex] = { 
          ...updatedSteps[currentStepIndex], 
          active: true 
        };
        setWorkflowSteps(updatedSteps);
        
        if (onStepsChange) {
          onStepsChange(updatedSteps);
        }
        
        // If this is a function step that needs browser, simulate browser events
        const currentStep = updatedSteps[currentStepIndex];
        if (currentStep.type === 'function' && currentStep.browser_required) {
          simulateBrowserEvents(currentStep.function_name);
        }
        
        // Progress to next step after a delay
        timeoutId = setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
        }, 1000);
      } else {
        // Workflow complete
        setIsRunning(false);
        setCurrentStepIndex(-1);
      }
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRunning, currentStepIndex, workflowSteps, onStepsChange]);
  
  // Simulate browser events for a function
  const simulateBrowserEvents = (functionName: string) => {
    if (!functionName) return;
    
    // Example browser event
    const newEvent = {
      id: `event-${Date.now()}`,
      created_at: new Date().toISOString(),
      coderun_event_id: 'example-coderun-id',
      function_name: functionName,
      data: {
        current_goal: `Simulating browser action for ${functionName}`,
        browser_state: {
          url: 'https://example.com'
        }
      },
      message_id: chatId || '',
      chat_id: chatId || '',
      uid: ''
    };
    
    // Add this event to the browser events for this function
    setBrowserEvents(prev => {
      const functionEvents = [...(prev[functionName] || []), newEvent];
      return {
        ...prev,
        [functionName]: functionEvents
      };
    });
  };

  const handleRunWorkflow = async () => {
    if (!chatId) return;
    
    // Get current user inputs directly from the WorkflowDisplay component
    const userInputs = workflowRef.current?.getUserInputs() || {};
    
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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-background z-10 flex-shrink-0">
        <h2 className="text-lg font-semibold">Workflow</h2>
        <div className="flex items-center gap-2">
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
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {(!workflowSteps || workflowSteps.length === 0) ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No workflow steps defined
              </div>
            ) : (
              <WorkflowDisplay 
                ref={workflowRef}
                steps={workflowSteps} 
                browserEvents={browserEvents}
                compact={compact}
                input_editable={input_editable}
                autoActivateSteps={isRunning}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
