
import { Info, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowStep } from "./WorkflowStep";

interface WorkflowStep {
  function_name: string;
  description: string;
  example_input?: Record<string, any>;
  example_output?: Record<string, any>;
  requires_browser?: boolean;
}

interface WorkflowProps {
  steps: WorkflowStep[];
}

export const Workflow = ({ steps }: WorkflowProps) => {
  const handleRunWorkflow = () => {
    console.log("Running workflow...");
    // Implementation for running the workflow would go here
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center text-center gap-2">
          <Info className="h-10 w-10 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No workflow steps defined for this chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
        <h2 className="text-lg font-semibold">Workflow Steps</h2>
        <Button size="sm" className="gap-1" onClick={handleRunWorkflow}>
          <Play className="h-4 w-4" />
          Run Workflow
        </Button>
      </div>
      <div className="p-4 overflow-y-auto flex-1">
        <div className="space-y-1">
          {steps.map((step, index) => (
            <WorkflowStep
              key={index}
              stepNumber={index + 1}
              functionName={step.function_name}
              description={step.description}
              exampleInput={step.example_input}
              exampleOutput={step.example_output}
              requiresBrowser={step.requires_browser}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
