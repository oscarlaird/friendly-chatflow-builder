
import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Workflow } from '../workflow/Workflow';
import { useChats } from '@/hooks/useChats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, GitBranch } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface ChatInterfaceProps {
  chatId: string | null;
}

export const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const { dataState, loading, sendMessage } = useMessages(chatId);
  const { chats } = useChats();
  const [sending, setSending] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'workflow'>('chat');
  const [workflowUserInputs, setWorkflowUserInputs] = useState<any>(null);

  // Find the current chat in the chats array to get initial steps
  const currentChat = chats.find(chat => chat.id === chatId);
  const initialWorkflowSteps = currentChat?.steps as any[] || [];

  const handleSendMessage = async (content: string, type: 'text_message' | 'code_run' = 'text_message') => {
    if (!chatId) return;
    
    setSending(true);
    try {
      // If it's a code run, include the workflow user inputs
      const userInputs = type === 'code_run' ? workflowUserInputs : undefined;
      
      // Send user message with the specified type and user inputs if applicable
      await sendMessage(content, 'user', type, userInputs);
    } finally {
      setSending(false);
    }
  };

  // Track workflow user inputs from the Workflow component
  const handleWorkflowInputChange = (inputs: any) => {
    setWorkflowUserInputs(inputs);
  };

  if (!chatId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Select a chat or create a new one to start messaging</p>
      </div>
    );
  }

  // For smaller screens, use tabs to switch between views
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="md:hidden border-b">
        <Tabs defaultValue="chat" value={activeView} onValueChange={(value) => setActiveView(value as 'chat' | 'workflow')}>
          <TabsList className="w-full">
            <TabsTrigger value="chat" className="flex-1 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex-1 flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Workflow
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile view (tabs) */}
      <div className="md:hidden flex-1 overflow-hidden">
        {activeView === 'chat' ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <MessageList dataState={dataState} loading={loading} />
            <MessageInput onSendMessage={handleSendMessage} disabled={sending || !chatId} />
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <Workflow 
              steps={initialWorkflowSteps} 
              chatId={chatId} 
              onInputChange={handleWorkflowInputChange}
            />
          </div>
        )}
      </div>

      {/* Desktop view (resizable panels) */}
      <div className="hidden md:block flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <MessageList dataState={dataState} loading={loading} />
              <MessageInput onSendMessage={handleSendMessage} disabled={sending || !chatId} />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={40} minSize={30}>
            <Workflow 
              steps={initialWorkflowSteps} 
              chatId={chatId} 
              onInputChange={handleWorkflowInputChange}
            />
          </div>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
