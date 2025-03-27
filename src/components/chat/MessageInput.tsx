
import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text_message' | 'code_run', userInputs?: any) => Promise<void>;
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

  const handleSubmit = async (e: React.FormEvent, type: 'text_message' | 'code_run' = 'text_message') => {
    e.preventDefault();
    
    if (!message.trim() || isSubmitting || disabled) return;
    
    setIsSubmitting(true);
    
    try {
      await onSendMessage(message, type);
      setMessage('');
    } finally {
      setIsSubmitting(false);
      
      // Re-focus the textarea after sending
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
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
        <div className="flex flex-col gap-2">
          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim() || disabled || isSubmitting}
            className="h-7 w-7"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={!message.trim() || disabled || isSubmitting}
            className="h-7 w-7"
            onClick={(e) => handleSubmit(e, 'code_run')}
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line, or click Play to run code
      </p>
    </form>
  );
};
