
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

// Simple component to show browser events in a scrollable container
const BrowserEventsList = ({ events }: { events: BrowserEvent[] }) => {
  if (!events || events.length === 0) return null;
  
  // Sort events in reverse chronological order (newest first)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold mb-2">Browser Events</h3>
      <div className="border rounded-md overflow-hidden">
        <ScrollArea className="h-36">
          <div className="divide-y">
            {sortedEvents.map((event, index) => {
              const browserState = event?.data?.browser_state;
              const currentGoal = event?.data?.current_goal;
              
              return (
                <div key={index} className="p-2 text-xs">
                  <div className="font-medium">{currentGoal || "Browser Action"}</div>
                  {browserState?.url && (
                    <div className="truncate text-muted-foreground mt-1">
                      {browserState.url}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

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
  // Memoize the filtered steps to prevent unnecessary re-renders
  const IGNORED_FUNCTIONS = ["mock_get_user_inputs", "main"];
  
  // Filter out the ignored functions
  const filteredSteps = steps?.filter(step => 
    !IGNORED_FUNCTIONS.includes(step.function_name)
  ) || [];
  
  // Get the user input from mock_get_user_inputs step
  const mockInputStep = steps?.find(step => 
    step.function_name === "mock_get_user_inputs"
  );
  
  // Get the final output from the main step
  const mainStep = steps?.find(step => 
    step.function_name === "main"
  );
  
  const userInputs = mockInputStep?.output || {};
  const finalOutput = mainStep?.output || null;
  
  // Collect all browser events from all steps without triggering unnecessary re-renders
  const allBrowserEvents: BrowserEvent[] = [];
  filteredSteps.forEach(step => {
    if (step.browserEvents && step.browserEvents.length > 0) {
      allBrowserEvents.push(...step.browserEvents);
    }
  });
  
  // Local state for the input value
  const [inputValues, setInputValues] = useState<any>(userInputs);
  
  // Update local inputs when userInputs change, using JSON stringify to avoid needless rerenders
  const userInputsJson = JSON.stringify(userInputs);
  useEffect(() => {
    const parsedInputs = JSON.parse(userInputsJson);
    setInputValues(parsedInputs);
  }, [userInputsJson]);
  
  // Handle input changes
  const handleInputChange = (newInputs: any) => {
    setInputValues(newInputs);
  };
  
  // Expose the getUserInputs method to parent components
  useImperativeHandle(ref, () => ({
    getUserInputs: () => inputValues
  }));
  
  return (
    <div className={`${className || ''} w-full max-w-full overflow-hidden`}>
      {/* User input form based on mock_get_user_inputs output */}
      {Object.keys(userInputs).length > 0 && (
        <div className={compact ? "mb-4" : "mb-6"}>
          <h3 className={`text-base font-semibold ${compact ? "mb-2" : "mb-3"}`}>Example Input</h3>
          <div className="w-full overflow-hidden">
            <KeyValueDisplay 
              data={userInputs} 
              isInput={true}
              onChange={input_editable ? handleInputChange : null} // Only allow changes if editable
            />
          </div>
        </div>
      )}
      
      {/* Display browser events between input and steps */}
      {allBrowserEvents.length > 0 && (
        <BrowserEventsList events={allBrowserEvents} />
      )}
      
      {/* Display workflow steps */}
      {filteredSteps.length > 0 ? (
        <div className={compact ? "space-y-1 mb-4" : "space-y-1"}>
          <h3 className={`text-base font-semibold ${compact ? "mb-2" : "mb-3"}`}>Workflow Steps</h3>
          {filteredSteps.map((step, index) => (
            <WorkflowStep
              key={`${step.function_name}-${index}`}
              stepNumber={index + 1}
              functionName={step.function_name}
              description={step.description}
              input={step.input}
              output={step.output}
              requiresBrowser={step.requires_browser}
              isLast={index === filteredSteps.length - 1}
              active={step.active === true} // Pass the active state to highlight the step
              autoOpen={autoActivateSteps && step.active === true} // Auto open sections if step is active and autoActivateSteps is true
              browserEvents={step.browserEvents} // Pass browser events to the step
            />
          ))}
        </div>
      ) : null}
      
      {/* Final output display */}
      {finalOutput && (
        <div className={compact ? "mt-4" : "mt-6"}>
          <h3 className={`text-base font-semibold ${compact ? "mb-2" : "mb-3"}`}>Example Output</h3>
          <div className="w-full overflow-hidden">
            <KeyValueDisplay data={finalOutput} />
          </div>
        </div>
      )}
    </div>
  );
});

WorkflowDisplay.displayName = "WorkflowDisplay";
