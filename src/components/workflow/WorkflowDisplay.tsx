
import { useState } from "react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { WorkflowStep } from "./WorkflowStep";

interface WorkflowDisplayProps {
  steps: any[];
  className?: string;
  compact?: boolean;
}

export const WorkflowDisplay = ({ steps, className, compact = false }: WorkflowDisplayProps) => {
  // Filter out ignored functions from steps
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
  
  return (
    <div className={className}>
      {/* User input form based on mock_get_user_inputs output */}
      {Object.keys(userInputs).length > 0 && (
        <div className={compact ? "mb-4" : "mb-6"}>
          <h3 className={`text-base font-semibold ${compact ? "mb-2" : "mb-3"}`}>Example Input</h3>
          <KeyValueDisplay 
            data={userInputs} 
            isInput={true}
          />
        </div>
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
            />
          ))}
        </div>
      ) : null}
      
      {/* Final output display */}
      {finalOutput && (
        <div className={compact ? "mt-4" : "mt-6"}>
          <h3 className={`text-base font-semibold ${compact ? "mb-2" : "mb-3"}`}>Example Output</h3>
          <KeyValueDisplay data={finalOutput} />
        </div>
      )}
    </div>
  );
};
