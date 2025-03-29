
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
  
  // Process steps to organize them hierarchically
  const organizeStepsHierarchically = (stepsToOrganize: any[]): any[] => {
    if (!stepsToOrganize || !Array.isArray(stepsToOrganize) || stepsToOrganize.length === 0) {
      return [];
    }
    
    const topLevelSteps: any[] = [];
    let currentControlStep: any = null;
    let currentBranch: any[] = [];
    
    for (let i = 0; i < stepsToOrganize.length; i++) {
      const step = stepsToOrganize[i];
      
      // Handle control flow steps (for/if)
      if (step.type === 'for' || step.type === 'if') {
        // Start a new control block
        currentControlStep = { ...step, childSteps: [] };
        topLevelSteps.push(currentControlStep);
        
        // Find the end of the control block
        let nestedLevel = 1;
        let j = i + 1;
        
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
            // Recursively organize nested blocks
            if ((nextStep.type === 'for' || nextStep.type === 'if') && j + 1 < stepsToOrganize.length) {
              // Find the nested block and organize it
              const nestedBlock = findNestedBlock(stepsToOrganize, j);
              if (nestedBlock) {
                const organized = organizeStepsHierarchically(nestedBlock.steps);
                if (organized.length > 0) {
                  currentControlStep.childSteps.push({
                    ...nextStep,
                    childSteps: organized
                  });
                  // Skip the nested block in our iteration
                  j = nestedBlock.endIndex;
                  continue;
                }
              }
            }
            
            // Regular step inside control block
            currentControlStep.childSteps.push(nextStep);
          }
          
          j++;
        }
      } 
      // Skip end markers as they're handled in the control block logic
      else if (step.type !== 'end_for' && step.type !== 'end_if') {
        topLevelSteps.push(step);
      }
    }
    
    return topLevelSteps;
  };
  
  // Helper function to find a nested block
  const findNestedBlock = (stepsArray: any[], startIndex: number): { steps: any[], endIndex: number } | null => {
    if (startIndex >= stepsArray.length) return null;
    
    const startStep = stepsArray[startIndex];
    if (startStep.type !== 'for' && startStep.type !== 'if') return null;
    
    const steps = [startStep];
    let nestedLevel = 1;
    let i = startIndex + 1;
    
    while (i < stepsArray.length && nestedLevel > 0) {
      const step = stepsArray[i];
      steps.push(step);
      
      if (step.type === 'for' || step.type === 'if') {
        nestedLevel++;
      } else if (step.type === 'end_for' || step.type === 'end_if') {
        nestedLevel--;
        if (nestedLevel === 0) {
          return { steps, endIndex: i };
        }
      }
      
      i++;
    }
    
    return null; // Block wasn't properly closed
  };
  
  // Organize steps hierarchically
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
      
      {/* Display workflow steps - removed the "Workflow Steps" heading */}
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
