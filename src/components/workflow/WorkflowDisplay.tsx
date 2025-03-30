
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { WorkflowStep } from "./WorkflowStep";
import { BrowserEvent } from "@/types";
import { nestSteps, StepNode } from "./utils/nestingUtils";

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
  
  // Recursive component to render step nodes
  const renderStepNode = (node: StepNode, index: number) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={`node-${node.step.step_number}`} className="workflow-node">
        <WorkflowStep
          step={node.step}
          browserEvents={getBrowserEventsForStep(node.step)}
          autoOpen={autoActivateSteps && node.step.active === true}
          hasChildren={hasChildren}
        />
        
        {hasChildren && (
          <div 
            className={`pl-6 mt-1 border-l-2 border-dashed ml-3.5 ${getControlBlockClass(node.step.type)}`}
          >
            {node.children.map((childNode, childIdx) => renderStepNode(childNode, childIdx))}
          </div>
        )}
      </div>
    );
  };
  
  // Helper function to get the appropriate control block class based on step type
  const getControlBlockClass = (type: string) => {
    switch (type) {
      case 'for':
        return 'border-purple-400 bg-purple-50/40 rounded-bl-lg pl-4';
      case 'if':
        return 'border-blue-400 bg-blue-50/40 rounded-bl-lg pl-4';
      default:
        return 'border-gray-300';
    }
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
        <div className={compact ? "space-y-0.5 mb-3" : "space-y-1"}>
          <div className="space-y-0.5">
            {nestedSteps.map((node, idx) => renderStepNode(node, idx))}
          </div>
        </div>
      ) : null}
    </div>
  );
});

WorkflowDisplay.displayName = "WorkflowDisplay";
