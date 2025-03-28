
import { useEffect, useState, useRef } from 'react';
import { WorkflowDisplay } from './WorkflowDisplay';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';
import { BrowserEvent } from '@/types';

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

export const Workflow = ({ 
  initialSteps, 
  steps = [],
  chatId,
  onStepsChange, 
  autoStart = false,
  allowRestart = false,
  compact = false,
  className = '',
  input_editable = false,
}: WorkflowProps) => {
  // Use either initialSteps or steps prop, prioritizing steps if both are provided
  const [workflowSteps, setWorkflowSteps] = useState<any[]>(steps?.length > 0 ? steps : (initialSteps || []));
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [browserEvents, setBrowserEvents] = useState<Record<string, BrowserEvent[]>>({});
  
  const workflowRef = useRef<{ getUserInputs: () => any }>(null);
  
  // Initialize with steps coming from props
  useEffect(() => {
    const stepsToUse = steps?.length > 0 ? steps : initialSteps;
    if (stepsToUse && stepsToUse.length > 0) {
      setWorkflowSteps(stepsToUse);
      
      // Auto-start if indicated
      if (autoStart) {
        startWorkflow();
      }
    }
  }, [initialSteps, steps, autoStart]);
  
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
    const newEvent: BrowserEvent = {
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
  
  // Get user inputs from the workflow display
  const getUserInputs = () => {
    if (workflowRef.current) {
      return workflowRef.current.getUserInputs();
    }
    return {};
  };
  
  return (
    <div className={`${className} w-full`}>
      <div className={`${compact ? 'mb-2' : 'mb-4'} flex justify-between items-center`}>
        {/* Workflow Controls */}
        <div className="flex space-x-2">
          {!isRunning && (currentStepIndex === -1 || allowRestart) && (
            <Button 
              onClick={startWorkflow} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Run Example</span>
            </Button>
          )}
          
          {isRunning && (
            <Button 
              onClick={stopWorkflow} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1.5 text-destructive"
            >
              <Square className="h-3.5 w-3.5" />
              <span>Stop</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Workflow Visualization */}
      <WorkflowDisplay
        ref={workflowRef}
        steps={workflowSteps}
        browserEvents={browserEvents}
        compact={compact}
        input_editable={input_editable}
        autoActivateSteps={isRunning}
      />
    </div>
  );
};
