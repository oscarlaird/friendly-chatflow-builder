import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useWindowMessages() {
  useEffect(() => {
    const handleWindowMessage = async (event: MessageEvent) => {
      if (!event.data) return;
      
      // Handle window closed by user event
      if (event.data.type === "WINDOW_CLOSED_BY_USER" && event.data.message_id) {
        console.log("App received WINDOW_CLOSED_BY_USER for message_id:", event.data.message_id);
        
        try {
          // Update the message's code_run_state in the database
          const { error } = await supabase
            .from('messages')
            .update({ code_run_state: 'window_closed' })
            .eq('id', event.data.message_id);
            
          if (error) {
            console.error("Error updating message code_run_state:", error);
          } else {
            console.log("Successfully updated message code_run_state to window_closed");
          }
        } catch (err) {
          console.error("Error handling window closed event:", err);
        }
      }
      
      // Add other window message handlers here
    };
    
    // Add the event listener
    window.addEventListener('message', handleWindowMessage);
    
    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, []);
} 