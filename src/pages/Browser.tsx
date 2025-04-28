
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';

const Browser = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const { user } = useAuth();
  
  const handleLinkedInConnect = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      // Send feedback to the database
      const { error } = await supabase.from('feedback').insert({
        uid: user.id,
        type: 'linkedin_loggedin',
        content: 'User initiated LinkedIn connection process for Lightning conference'
      });

      if (error) throw error;
      
      // Show success message
      toast.success('Process initiated successfully');
      setIsDone(true);
    } catch (error) {
      console.error('Error logging LinkedIn action:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="bg-primary text-white p-4 shadow-md">
          <div className="container mx-auto">
            <div className="flex flex-col space-y-4">
              <h1 className="text-xl font-bold">LinkedIn Connection Agent</h1>
              
              {!isDone ? (
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="mb-4">
                    Hey {user?.email?.split('@')[0] || 'there'}, once you have logged into LinkedIn click the button below and our agent will 
                    start working on your behalf to send connect requests to all attendees of the Lightning conference.
                  </p>
                  <Button 
                    onClick={handleLinkedInConnect} 
                    disabled={isProcessing}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    {isProcessing ? 'Processing...' : 'Start LinkedIn Connect Process'}
                  </Button>
                </div>
              ) : (
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="mb-2">
                    Thank you! You can close this window and our agent will work on this and will send you an email once we have gone through all attendees of the conference.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Iframe container */}
        <div className="flex-1">
          <iframe 
            src="https://browser.macroagents.ai" 
            className="w-full h-full border-0"
            title="MacroAgents Browser"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </Layout>
  );
};

export default Browser;
