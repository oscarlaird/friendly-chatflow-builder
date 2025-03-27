import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { CodeRewritingStatus } from "@/types";
import { useState, useEffect, useRef } from "react";
import { Chat } from "@/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkflowDisplay } from "./WorkflowDisplay";
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
  const isReady = status === 'done';
  
  return (
    <div className="flex items-center gap-1">
      {!isReady && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      <Badge 
        variant={isReady ? "default" : "outline"}
        className={cn(
          "text-sm font-medium px-2.5 py-1",
          isReady ? "bg-green-600 hover:bg-green-700" : "border-yellow-500 text-yellow-600"
        )}
      >
        {isReady ? "Ready" : status === 'thinking' ? "Thinking..." : "Rebuilding Workflow"}
      </Badge>
    </div>
  );
};

const DebugBadge = ({ 
  label, 
  value, 
  variant = "neutral" 
}: { 
  label: string; 
  value: string | boolean | null; 
  variant?: "positive" | "negative" | "neutral";
}) => {
  const getColorClasses = () => {
    switch (variant) {
      case "positive":
        return "bg-green-50 text-green-700 border-green-200";
      case "negative":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Badge variant="outline" className={cn("text-[10px] px-1 py-0.5 font-normal", getColorClasses())}>
      {label}: {value === null ? "null" : value.toString()}
    </Badge>
  );
};

export const Workflow = ({ steps: propSteps, chatId }: WorkflowProps) => {
  const { sendMessage } = useMessages(chatId);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const workflowDisplayRef = useRef<{ getUserInputs: () => any } | null>(null);
  const renderCount = useRef(0);
  
  // Use the existing useSelectedChat hook to get the chat data and status
  const { selectedChat, codeRewritingStatus } = useSelectedChat(chatId);
  
  // Update steps when chat data changes
  useEffect(() => {
    if (!chatId) {
      // Filter out ignored functions from propSteps
      const filteredSteps = propSteps.filter(step => 
        !["mock_get_user_inputs", "main"].includes(step.function_name)
      );
      setSteps(filteredSteps);
      return;
    }

    // Set steps from selected chat data if available
    if (selectedChat?.steps) {
      console.log('Setting steps from chat data:', selectedChat.steps);
      setSteps(selectedChat.steps as unknown as WorkflowStep[]);
    } else {
      setSteps(propSteps);
    }
  }, [chatId, propSteps, selectedChat]);

  // Force render counter for debugging
  useEffect(() => {
    renderCount.current += 1;
    console.log(`Workflow rendering #${renderCount.current} with status:`, codeRewritingStatus);
  });

  const handleRunWorkflow = async () => {
    if (!chatId) return;
    
    // Get current user inputs directly from the WorkflowDisplay component
    const userInputs = workflowDisplayRef.current?.getUserInputs() || {};
    
    console.log("Running workflow with user inputs:", userInputs);
    try {
      // Send a message with type code_run and include the user inputs
      await sendMessage("Run workflow", "user", "code_run", userInputs);
      window.postMessage({
        type: 'CREATE_RECORDING_WINDOW',
        payload: {
          chatId,
          roomId: chatId
        }
      }, '*');
    } catch (error) {
      console.error("Error running workflow:", error);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 flex-shrink-0">
        <h2 className="text-lg font-semibold">Workflow</h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={codeRewritingStatus} />
          
          {/* Debug badges in a flex-shrink-0 container, much smaller */}
          <div className="flex-shrink-0 space-x-1 ml-2">
            {selectedChat && (
              <>
                <DebugBadge 
                  label="approved" 
                  value={selectedChat.code_approved} 
                  variant={selectedChat.code_approved ? "positive" : "negative"} 
                />
                <DebugBadge 
                  label="rewrite" 
                  value={selectedChat.requires_code_rewrite} 
                  variant={selectedChat.requires_code_rewrite === true ? "negative" : 
                         selectedChat.requires_code_rewrite === false ? "positive" : "neutral"} 
                />
              </>
            )}
          </div>
          
          <Button 
            size="sm" 
            className="gap-1 ml-2" 
            onClick={handleRunWorkflow} 
            disabled={codeRewritingStatus !== 'done' || !steps || steps.length === 0}
          >
            <Play className="h-4 w-4" />
            Run Workflow
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {(!steps || steps.length === 0) ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center text-center gap-2">
                  <p className="text-muted-foreground">No workflow steps defined for this chat.</p>
                </div>
              </div>
            ) : (
              <WorkflowDisplay 
                ref={workflowDisplayRef}
                steps={steps} 
                input_editable={true}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
