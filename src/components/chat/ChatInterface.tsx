
import { useEffect } from 'react';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { useMessages } from '@/hooks/useMessages';
import { useParams } from 'react-router-dom';

export const ChatInterface = ({ chatId }: { chatId: string }) => {
  const { dataState, loading, sendMessage, refreshMessages } = useMessages(chatId);

  // Make sure to scroll to bottom when chat ID changes
  useEffect(() => {
    // Force scroll to bottom when the chat changes
    const scrollToBottom = () => {
      const messageEnd = document.getElementById('message-end');
      if (messageEnd) {
        messageEnd.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    };
    
    // Attempt multiple times to ensure it scrolls after data loads
    scrollToBottom();
    const timeouts = [
      setTimeout(scrollToBottom, 100),
      setTimeout(scrollToBottom, 300),
      setTimeout(scrollToBottom, 600),
      setTimeout(scrollToBottom, 1000),
    ];
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [chatId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <MessageList dataState={dataState} loading={loading} />
      </div>
      <MessageInput 
        onSendMessage={sendMessage} 
        disabled={loading}
      />
    </div>
  );
};
