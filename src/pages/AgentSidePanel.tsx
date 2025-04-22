
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelectedChat } from "@/hooks/useChats";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CodeRewritingStatus } from "@/types";
import { useWindowMessages } from "@/hooks/useWindowMessages";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { KeyValueDisplay } from "@/components/workflow/KeyValueDisplay";

// Status badge component for workflow state
const StatusBadge = ({ status }: { status: CodeRewritingStatus }) => {
  const isReady = status === 'done';
  return (
    <div className="flex items-center gap-1">
      {!isReady && <Loader2 className="h-3 w-3 animate-spin" />}
      <Badge 
        variant={isReady ? "default" : "outline"}
        className={cn(
          "text-xs px-2 py-0.5",
          isReady ? "bg-green-600 hover:bg-green-700" : "border-yellow-500 text-yellow-600"
        )}
      >
        {isReady ? "Ready" : status === 'thinking' ? "Thinking..." : "Rebuilding"}
      </Badge>
    </div>
  );
};

const AgentSidePanel = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chatId');
  const { selectedChat, codeRewritingStatus } = useSelectedChat(chatId || null);
  const { dataState, sendMessage } = useMessages(chatId || null);
  const [userInputs, setUserInputs] = useState<Record<string, any>>({});

  // Find the latest running code_run message
  const latestRunningMessage = Object.values(dataState.messages)
    .filter(msg => msg.type === 'code_run' && msg.code_run_state === 'running')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  // Use steps from the running message or fall back to chat steps
  const workflowSteps = latestRunningMessage?.steps || selectedChat?.steps || [];

  // Determine the current step (active: true), or highest step_number
  const currentStep =
    workflowSteps.find((step: any) => step.active) ||
    (workflowSteps.length > 0 ? workflowSteps[workflowSteps.length - 1] : null);

  // Try to get inputs for the current step (step.input)
  const currentStepInputs = currentStep && currentStep.input ? currentStep.input : null;

  // Initialize userInputs from chat or running message user_inputs
  useEffect(() => {
    if (selectedChat?.user_inputs && Object.keys(selectedChat.user_inputs).length > 0) {
      setUserInputs(selectedChat.user_inputs);
    } else if (latestRunningMessage?.user_inputs && Object.keys(latestRunningMessage.user_inputs).length > 0) {
      setUserInputs(latestRunningMessage.user_inputs);
    }
  }, [selectedChat, latestRunningMessage]);

  // Handle saving user inputs to database
  const handleUpdateUserInputs = async (newInputs: Record<string, any>) => {
    if (!chatId) return;
    setUserInputs(newInputs);
    try {
      await supabase
        .from('chats')
        .update({ user_inputs: newInputs } as any)
        .eq('id', chatId);
    } catch (err) {
      // error already logged in the original code
    }
  };

  // Listen for window messages
  useWindowMessages();

  // Handle workflow run
  const handleRunWorkflow = async () => {
    if (!chatId) return;
    try {
      const data = await sendMessage("", "user", "code_run", userInputs);
      const messageId = data.id;
      window.postMessage({
        type: 'CREATE_AGENT_RUN_WINDOW',
        payload: {
          chatId: chatId,
          roomId: messageId
        }
      }, '*');
    } catch (error) {
      // error already logged in the original code
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="px-3 py-2 border-b flex items-center justify-between sticky top-0 bg-background z-10">
        <h1 className="text-sm font-medium">Workflow Step</h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={codeRewritingStatus} />
          <Button 
            size="sm" 
            variant="secondary"
            className="h-7 text-xs px-2 flex items-center gap-1" 
            onClick={handleRunWorkflow}
            disabled={codeRewritingStatus !== 'done' || !selectedChat?.steps || selectedChat.steps.length === 0}
          >
            <Play className="h-3 w-3" />
            Run
          </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden flex flex-col justify-center items-center">
        {!currentStep ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No workflow step available
          </div>
        ) : (
          <div className="w-full max-w-lg p-4">
            <Card className="mb-4">
              <div className="p-4">
                <h2 className="text-base font-semibold mb-2">
                  {currentStep.function_name
                    ? currentStep.function_name.replace(/_/g, " ")
                    : currentStep.type === "user_input"
                      ? "User Input"
                      : currentStep.type?.charAt(0).toUpperCase() + currentStep.type?.slice(1)}
                </h2>
                {currentStep.function_description && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {currentStep.function_description}
                  </p>
                )}
                <div>
                  <span className="font-medium text-sm">Inputs:</span>
                  {currentStepInputs && Object.keys(currentStepInputs).length > 0 ? (
                    <KeyValueDisplay
                      data={currentStepInputs}
                      isEditable={currentStep.type === "user_input"}
                      setUserInputs={currentStep.type === "user_input" ? handleUpdateUserInputs : undefined}
                      compact={true}
                    />
                  ) : (
                    <div className="text-xs text-muted-foreground mt-1">No inputs for this step.</div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentSidePanel;
