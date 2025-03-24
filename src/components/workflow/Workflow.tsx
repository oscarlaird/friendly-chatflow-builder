
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowStep } from "./WorkflowStep";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { CodeRewritingStatus } from "@/types";
import { useSelectedChat } from "@/hooks/useChats";

interface WorkflowStep {
  function_name: string;
  description: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  requires_browser?: boolean;
}

interface WorkflowProps {
  steps: WorkflowStep[];
  chatId: string | null;
}

const StatusBadge = ({ status }: { status: CodeRewritingStatus }) => {
  switch (status) {
    case 'thinking':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Thinking...</Badge>;
    case 'rewriting_code':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Rewriting Code</Badge>;
    case 'done':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Ready</Badge>;
    default:
      return null;
  }
};

export const Workflow = ({ steps, chatId }: WorkflowProps) => {
  const { sendMessage } = useMessages(chatId);
  const { codeRewritingStatus } = useSelectedChat(chatId);

  const handleRunWorkflow = async () => {
    if (!chatId) return;
    
    console.log("Running workflow...");
    try {
      // Send a message with type code_run
      await sendMessage("Run workflow", "user", "code_run");
    } catch (error) {
      console.error("Error running workflow:", error);
    }
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center text-center gap-2">
          <p className="text-muted-foreground">No workflow steps defined for this chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
        <h2 className="text-lg font-semibold">Workflow</h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={codeRewritingStatus} />
          <Button size="sm" className="gap-1" onClick={handleRunWorkflow} disabled={codeRewritingStatus !== 'done'}>
            <Play className="h-4 w-4" />
            Run Workflow
          </Button>
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-1">
        <div className="space-y-1">
          {steps.map((step, index) => (
            <WorkflowStep
              key={index}
              stepNumber={index + 1}
              functionName={step.function_name}
              description={step.description}
              input={step.input}
              output={step.output}
              requiresBrowser={step.requires_browser}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
