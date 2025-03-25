
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowStep } from "./WorkflowStep";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { CodeRewritingStatus } from "@/types";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Chat } from "@/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [codeRewritingStatus, setCodeRewritingStatus] = useState<CodeRewritingStatus>('thinking');
  const [chatData, setChatData] = useState<Chat | null>(null);
  const renderCount = useRef(0);
  
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
        console.log('Fetching initial chat data for:', chatId);
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();

        if (error) {
          console.error('Error fetching chat data:', error);
          return;
        }

        console.log('Initial chat data loaded:', data);
        setChatData(data);
        
        // Set steps from chat data if available
        if (data.steps) {
          console.log('Setting steps from chat data:', data.steps);
          setSteps(data.steps as unknown as WorkflowStep[]);
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
    console.log(`Setting up direct Supabase subscription for chat ${chatId}`);
    
    const channel = supabase
      .channel(`direct-chat-subscription-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`
        },
        (payload) => {
          console.log('Real-time chat update received in Workflow component:', payload);
          
          if (payload.eventType === 'DELETE') {
            setChatData(null);
            setCodeRewritingStatus('thinking');
            setSteps(propSteps);
          } else {
            // Handle chat insertion or update
            const updatedChat = payload.new as Chat;
            console.log('Updated chat data in Workflow:', updatedChat);
            
            setChatData(updatedChat);
            
            // Update steps if available
            if (updatedChat.steps) {
              console.log('Setting steps from updated chat:', updatedChat.steps);
              setSteps(updatedChat.steps as unknown as WorkflowStep[]);
            }
            
            // Update status
            updateCodeRewritingStatus(updatedChat);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Direct Supabase subscription status for chat ${chatId}:`, status);
      });

    return () => {
      console.log(`Cleaning up direct Supabase subscription for chat ${chatId}`);
      supabase.removeChannel(channel);
    };
  }, [chatId, propSteps]);

  // Helper function to update code rewriting status
  const updateCodeRewritingStatus = (chat: Chat | null) => {
    if (!chat) {
      setCodeRewritingStatus('thinking');
      return;
    }
    
    console.log('Updating code rewriting status based on:', chat.requires_code_rewrite, chat.code_approved);
    
    if (chat.requires_code_rewrite === null) {
      setCodeRewritingStatus('thinking');
    } else if (chat.requires_code_rewrite === false) {
      setCodeRewritingStatus('done');
    } else {
      // requires_code_rewrite is true
      setCodeRewritingStatus(chat.code_approved ? 'done' : 'rewriting_code');
    }
  };

  // Force render counter for debugging
  useEffect(() => {
    renderCount.current += 1;
    console.log(`Workflow rendering #${renderCount.current} with status:`, codeRewritingStatus);
  });

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 flex-shrink-0">
        <h2 className="text-lg font-semibold">Workflow</h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={codeRewritingStatus} />
          
          {/* Debug badges in a flex-shrink-0 container, much smaller */}
          <div className="flex-shrink-0 space-x-1 ml-2">
            {chatData && (
              <>
                <DebugBadge 
                  label="approved" 
                  value={chatData.code_approved} 
                  variant={chatData.code_approved ? "positive" : "negative"} 
                />
                <DebugBadge 
                  label="rewrite" 
                  value={chatData.requires_code_rewrite} 
                  variant={chatData.requires_code_rewrite === true ? "negative" : 
                         chatData.requires_code_rewrite === false ? "positive" : "neutral"} 
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
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {(!steps || steps.length === 0) ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center text-center gap-2">
                  <p className="text-muted-foreground">No workflow steps defined for this chat.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <WorkflowStep
                    key={`${step.function_name}-${index}`}
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
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
