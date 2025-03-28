import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { WorkflowStep } from "./WorkflowStep";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrowserEvent } from "@/types";

interface WorkflowDisplayProps {
  steps: any[];
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
  className, 
  compact = false, 
  input_editable = false,
  autoActivateSteps = false,
}, ref) => {
  // Get the user input from the first mock_get_user_inputs step
  const userInputStep = steps?.find(step => 
    step.type === "function" && step.function_name === "mock_get_user_inputs"
  );
  
  // Get the final output (we'll keep this from the original implementation)
  const finalOutput = steps?.find(step =>
    step.type === "done"
  )?.output || null;
  
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
  
  // Get browser events mapped by function name for easy lookup
  const getBrowserEventsForStep = (step: any, browserEvents: BrowserEvent[] = []) => {
    if (step.type !== 'function' || !step.function_name) return [];
    
    return browserEvents.filter(event => 
      event.function_name === step.function_name
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
      
      {/* Display workflow steps */}
      {steps?.length > 0 ? (
        <div className={compact ? "space-y-0.5 mb-3" : "space-y-1"}>
          <h3 className={`text-base font-semibold ${compact ? "mb-1.5" : "mb-2"}`}>Workflow Steps</h3>
          <div className="space-y-0.5">
            {steps.map((step) => (
              <WorkflowStep
                key={`${step.type}-${step.step_number}`}
                step={step}
                browserEvents={[]} // We'll pass browser events in a real implementation
                autoOpen={autoActivateSteps && step.active === true}
              />
            ))}
          </div>
        </div>
      ) : null}
      
      {/* Final output display */}
      {finalOutput && (
        <div className={compact ? "mt-3" : "mt-4"}>
          <h3 className={`text-base font-semibold ${compact ? "mb-1.5" : "mb-2"}`}>Example Output</h3>
          <div className="w-full overflow-hidden">
            <KeyValueDisplay data={finalOutput} compact={compact} />
          </div>
        </div>
      )}
    </div>
  );
});

WorkflowDisplay.displayName = "WorkflowDisplay";
