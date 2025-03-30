
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { WorkflowStep } from "./WorkflowStep";
import { BrowserEvent } from "@/types";
import { nestSteps, StepNode } from "./utils/nestingUtils";
import { cn } from "@/lib/utils";

interface WorkflowDisplayProps {
  steps: any[];
  browserEvents?: Record<string, BrowserEvent[]>;
  className?: string;
  compact?: boolean;
  input_editable?: boolean;
  autoActivateSteps?: boolean;
}

export const WorkflowDisplay = forwardRef<
  { getUserInputs: () => any },
  WorkflowDisplayProps
>(({ 
  steps, 
  browserEvents = {}, 
  className, 
  compact = false, 
  input_editable = false,
  autoActivateSteps = false,
}, ref) => {
  // Get the user input from the first mock_get_user_inputs step
  const userInputStep = steps?.find(step => 
    step.type === "function" && step.function_name === "mock_get_user_inputs"
  );
  
  // Local state for user inputs
  const [inputValues, setInputValues] = useState<any>(userInputStep?.output || {});
  
  // Create nested steps structure
  const nestedSteps = nestSteps(steps);
  
  // Update local inputs when userInputs change
  useEffect(() => {
    const newInputs = userInputStep?.output || {};
    setInputValues(newInputs);
  }, [userInputStep]);
  
  // Handle input changes
  const handleInputChange = (newInputs: any) => {
    setInputValues(newInputs);
  };
  
  // Expose the getUserInputs method to parent components
  useImperativeHandle(ref, () => ({
    getUserInputs: () => inputValues
  }));
  
  // Get browser events for a specific step
  const getBrowserEventsForStep = (step: any) => {
    if (step.type !== 'function' || !step.function_name) return [];
    return browserEvents[step.function_name] || [];
  };
  
  // Get appropriate background color for a control block
  const getControlBlockStyle = (type: string) => {
    switch (type) {
      case 'for':
        return 'bg-purple-100/30';
      case 'if':
        return 'bg-blue-100/30';
      default:
        return '';
    }
  };
  
  // Recursive component to render step nodes
  const renderStepNode = (node: StepNode, index: number) => {
    const hasChildren = node.children && node.children.length > 0;
    
    if (!hasChildren) {
      // For leaf nodes (no children), render a simple step
      return (
        <div key={`node-${node.step.step_number}`} className="workflow-node mb-2">
          <WorkflowStep
            step={node.step}
            browserEvents={getBrowserEventsForStep(node.step)}
            autoOpen={autoActivateSteps && node.step.active === true}
            hasChildren={false}
          />
        </div>
      );
    }
    
    // For parent nodes with children, render a container with the step and its children
    const blockStyle = getControlBlockStyle(node.step.type);
    
    return (
      <div 
        key={`node-${node.step.step_number}`} 
        className="workflow-node mb-2"
      >
        <div className={cn(blockStyle, "rounded-md overflow-hidden")}>
          <WorkflowStep
            step={node.step}
            browserEvents={getBrowserEventsForStep(node.step)}
            autoOpen={autoActivateSteps && node.step.active === true}
            hasChildren={true}
          />
          
          <div className="p-3">
            {node.children.map((childNode, childIdx) => renderStepNode(childNode, childIdx))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`${className || ''} w-full max-w-full overflow-hidden`}>
      {/* User input form based on mock_get_user_inputs output */}
      {userInputStep?.output && Object.keys(userInputStep.output).length > 0 && (
        <div className={compact ? "mb-3" : "mb-4"}>
          <h3 className={`text-base font-semibold ${compact ? "mb-1.5" : "mb-2"}`}>Example Input</h3>
          <div className="w-full overflow-hidden">
            <KeyValueDisplay 
              data={userInputStep.output} 
              isEditable={input_editable}
              onChange={input_editable ? handleInputChange : undefined}
              compact={compact}
            />
          </div>
        </div>
      )}
      
      {/* Display workflow steps using the nested structure */}
      {nestedSteps?.length > 0 ? (
        <div className="space-y-1">
          {nestedSteps.map((node, idx) => renderStepNode(node, idx))}
        </div>
      ) : null}
    </div>
  );
});

WorkflowDisplay.displayName = "WorkflowDisplay";
