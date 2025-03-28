
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { CodeRewritingStatus } from "@/types";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Chat } from "@/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkflowDisplay } from "./WorkflowDisplay";

interface WorkflowProps {
  steps: any[];
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

export const Workflow = ({ steps: propSteps, chatId }: WorkflowProps) => {
  const { sendMessage } = useMessages(chatId);
  const [steps, setSteps] = useState<any[]>([]);
  const [codeRewritingStatus, setCodeRewritingStatus] = useState<CodeRewritingStatus>('thinking');
  const [chatData, setChatData] = useState<Chat | null>(null);
  const workflowDisplayRef = useRef<{ getUserInputs: () => any } | null>(null);
  
  // Initial data fetch and real-time subscription
  useEffect(() => {
    if (!chatId) {
      setSteps(propSteps);
      setChatData(null);
      setCodeRewritingStatus('thinking');
      return;
    }

    const fetchChatData = async () => {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();

        if (error) {
          console.error('Error fetching chat data:', error);
          return;
        }

        setChatData(data);
        
        // Set steps from chat data if available
        if (data.steps) {
          setSteps(data.steps);
        } else {
          setSteps(propSteps);
        }
        
        // Set code rewriting status based on chat data
        updateCodeRewritingStatus(data);
      } catch (error) {
        console.error('Error in initial data fetch:', error);
      }
    };

    fetchChatData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`direct-chat-subscription-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setChatData(null);
            setCodeRewritingStatus('thinking');
            setSteps(propSteps);
          } else {
            // Handle chat insertion or update
            const updatedChat = payload.new as Chat;
            setChatData(updatedChat);
            
            // Update steps if available
            if (updatedChat.steps) {
              setSteps(updatedChat.steps);
            }
            
            // Update status
            updateCodeRewritingStatus(updatedChat);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, propSteps]);

  // Helper function to update code rewriting status
  const updateCodeRewritingStatus = (chat: Chat | null) => {
    if (!chat) {
      setCodeRewritingStatus('thinking');
      return;
    }
    
    if (chat.requires_code_rewrite === null) {
      setCodeRewritingStatus('thinking');
    } else if (chat.requires_code_rewrite === false) {
      setCodeRewritingStatus('done');
    } else {
      // requires_code_rewrite is true
      setCodeRewritingStatus(chat.code_approved ? 'done' : 'rewriting_code');
    }
  };

  const handleRunWorkflow = async () => {
    if (!chatId) return;
    
    // Get current user inputs directly from the WorkflowDisplay component
    const userInputs = workflowDisplayRef.current?.getUserInputs() || {};
    
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
      <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-background z-10 flex-shrink-0">
        <h2 className="text-lg font-semibold">Workflow</h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={codeRewritingStatus} />
          
          <Button 
            size="sm" 
            className="gap-1 ml-1" 
            onClick={handleRunWorkflow} 
            disabled={codeRewritingStatus !== 'done' || !steps || steps.length === 0}
          >
            <Play className="h-4 w-4" />
            Run
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {(!steps || steps.length === 0) ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No workflow steps defined
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
