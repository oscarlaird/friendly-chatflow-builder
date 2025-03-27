
import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Workflow } from '../workflow/Workflow';
import { useChats } from '@/hooks/useChats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, GitBranch } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInterfaceProps {
  chatId: string | null;
}

export const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const { dataState, loading, sendMessage } = useMessages(chatId);
  const { chats } = useChats();
  const [sending, setSending] = useState(false);
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<'chat' | 'workflow'>(isMobile ? 'workflow' : 'chat');

  // Find the current chat in the chats array to get initial steps
  const currentChat = chats.find(chat => chat.id === chatId);
  const initialWorkflowSteps = currentChat?.steps as any[] || [];

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
    <div className="flex flex-col h-full overflow-hidden">
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
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
