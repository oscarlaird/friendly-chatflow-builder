
import { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
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
  const submittingRef = useRef(false); // Use a ref to track submission state

  // Auto-focus the textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent, type: 'text_message' | 'code_run' = 'text_message') => {
    e.preventDefault();
    
    // Check the ref first to prevent multiple submissions
    if (submittingRef.current || (!message.trim() && type === 'text_message') || disabled) {
      return;
    }
    
    // Set both the state and ref
    setIsSubmitting(true);
    submittingRef.current = true;
    
    try {
      await onSendMessage(message, type);
      setMessage('');
    } finally {
      // Introduce a small delay to prevent double submissions
      setTimeout(() => {
        setIsSubmitting(false);
        submittingRef.current = false; // Reset the ref
        
        // Re-focus the textarea after sending
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 300);
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
