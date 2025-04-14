
import { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (content: string, role?: 'user' | 'assistant', type?: 'text_message' | 'code_run' | 'screen_recording', userInputs?: any) => Promise<any>;
  disabled?: boolean;
}

export const MessageInput = ({ onSendMessage, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    // Try to find the message-end element and scroll to it
    const messageEnd = document.getElementById('message-end');
    if (messageEnd) {
      messageEnd.scrollIntoView({ behavior: 'smooth', block: 'end' });
      
      // Attempt additional scrolls with delays to ensure it works
      setTimeout(() => {
        messageEnd.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 100);
      
      setTimeout(() => {
        messageEnd.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 300);
    }
    
    // Fallback: directly scroll the message container
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  };

  const handleSubmit = async (e: React.FormEvent, type: 'text_message' | 'code_run' = 'text_message') => {
    e.preventDefault();
    
    if ((!message.trim() && type === 'text_message') || isSubmitting || disabled) return;
    
    setIsSubmitting(true);
    
    try {
      await onSendMessage(message, 'user', type);
      setMessage('');
      
      // Scroll to bottom after sending a message
      scrollToBottom();
    } finally {
      setIsSubmitting(false);
      
      // Re-focus the textarea after sending
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      
      // One final scroll attempt after a delay
      setTimeout(scrollToBottom, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="p-4 border-t bg-background">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[60px] resize-none"
          disabled={disabled || isSubmitting}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || disabled || isSubmitting}
          className="h-10 w-10"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
};
