
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkflowStep } from "./WorkflowStep";
import { BrowserEvent } from "@/types";

interface WorkflowSidePanelProps {
  steps: any[];
  chatId?: string;
  browserEvents?: Record<string, BrowserEvent[]>;
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
}

export const WorkflowSidePanel = ({
  steps,
  chatId,
  browserEvents = {},
  userInputs,
  setUserInputs
}: WorkflowSidePanelProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-2">
        {steps.map((step, index) => (
          <WorkflowStep
            key={`${step.step_number}-${index}`}
            step={step}
            browserEvents={browserEvents[step.function_name]}
            isUserInputStep={step.type === 'user_input'}
            userInputs={userInputs}
            setUserInputs={setUserInputs}
            chatId={chatId}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
