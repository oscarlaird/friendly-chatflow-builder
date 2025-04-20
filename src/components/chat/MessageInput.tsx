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
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus the textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    // Cleanup any existing timeouts on unmount
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Focus restoration helper
  const focusTextarea = () => {
    if (textareaRef.current) {
      // Try multiple times with increasing delays to ensure focus is captured
      textareaRef.current.focus();
      
      // First retry after a short delay
      setTimeout(() => {
        if (textareaRef.current && document.activeElement !== textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 50);
      
      // Second retry after a longer delay
      focusTimeoutRef.current = setTimeout(() => {
        if (textareaRef.current && document.activeElement !== textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 300);
    }
  };

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
        
        // Re-focus the textarea after sending using our enhanced focus method
        focusTextarea();
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
    <form onSubmit={(e) => handleSubmit(e)} className="p-4 bg-background ">
      <div className={`flex items-center gap-2 bg-muted rounded-lg px-4 py-2 ${message.split('\n').length > 1 ? 'items-start' : ''}`}>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Try to re-capture focus if the textarea loses it
            setTimeout(() => {
              // Only refocus if no other input element has focus
              if (document.activeElement?.tagName !== "INPUT" && 
                  document.activeElement?.tagName !== "TEXTAREA" &&
                  document.activeElement?.tagName !== "SELECT" &&
                  !isSubmitting) {
                focusTextarea();
              }
            }, 100);
          }}
          placeholder="Build your workflow..."
          className="min-h-[40px] resize-none border-0 bg-transparent p-2 focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{
            maxHeight: `${Math.min(5 * 24, Math.max(30, (message.split('\n').length) * 24))}px`,
            height: `${Math.min(5 * 24, Math.max(30, (message.split('\n').length) * 24))}px`,
            overflow: 'auto'
          }}
          disabled={disabled || isSubmitting}
        />
        <div className="flex items-center gap-1 mt-1">
          <Button 
            type="button" 
            size="icon" 
            variant="ghost"
            className="h-8 w-8 rounded-full"
          >
            {/* <Plus className="h-4 w-4 text-muted-foreground" /> */}
          </Button>
          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim() || disabled || isSubmitting}
            className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
