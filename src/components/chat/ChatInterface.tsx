
import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Workflow } from '../workflow/Workflow';
import { useChats } from '@/hooks/useChats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, GitBranch } from 'lucide-react';

interface ChatInterfaceProps {
  chatId: string | null;
}

export const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const { dataState, loading, sendMessage } = useMessages(chatId);
  const { chats } = useChats();
  const [sending, setSending] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'workflow'>('chat');

  const currentChat = chats.find(chat => chat.id === chatId);
  const workflowSteps = currentChat?.steps as any[] || [];

  const handleSendMessage = async (content: string) => {
    if (!chatId) return;
    
    setSending(true);
    try {
      // Send user message
      await sendMessage(content);
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
    <div className="flex flex-col h-full">
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

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Chat Section */}
        <div 
          className={`flex-1 flex flex-col ${
            activeView === 'workflow' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <MessageList dataState={dataState} loading={loading} />
          <MessageInput onSendMessage={handleSendMessage} disabled={sending || !chatId} />
        </div>

        {/* Vertical separator for desktop view */}
        <div className="hidden md:block">
          <Separator orientation="vertical" />
        </div>

        {/* Workflow Section */}
        <div 
          className={`md:w-1/2 flex-shrink-0 overflow-hidden ${
            activeView === 'chat' ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="h-[calc(100vh-180px)] overflow-auto p-4">
            <Workflow steps={workflowSteps} />
          </div>
        </div>
      </div>
    </div>
  );
};
