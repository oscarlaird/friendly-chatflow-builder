
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, AlertTriangle } from 'lucide-react';

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'issue' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user || !feedbackType || !feedbackText.trim()) return;

    try {
      const { error } = await supabase.from('feedback').insert({
        uid: user.id,
        type: feedbackType,
        content: feedbackText
      });

      if (error) throw error;

      // Show toast notification
      toast({
        title: 'Feedback Sent',
        description: feedbackType === 'feedback' 
          ? 'We appreciate your feedback and will review to add credits.' 
          : 'Our founders will be in touch within 5 minutes to resolve your issue.',
        variant: 'default'
      });

      // Reset state
      setFeedbackText('');
      setFeedbackType(null);
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      ) : (
        <div className="bg-background border rounded-lg p-4 shadow-lg w-80 space-y-4">
          <div className="flex space-x-2">
            <Button 
              variant={feedbackType === 'feedback' ? 'default' : 'outline'}
              onClick={() => setFeedbackType('feedback')}
              className="flex-1"
            >
              Feedback
            </Button>
            <Button 
              variant={feedbackType === 'issue' ? 'default' : 'outline'}
              onClick={() => setFeedbackType('issue')}
              className="flex-1"
            >
              Report Issue
            </Button>
          </div>

          {feedbackType && (
            <>
              <Textarea 
                placeholder={
                  feedbackType === 'feedback' 
                    ? 'Share your thoughts...' 
                    : 'Describe the issue in detail...'
                }
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsOpen(false);
                    setFeedbackType(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!feedbackText.trim()}
                >
                  Send
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
