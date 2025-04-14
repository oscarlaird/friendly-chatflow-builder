
import { useState, useEffect } from 'react';
import { useOAuthConnections } from '@/hooks/useOAuthConnections';
import { supabase } from '@/integrations/supabase/client';
import { APP_CONFIG } from '@/hooks/useOAuthFlow';

export function useRequiredApps(chatId: string | null) {
  const [requiredApps, setRequiredApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { connectedApps, isAppConnected } = useOAuthConnections();
  
  // Fetch the required apps for this workflow from the chat
  useEffect(() => {
    if (!chatId) {
      setRequiredApps([]);
      setLoading(false);
      return;
    }
    
    const fetchRequiredApps = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('chats')
          .select('apps')
          .eq('id', chatId)
          .single();
          
        if (error) throw error;
        
        // Set the required apps or empty array if none
        setRequiredApps(data?.apps || []);
      } catch (error) {
        console.error('Error fetching required apps:', error);
        setRequiredApps([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequiredApps();
  }, [chatId]);
  
  // Calculate which required apps are not connected
  const missingConnections = requiredApps.filter(app => !isAppConnected(app));
  
  // Check if all required apps are connected
  const allAppsConnected = missingConnections.length === 0;
  
  return {
    requiredApps,
    missingConnections,
    allAppsConnected,
    loading
  };
}
