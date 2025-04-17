
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Workflow } from '../workflow/Workflow';
import { useChats } from '@/hooks/useChats';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSelectedChat } from '@/hooks/useChats';
import { useWindowMessages } from '@/hooks/useWindowMessages';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  chatId: string | null;
}

export const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const { dataState, loading, sendMessage } = useMessages(chatId);
  const { chats } = useChats();
  const { selectedChat } = useSelectedChat(chatId || '');
  const [sending, setSending] = useState(false);
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<'chat' | 'workflow'>(isMobile ? 'chat' : 'chat');
  const [pastRunMessageId, setPastRunMessageId] = useState<string | null>(null);

  // Initialize the window message handler
  useWindowMessages();

  // Find the current chat in the chats array to get initial steps
  const currentChat = chats.find(chat => chat.id === chatId);
  const initialWorkflowSteps = currentChat?.steps as any[] || [];

  // Handle viewing past run
  const handleViewPastRun = (messageId: string) => {
    setPastRunMessageId(messageId);
    if (isMobile) {
      setActiveView('workflow');
    }
  };

  const handleClosePastRun = () => {
    setPastRunMessageId(null);
  };

  const handleSendMessage = async (content: string, type: 'text_message' | 'code_run' = 'text_message') => {
    if (!chatId) return;
    
    setSending(true);
    try {
      // Send user message with the specified type
      await sendMessage(content, 'user', type);
    } finally {
      setSending(false);
    }
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
    <div className="flex flex-col h-full overflow-hidden w-full">
      {/* Remove the top header with back and workflow name */}
      
      <div className="md:hidden border-b">
        <Tabs defaultValue={activeView} value={activeView} onValueChange={(value) => setActiveView(value as 'chat' | 'workflow')}>
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

      {/* Mobile view */}
      <div className="md:hidden flex-1 overflow-hidden w-full">
        {activeView === 'chat' ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
            <MessageList 
              dataState={dataState} 
              loading={loading} 
              onViewPastRun={handleViewPastRun}
            />
            <MessageInput onSendMessage={handleSendMessage} disabled={sending || !chatId} />
          </div>
        ) : (
          <div className="h-full overflow-hidden w-full">
            <Workflow 
              initialSteps={initialWorkflowSteps} 
              chatId={chatId}
              pastRunMessageId={pastRunMessageId}
              onClosePastRun={handleClosePastRun}
              hideHeader={true}
            />
          </div>
        )}
      </div>

      {/* Desktop view - Adjusted to give more space to workflow */}
      <div className="hidden md:block flex-1 overflow-hidden w-full">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={30} minSize={20} className="text-sm"> 
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
              <MessageList 
                dataState={dataState} 
                loading={loading}
                onViewPastRun={handleViewPastRun}
              />
              <MessageInput onSendMessage={handleSendMessage} disabled={sending || !chatId} />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={70} minSize={40}> 
            <Workflow 
              initialSteps={initialWorkflowSteps} 
              chatId={chatId}
              pastRunMessageId={pastRunMessageId}
              onClosePastRun={handleClosePastRun}
              hideHeader={true}
              className="flowchart-style" 
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

