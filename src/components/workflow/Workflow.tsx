
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowStep } from "./WorkflowStep";
import { Info } from "lucide-react";

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
  if (!steps || steps.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="flex flex-col items-center text-center gap-2">
            <Info className="h-10 w-10 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No workflow steps defined for this chat.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle>Workflow Steps</CardTitle>
      </CardHeader>
      <CardContent className="p-6 overflow-y-auto">
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
      </CardContent>
    </Card>
  );
};
