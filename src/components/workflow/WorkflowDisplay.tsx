
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { WorkflowStep } from "./WorkflowStep";
import { BrowserEvent } from "@/types";

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
  
  // Process steps to organize them hierarchically and deduplicate steps
  const organizeStepsHierarchically = (stepsToOrganize: any[]): any[] => {
    if (!stepsToOrganize || !Array.isArray(stepsToOrganize) || stepsToOrganize.length === 0) {
      return [];
    }
    
    // Use a map to track processed steps by their function name or control block type
    // This ensures we only process each unique step once
    const processedStepMap = new Map();
    const topLevelSteps: any[] = [];
    
    for (let i = 0; i < stepsToOrganize.length; i++) {
      const step = stepsToOrganize[i];
      
      // Generate a unique ID for this step based on its characteristics
      const stepKey = step.type === 'function' 
        ? `function-${step.function_name}`
        : `${step.type}-${step.step_number}`;
      
      // For control flow steps (for/if), handle them specially
      if (step.type === 'for' || step.type === 'if') {
        // Skip if we've already processed an identical control block
        if (processedStepMap.has(stepKey)) {
          continue;
        }
        processedStepMap.set(stepKey, true);
        
        // Start a new control block
        const controlStep = { ...step, childSteps: [] };
        topLevelSteps.push(controlStep);
        
        // Find all steps within this control block
        let nestedLevel = 1;
        let j = i + 1;
        const childSteps = [];
        
        while (j < stepsToOrganize.length && nestedLevel > 0) {
          const nextStep = stepsToOrganize[j];
          
          // Increase nesting level for new control blocks
          if (nextStep.type === 'for' || nextStep.type === 'if') {
            nestedLevel++;
          }
          
          // Decrease nesting level for end blocks
          if (nextStep.type === 'end_for' || nextStep.type === 'end_if') {
            nestedLevel--;
            
            // Skip the end marker if we're closing our current block
            if (nestedLevel === 0) {
              i = j; // Skip to after this block in the outer loop
              break;
            }
          }
          
          // Add steps inside our control block to childSteps
          if (nestedLevel > 0) {
            childSteps.push(nextStep);
          }
          
          j++;
        }
        
        // Recursively organize child steps with their own deduplication
        controlStep.childSteps = organizeStepsHierarchically(childSteps);
      } 
      // Function and other non-control flow steps
      else if (step.type !== 'end_for' && step.type !== 'end_if') {
        // Skip if we've already processed this type of step, unless it's a special step
        // that should always be shown (like done)
        if (step.type === 'done' || !processedStepMap.has(stepKey)) {
          processedStepMap.set(stepKey, true);
          topLevelSteps.push(step);
        }
      }
    }
    
    return topLevelSteps;
  };
  
  // Organize steps hierarchically with deduplication
  const organizedSteps = organizeStepsHierarchically(steps);
  
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
      
      {/* Display workflow steps */}
      {organizedSteps?.length > 0 ? (
        <div className={compact ? "space-y-0.5 mb-3" : "space-y-1"}>
          <div className="space-y-0.5">
            {organizedSteps.map((step) => (
              <WorkflowStep
                key={`${step.type}-${step.step_number}`}
                step={step}
                browserEvents={getBrowserEventsForStep(step)}
                autoOpen={autoActivateSteps && step.active === true}
                childSteps={step.childSteps || []}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});

WorkflowDisplay.displayName = "WorkflowDisplay";
