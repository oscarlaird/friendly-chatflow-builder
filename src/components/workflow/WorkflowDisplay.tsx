
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
    
    // Global step tracking to prevent any duplicates across all nesting levels
    const globalProcessedSteps = new Map();
    
    // Function to check if we've seen this step globally
    const hasProcessedGlobally = (step: any) => {
      const stepKey = step.type === 'function' 
        ? `function-${step.function_name}`
        : `${step.type}-${step.step_number}`;
      
      return globalProcessedSteps.has(stepKey);
    };
    
    // Function to mark a step as processed globally
    const markProcessedGlobally = (step: any) => {
      const stepKey = step.type === 'function' 
        ? `function-${step.function_name}`
        : `${step.type}-${step.step_number}`;
      
      globalProcessedSteps.set(stepKey, true);
    };
    
    // Find all unique steps first (for display purposes)
    const uniqueSteps: any[] = [];
    
    for (let i = 0; i < stepsToOrganize.length; i++) {
      const step = stepsToOrganize[i];
      
      // Skip end markers
      if (step.type === 'end_for' || step.type === 'end_if') {
        continue;
      }
      
      // For control steps, we treat them specially
      if (step.type === 'for' || step.type === 'if') {
        // If we haven't processed this control step yet
        if (!hasProcessedGlobally(step)) {
          markProcessedGlobally(step);
          
          // Create a new control block
          const controlStep = { ...step, childSteps: [] };
          uniqueSteps.push(controlStep);
          
          // Find the matching end block
          let nestedLevel = 1;
          let j = i + 1;
          const childSteps = [];
          
          while (j < stepsToOrganize.length && nestedLevel > 0) {
            const nextStep = stepsToOrganize[j];
            
            // Increase nesting level for nested control blocks
            if (nextStep.type === 'for' || nextStep.type === 'if') {
              nestedLevel++;
            }
            
            // Decrease nesting for end blocks
            if (nextStep.type === 'end_for' || nextStep.type === 'end_if') {
              nestedLevel--;
              
              // Skip the end marker itself
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
          
          // Process child steps (each distinct step should only appear once)
          const innerUniqueSteps = [];
          const innerProcessed = new Map();
          
          for (const childStep of childSteps) {
            // Skip end markers
            if (childStep.type === 'end_for' || childStep.type === 'end_if') {
              continue;
            }
            
            // Only include each unique step once in this level
            const childKey = childStep.type === 'function' 
              ? `function-${childStep.function_name}`
              : `${childStep.type}-${childStep.step_number}`;
            
            if (!innerProcessed.has(childKey)) {
              innerProcessed.set(childKey, true);
              
              // For nested control blocks, process recursively
              if (childStep.type === 'for' || childStep.type === 'if') {
                // Find matching end block
                const nestedIndex = childSteps.indexOf(childStep);
                let nestedLevel = 1;
                let k = nestedIndex + 1;
                const nestedChildSteps = [];
                
                while (k < childSteps.length && nestedLevel > 0) {
                  const nestedStep = childSteps[k];
                  
                  if (nestedStep.type === 'for' || nestedStep.type === 'if') {
                    nestedLevel++;
                  }
                  
                  if (nestedStep.type === 'end_for' || nestedStep.type === 'end_if') {
                    nestedLevel--;
                    if (nestedLevel === 0) {
                      break;
                    }
                  }
                  
                  if (nestedLevel > 0) {
                    nestedChildSteps.push(nestedStep);
                  }
                  
                  k++;
                }
                
                // Create nested control step with its own child steps
                const nestedControlStep = {
                  ...childStep,
                  childSteps: organizeStepsHierarchically(nestedChildSteps)
                };
                
                innerUniqueSteps.push(nestedControlStep);
                
                // Mark as processed globally
                markProcessedGlobally(childStep);
              } else {
                // Regular function step
                innerUniqueSteps.push(childStep);
                
                // Mark as processed globally
                markProcessedGlobally(childStep);
              }
            }
          }
          
          // Set the child steps for this control block
          controlStep.childSteps = innerUniqueSteps;
        }
      } 
      // Regular function steps or other non-control flow steps
      else if (!hasProcessedGlobally(step)) {
        markProcessedGlobally(step);
        uniqueSteps.push(step);
      }
    }
    
    return uniqueSteps;
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
