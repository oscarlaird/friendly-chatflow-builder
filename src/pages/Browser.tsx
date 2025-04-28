
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
  
  const handleConnect = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      // Send feedback to the database
      const { error } = await supabase.from('feedback').insert({
        uid: user.id,
        type: 'linkedin_loggedin',
        content: 'User initiated connection process'
      });

      if (error) throw error;
      
      // Show success message
      toast.success('Process initiated successfully');
      setIsDone(true);
    } catch (error) {
      console.error('Error logging action:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Shorter top bar */}
        <div className="bg-primary text-white py-2 px-4 shadow-md">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-base font-medium">Browser Connection</h1>
              
              {!isDone ? (
                <Button 
                  onClick={handleConnect} 
                  disabled={isProcessing}
                  className="bg-white text-primary hover:bg-white/90 text-sm h-8 px-3"
                >
                  {isProcessing ? 'Processing...' : 'Start Process'}
                </Button>
              ) : (
                <span className="text-sm bg-white/10 rounded px-2 py-1">
                  Processing Complete
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Iframe container with 16:9 aspect ratio */}
        <div className="flex-1 relative w-full">
          <div className="absolute inset-0">
            <iframe 
              src="https://browser.macroagents.ai" 
              className="w-full h-full border-0"
              title="Browser Preview"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Browser;
