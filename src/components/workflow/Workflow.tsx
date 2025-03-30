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
import { nestSteps } from './utils/nestingUtils';
import { useSelectedChat } from '@/hooks/useChats';

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
  
  // Add debug logging for the status
  console.log('StatusBadge rendering with status:', status);

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
  
  const workflowRef = useRef<{ getUserInputs: () => any }>(null);
  const { sendMessage } = useMessages(chatId || null);
  
  // Log when chatId changes to help debug
  useEffect(() => {
    console.log('Workflow received chatId:', chatId);
  }, [chatId]);
  
  // Use our optimized hook to get selected chat and status
  const { selectedChat, codeRewritingStatus } = useSelectedChat(chatId || null);
  
  // When selectedChat changes, log its properties
  useEffect(() => {
    if (selectedChat) {
      console.log('Selected chat updated:', {
        id: selectedChat.id,
        requires_code_rewrite: selectedChat.requires_code_rewrite,
        code_approved: selectedChat.code_approved
      });
    }
  }, [selectedChat]);
  
  // Initialize with steps coming from props or selected chat
  useEffect(() => {
    // First priority: use prop steps if provided
    if (propSteps?.length > 0) {
      setWorkflowSteps(propSteps);
    } 
    // Second priority: use steps from the selected chat if available
    else if (selectedChat?.steps && Array.isArray(selectedChat.steps)) {
      setWorkflowSteps(selectedChat.steps);
    }
    // Third priority: use initialSteps if provided
    else if (initialSteps?.length > 0) {
      setWorkflowSteps(initialSteps);
    } 
    // Fallback: empty array
    else {
      setWorkflowSteps([]);
    }
    
    // Log the nested steps structure when steps change
    if (workflowSteps.length > 0) {
      const nestedSteps = nestSteps(workflowSteps);
      console.log('Nested steps structure:', nestedSteps);
    }
    
    // Auto-start if indicated
    if (autoStart && workflowSteps.length > 0 && !isRunning) {
      startWorkflow();
    }
  }, [propSteps, selectedChat, initialSteps, autoStart]);
  
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
