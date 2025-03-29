
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
  
  // Process steps to flatten them while preserving logical flow
  const flattenSteps = (stepsToProcess: any[]): any[] => {
    if (!stepsToProcess || !Array.isArray(stepsToProcess) || stepsToProcess.length === 0) {
      return [];
    }

    // Extract the "done" step (if any) to display at the root level
    const doneStep = stepsToProcess.find(step => step.type === 'done');
    const nonDoneSteps = doneStep ? stepsToProcess.filter(step => step.type !== 'done') : stepsToProcess;
    
    // Use a map to track processed steps by step number to avoid duplicates
    const processedStepsMap = new Map();
    const result: any[] = [];
    
    // Helper function to create a unique key for a step
    const getStepKey = (step: any) => {
      if (step.type === 'function') {
        return `function-${step.function_name}-${step.step_number}`;
      }
      return `${step.type}-${step.step_number}`;
    };
    
    // Process all steps (except 'done' step) without nesting
    const processSteps = (steps: any[]) => {
      for (const step of steps) {
        const stepKey = getStepKey(step);
        
        // Skip if we've already processed this step
        if (processedStepsMap.has(stepKey)) {
          continue;
        }
        
        processedStepsMap.set(stepKey, true);
        
        // For control flow steps (if/for), process their body steps first
        if (step.type === 'for' || step.type === 'if') {
          // Find the end of this control structure
          const bodySteps = [];
          let nestLevel = 1;
          let i = stepsToProcess.indexOf(step) + 1;
          
          while (i < stepsToProcess.length && nestLevel > 0) {
            const currentStep = stepsToProcess[i];
            
            if (currentStep.type === 'for' || currentStep.type === 'if') {
              nestLevel++;
            } else if (currentStep.type === 'end_for' || currentStep.type === 'end_if') {
              nestLevel--;
              if (nestLevel === 0) break;
            }
            
            if (nestLevel > 0) {
              bodySteps.push(currentStep);
            }
            
            i++;
          }
          
          // Add the control structure to results
          result.push({
            ...step,
            childSteps: processSteps(bodySteps)
          });
        } else if (step.type !== 'end_for' && step.type !== 'end_if') {
          // Add regular steps (skip end markers)
          result.push(step);
        }
      }
      
      return result;
    };
    
    // Process all non-done steps
    const processedSteps = processSteps(nonDoneSteps);
    
    // Add the done step at the end if it exists
    return doneStep ? [...processedSteps, doneStep] : processedSteps;
  };
  
  // Flatten steps while preserving logical flow and ensuring 'done' step is at root level
  const flattenedSteps = flattenSteps(steps);
  
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
      
      {/* Display workflow steps as a flat list */}
      {flattenedSteps?.length > 0 ? (
        <div className={compact ? "mb-3" : ""}>
          {flattenedSteps.map((step) => (
            <WorkflowStep
              key={`${step.type}-${step.step_number}`}
              step={step}
              browserEvents={getBrowserEventsForStep(step)}
              autoOpen={autoActivateSteps && step.active === true}
              childSteps={step.childSteps || []}
              flatDisplay={true}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
});

WorkflowDisplay.displayName = "WorkflowDisplay";
