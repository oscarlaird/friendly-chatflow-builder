
import { BrowserEvent } from "@/types";
import { ControlFlowStep } from "./ControlFlowStep";
import { FunctionStep } from "./FunctionStep";

interface WorkflowStepProps {
  step: any;
  browserEvents?: BrowserEvent[];
  autoOpen?: boolean;
  childSteps?: any[];
  flatDisplay?: boolean;
}

export const WorkflowStep = ({ 
  step, 
  browserEvents = [], 
  autoOpen = false, 
  childSteps = [],
  flatDisplay = false
}: WorkflowStepProps) => {
  const stepType = step.type;
  
  // Control flow steps (for/if)
  if (stepType === 'for' || stepType === 'if') {
    return (
      <ControlFlowStep
        step={step}
        browserEvents={browserEvents}
        autoOpen={autoOpen}
        childSteps={childSteps}
        flatDisplay={flatDisplay}
      />
    );
  }
  
  // Regular function steps
  return (
    <FunctionStep
      step={step}
      browserEvents={browserEvents}
      autoOpen={autoOpen}
    />
  );
};
