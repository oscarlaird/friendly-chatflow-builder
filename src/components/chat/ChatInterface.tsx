import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { IntroMessage } from '@/components/chat/IntroMessage';
import { MillCapabilities } from '@/components/chat/MillCapabilities';
import { WorkflowDisplay } from '@/components/workflow/WorkflowDisplay';
import { useChats } from '@/hooks/useChats';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'next/navigation';

interface ChatInterfaceProps {
  chatId: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId }) => {
  const { user } = useAuth();
  const { dataState, loading, sendMessage, refreshMessages } = useMessages(chatId);
  const { chats, setChats, createChat, codeRewritingStatus } = useChats();
  const [isNewChat, setIsNewChat] = useState(false);
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const router = useRouter();
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Function to handle the selection of a capability from MillCapabilities
  const handleSelectCapability = async (message: string) => {
    if (sendMessage) {
      await sendMessage(message, 'user', 'text_message');
    }
  };

  // Function to handle sending a new message
  const handleSendMessage = async (
    content: string, 
    type: 'text_message' | 'code_run' = 'text_message',
    userInputs?: any
  ) => {
    if (!chatId) {
      // If there's no chatId, create a new chat
      const newChat = await createChat(content);
      if (newChat?.id) {
        // After creating the chat, send the message
        await sendMessage(content, type, userInputs);
        setIsNewChat(true);
      } else {
        toast({
          title: 'Error creating chat',
          description: 'Failed to create a new chat. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      // If there's an existing chatId, send the message directly
      await sendMessage(content, type, userInputs);
    }
  };
  
  // Function to handle viewing a past run
  const handleViewPastRun = (messageId: string) => {
    setSelectedMessageId(messageId);
    setIsWorkflowVisible(true);
  };
  
  // Function to close the workflow display
  const handleCloseWorkflow = () => {
    setIsWorkflowVisible(false);
    setSelectedMessageId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        <MessageList 
          dataState={dataState} 
          loading={loading}
          onViewPastRun={handleViewPastRun}
        />
        <div ref={bottomRef} />
      </div>

      {/* Mill Capabilities */}
      {chatId && (
        <MillCapabilities onSelectCapability={handleSelectCapability} />
      )}

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={codeRewritingStatus === 'thinking'} />
      
      {/* Workflow Display */}
      {isWorkflowVisible && selectedMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[80vh] overflow-auto">
            <WorkflowDisplay messageId={selectedMessageId} onClose={handleCloseWorkflow} />
          </div>
        </div>
      )}
    </div>
  );
};
