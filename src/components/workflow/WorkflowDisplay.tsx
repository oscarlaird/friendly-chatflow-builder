
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
  
  // Improved process steps to organize them hierarchically and better deduplicate steps
  const organizeStepsHierarchically = (stepsToOrganize: any[]): any[] => {
    if (!stepsToOrganize || !Array.isArray(stepsToOrganize) || stepsToOrganize.length === 0) {
      return [];
    }

    // Track processed steps globally to ensure we only show each step once
    const processedStepsMap = new Map();
    
    // Helper function to create a unique key for a step
    const getStepKey = (step: any) => {
      if (step.type === 'function') {
        return `function-${step.function_name}-${step.step_number}`;
      }
      return `${step.type}-${step.step_number}`;
    };
    
    // Process a sequence of steps, handling nested control structures
    const processStepSequence = (sequence: any[], parentContext: string = 'root'): any[] => {
      const result: any[] = [];
      let i = 0;
      
      while (i < sequence.length) {
        const currentStep = sequence[i];
        
        // Skip end markers
        if (currentStep.type === 'end_for' || currentStep.type === 'end_if') {
          i++;
          continue;
        }
        
        // Create a context-aware key to differentiate same steps in different contexts
        const contextKey = `${parentContext}-${getStepKey(currentStep)}`;
        
        // If this is a control structure (for/if)
        if (currentStep.type === 'for' || currentStep.type === 'if') {
          // Only process if we haven't seen this control structure in this context
          if (!processedStepsMap.has(contextKey)) {
            processedStepsMap.set(contextKey, true);
            
            // Find the scope of this control structure
            let nestLevel = 1;
            let endIndex = i + 1;
            const bodySteps = [];
            
            while (endIndex < sequence.length && nestLevel > 0) {
              const step = sequence[endIndex];
              
              if (step.type === 'for' || step.type === 'if') {
                nestLevel++;
              } else if (step.type === 'end_for' || step.type === 'end_if') {
                nestLevel--;
                if (nestLevel === 0) break;
              }
              
              if (nestLevel > 0) {
                bodySteps.push(step);
              }
              
              endIndex++;
            }
            
            // Process the body of the control structure with a new context
            const childContext = `${contextKey}-body`;
            const processedBody = processStepSequence(bodySteps, childContext);
            
            // Add the control structure with its processed body
            result.push({
              ...currentStep,
              childSteps: processedBody
            });
            
            // Skip to after the end marker
            i = endIndex + 1;
          } else {
            // We've already processed this control structure, skip it
            i++;
          }
        } else {
          // For normal steps, only include them if we haven't seen them in this context
          if (!processedStepsMap.has(contextKey)) {
            processedStepsMap.set(contextKey, true);
            result.push(currentStep);
          }
          i++;
        }
      }
      
      return result;
    };
    
    // Start processing from the top level
    return processStepSequence(stepsToOrganize);
  };
  
  // Organize steps hierarchically with improved deduplication
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
        <div className={compact ? "mb-3" : ""}>
          {/* Removed space-y-0.5 class to eliminate vertical spacing */}
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
      ) : null}
    </div>
  );
});

WorkflowDisplay.displayName = "WorkflowDisplay";
