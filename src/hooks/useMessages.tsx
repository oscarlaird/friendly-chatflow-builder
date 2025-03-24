
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataState, Message, CoderunEvent, BrowserEvent } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useMessages = (chatId: string | null) => {
  const [dataState, setDataState] = useState<DataState>({
    messages: {},
    coderunEvents: {},
    browserEvents: {},
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Helper function to normalize data into our state structure
  const normalizeData = (messagesData: any[], codeRunEventsData: any[] = [], browserEventsData: any[] = []) => {
    const newState: DataState = {
      messages: {},
      coderunEvents: {},
      browserEvents: {},
    };

    // Process messages
    messagesData.forEach((message) => {
      newState.messages[message.id] = {
        ...message,
        coderunEvents: [] as string[],
      };
    });

    // Process coderun events and link to messages
    codeRunEventsData.forEach((event) => {
      newState.coderunEvents[event.id] = {
        ...event,
        browserEvents: [] as string[],
      };

      // Link this event to its parent message
      if (newState.messages[event.message_id]) {
        newState.messages[event.message_id].coderunEvents.push(event.id);
      }
    });

    // Process browser events and link to coderun events
    browserEventsData.forEach((event) => {
      newState.browserEvents[event.id] = event;

      // Link this event to its parent coderun event
      if (newState.coderunEvents[event.coderun_event_id]) {
        newState.coderunEvents[event.coderun_event_id].browserEvents.push(event.id);
      }
    });

    return newState;
  };

  // Fetch messages for the current chat
  const fetchMessages = async () => {
    if (!user || !chatId) return;
    
    try {
      setLoading(true);
      
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at');

      if (messagesError) throw messagesError;

      // Fetch coderun events for all messages
      const messageIds = messagesData.map(msg => msg.id);
      
      let codeRunEventsData: any[] = [];
      let browserEventsData: any[] = [];
      
      if (messageIds.length > 0) {
        const { data: codeRunData, error: codeRunError } = await supabase
          .from('coderun_events')
          .select('*')
          .in('message_id', messageIds);

        if (codeRunError) throw codeRunError;
        codeRunEventsData = codeRunData || [];

        // Fetch browser events for all coderun events
        const codeRunIds = codeRunEventsData.map(event => event.id);
        
        if (codeRunIds.length > 0) {
          const { data: browserData, error: browserError } = await supabase
            .from('browser_events')
            .select('*')
            .in('coderun_event_id', codeRunIds);

          if (browserError) throw browserError;
          browserEventsData = browserData || [];
        }
      }

      // Normalize the data into our nested structure
      const normalized = normalizeData(messagesData, codeRunEventsData, browserEventsData);
      setDataState(normalized);
    } catch (error: any) {
      toast({
        title: 'Error fetching messages',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new message
  const sendMessage = async (content: string, role: 'user' | 'assistant' = 'user') => {
    if (!user || !chatId) return null;
    
    try {
      const newMessage = {
        chat_id: chatId,
        role,
        content,
        type: 'text_message' as const, // Using a const assertion to match the enum type
        uid: user.id,
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state with the new message
      setDataState(prevState => {
        const newState = { ...prevState };
        newState.messages[data.id] = {
          ...data,
          coderunEvents: [] as string[],
        };
        return newState;
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Error sending message',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !chatId) return;

    // Subscribe to message changes
    const messageChannel = supabase
      .channel('schema-db-changes-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          // Add new message to state
          const newMessage = payload.new as Message;
          setDataState(prevState => {
            const newState = { ...prevState };
            newState.messages[newMessage.id] = {
              ...newMessage,
              coderunEvents: [] as string[],
            };
            return newState;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          // Update existing message
          const updatedMessage = payload.new as Message;
          setDataState(prevState => {
            const newState = { ...prevState };
            if (newState.messages[updatedMessage.id]) {
              // Preserve the coderunEvents references
              const coderunEvents = newState.messages[updatedMessage.id].coderunEvents || [];
              newState.messages[updatedMessage.id] = {
                ...updatedMessage,
                coderunEvents,
              };
            }
            return newState;
          });
        }
      )
      .subscribe();

    // Subscribe to coderun events
    const coderunChannel = supabase
      .channel('schema-db-changes-coderun')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'coderun_events' },
        (payload) => {
          const newEvent = payload.new as CoderunEvent;
          // Only process if the message is in our current chat
          if (newEvent.message_id && dataState.messages[newEvent.message_id]) {
            setDataState(prevState => {
              const newState = { ...prevState };
              
              // Add the new coderun event
              newState.coderunEvents[newEvent.id] = {
                ...newEvent,
                browserEvents: [] as string[],
              };
              
              // Link to parent message
              if (newState.messages[newEvent.message_id]) {
                const currentEvents = newState.messages[newEvent.message_id].coderunEvents || [];
                newState.messages[newEvent.message_id].coderunEvents = [...currentEvents, newEvent.id];
              }
              
              return newState;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'coderun_events' },
        (payload) => {
          const updatedEvent = payload.new as CoderunEvent;
          setDataState(prevState => {
            const newState = { ...prevState };
            if (newState.coderunEvents[updatedEvent.id]) {
              // Preserve the browserEvents references
              const browserEvents = newState.coderunEvents[updatedEvent.id].browserEvents || [];
              newState.coderunEvents[updatedEvent.id] = {
                ...updatedEvent,
                browserEvents,
              };
            }
            return newState;
          });
        }
      )
      .subscribe();

    // Subscribe to browser events
    const browserChannel = supabase
      .channel('schema-db-changes-browser')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'browser_events' },
        (payload) => {
          const newEvent = payload.new as BrowserEvent;
          setDataState(prevState => {
            const newState = { ...prevState };
            
            // Add the new browser event
            newState.browserEvents[newEvent.id] = newEvent;
            
            // Link to parent coderun event
            if (newState.coderunEvents[newEvent.coderun_event_id]) {
              const currentEvents = newState.coderunEvents[newEvent.coderun_event_id].browserEvents || [];
              newState.coderunEvents[newEvent.coderun_event_id].browserEvents = [...currentEvents, newEvent.id];
            }
            
            return newState;
          });
        }
      )
      .subscribe();

    // Fetch initial messages
    fetchMessages();

    // Cleanup
    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(coderunChannel);
      supabase.removeChannel(browserChannel);
    };
  }, [user, chatId]);

  return {
    dataState,
    loading,
    sendMessage,
    refreshMessages: fetchMessages,
  };
};
