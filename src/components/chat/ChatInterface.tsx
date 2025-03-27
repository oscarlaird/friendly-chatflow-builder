
import { useState, useEffect } from 'react';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { Workflow } from '../workflow/Workflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMessages } from '@/hooks/useMessages';
import { useSelectedChat } from '@/hooks/useChats';

interface ChatInterfaceProps {
  chatId: string | null;
}

export const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const { dataState, loading, sendMessage, updateMessage } = useMessages(chatId);
  const { selectedChat, codeRewritingStatus } = useSelectedChat(chatId);
  
  // Default workflow steps for empty state
  const defaultSteps = [
    {
      description: 'Empty workflow',
      function_name: 'empty',
      input: {},
      output: {},
      requires_browser: false
    }
  ];

  // Reset to chat tab when changing chats
  useEffect(() => {
    setActiveTab('chat');
  }, [chatId]);

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4">
          <TabsList className="h-10 w-full justify-start">
            <TabsTrigger value="chat" className="data-[state=active]:bg-accent">
              Chat
            </TabsTrigger>
            <TabsTrigger value="workflow" className="data-[state=active]:bg-accent">
              Workflow
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mt-0 p-0">
          <div className="flex-1 overflow-auto">
            <MessageList dataState={dataState} loading={loading} updateMessage={updateMessage} />
          </div>
          <div className="p-4 border-t">
            <MessageInput chatId={chatId} onSendMessage={sendMessage} />
          </div>
        </TabsContent>
        
        <TabsContent value="workflow" className="flex-1 overflow-hidden mt-0 p-0">
          <Workflow 
            steps={selectedChat?.steps || defaultSteps} 
            chatId={chatId} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
