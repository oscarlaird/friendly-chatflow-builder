
import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatInterfaceProps {
  chatId: string | null;
}

export const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const { dataState, loading, sendMessage } = useMessages(chatId);
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!chatId) return;
    
    setSending(true);
    try {
      // Send user message
      await sendMessage(content);
      
      // Simulate assistant response for demo purposes
      // In a real app, you'd wait for a real response from your backend
      setTimeout(async () => {
        await sendMessage(`This is a simulated response to: "${content}"`, 'assistant');
      }, 1000);
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

  return (
    <div className="flex flex-col h-full">
      <MessageList dataState={dataState} loading={loading} />
      <MessageInput onSendMessage={handleSendMessage} disabled={sending || !chatId} />
    </div>
  );
};
