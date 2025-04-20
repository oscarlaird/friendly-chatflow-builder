import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelectedChat } from "@/hooks/useChats";
import { WorkflowSidePanel } from "@/components/workflow/WorkflowSidePanel";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CodeRewritingStatus } from "@/types";
import { useWindowMessages } from "@/hooks/useWindowMessages";
import { supabase } from "@/integrations/supabase/client"; // Add missing import

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
  
  // Initialize user inputs from workflow steps
  useEffect(() => {
    // if (workflowSteps && workflowSteps.length > 0) {
    //   const userInputStep = workflowSteps.find(step => step.type === 'user_input');
    //   if (userInputStep?.output && Object.keys(userInputStep.output).length > 0) {
    //     console.log('Setting user inputs in AgentSidePanel:', userInputStep.output);
    //     if (Object.keys(userInputs).length === 0 || JSON.stringify(userInputs) !== JSON.stringify(userInputStep.output)) {
    //       setUserInputs(JSON.parse(JSON.stringify(userInputStep.output)));
    //     }
    //   }
    // } else
    
    if (selectedChat?.steps && Array.isArray(selectedChat.steps)) {
      const userInputStep = selectedChat.steps.find(step => step.type === 'user_input');
      if (userInputStep?.output && Object.keys(userInputStep.output).length > 0) {
        if (Object.keys(userInputs).length === 0) {
          setUserInputs(JSON.parse(JSON.stringify(userInputStep.output)));
        }
      }
    }
  }, [workflowSteps, selectedChat]);
  
  // Initialize user inputs from chat user_inputs if available
  useEffect(() => {
    if (selectedChat?.user_inputs && Object.keys(selectedChat.user_inputs).length > 0) {
      console.log('Setting user inputs from chat:', selectedChat.user_inputs);
      setUserInputs(selectedChat.user_inputs);
    }
  }, [selectedChat]);
  
  // Initialize user inputs from a running message if available
  useEffect(() => {
    if (latestRunningMessage?.user_inputs && Object.keys(latestRunningMessage.user_inputs).length > 0) {
      console.log('Setting user inputs from running message:', latestRunningMessage.user_inputs);
      setUserInputs(latestRunningMessage.user_inputs);
    }
  }, [latestRunningMessage]);
  
  // Handle saving user inputs to database
  const handleUpdateUserInputs = async (newInputs: Record<string, any>) => {
    if (!chatId) return;
    
    // Update local state
    setUserInputs(newInputs);
    
    try {
      console.log('Saving user inputs to database from side panel:', newInputs);
      
      // Save to Supabase
      const { error } = await supabase
        .from('chats')
        .update({ 
          user_inputs: newInputs 
        } as any) // Using type assertion to bypass TypeScript error
        .eq('id', chatId);
      
      if (error) {
        console.error('Error saving user inputs from side panel:', error);
      }
    } catch (err) {
      console.error('Exception saving user inputs from side panel:', err);
    }
  };
  
  // Listen for window messages
  useWindowMessages();
  
  // Handle workflow run
  const handleRunWorkflow = async () => {
    if (!chatId) return;
    
    try {
      console.log("Running workflow with user inputs:", userInputs);
      const data = await sendMessage("", "user", "code_run", userInputs);
      console.log("Message sent:", data);
      const messageId = data.id;
      window.postMessage({
        type: 'CREATE_AGENT_RUN_WINDOW',
        payload: {
          chatId: chatId,
          roomId: messageId
        }
      }, '*');
    } catch (error) {
      console.error("Error running workflow:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="px-3 py-2 border-b flex items-center justify-between sticky top-0 bg-background z-10">
        <h1 className="text-sm font-medium">Workflow Steps</h1>
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
      
      <main className="flex-1 overflow-hidden">
        {workflowSteps && workflowSteps.length > 0 ? (
          <WorkflowSidePanel 
            steps={workflowSteps}
            chatId={chatId || undefined}
            userInputs={userInputs}
            setUserInputs={handleUpdateUserInputs}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No workflow steps available
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentSidePanel;
