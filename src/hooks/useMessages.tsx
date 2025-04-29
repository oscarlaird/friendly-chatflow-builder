import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataState, Message, CoderunEvent, BrowserEvent } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useChats } from '@/hooks/useChats';

export const useMessages = (chatId: string | null) => {
  const [dataState, setDataState] = useState<DataState>({
    messages: {},
    coderunEvents: {},
    browserEvents: {},
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { chats } = useChats();
  
  // Use a ref to track if we've already loaded initial data
  const initialDataLoadedRef = useRef(false);
  const channelsRef = useRef<{ [key: string]: any }>({});

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
        const currentEvents = newState.messages[event.message_id].coderunEvents || [];
        if (!currentEvents.includes(event.id)) {
          newState.messages[event.message_id].coderunEvents = [...currentEvents, event.id];
        }
      }
    });

    // Process browser events and link to coderun events
    browserEventsData.forEach((event) => {
      newState.browserEvents[event.id] = event;

      // Link this event to its parent coderun event
      if (newState.coderunEvents[event.coderun_event_id]) {
        const currentEvents = newState.coderunEvents[event.coderun_event_id].browserEvents || [];
        if (!currentEvents.includes(event.id)) {
          newState.coderunEvents[event.coderun_event_id].browserEvents = [...currentEvents, event.id];
        }
      }
    });

    return newState;
  };

  // Fetch messages for the current chat
  const fetchMessages = async () => {
    if (!user || !chatId) return;
    
    // Prevent redundant fetches
    if (initialDataLoadedRef.current && !loading) return;
    
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

        // Fetch browser steps since that's what exists in the schema
        const codeRunIds = codeRunEventsData.map(event => event.id);
        
        if (codeRunIds.length > 0) {
          // Use a more explicit typing approach to avoid excessive type instantiation
          const browserStepsResponse = await supabase
            .from('browser_steps')
            .select('*')
            .in('coderun_event_id', codeRunIds);

          if (browserStepsResponse.error) throw browserStepsResponse.error;
          browserEventsData = browserStepsResponse.data || [];
        }
      }

      // Normalize the data into our nested structure
      const normalized = normalizeData(messagesData, codeRunEventsData, browserEventsData);
      setDataState(normalized);
      initialDataLoadedRef.current = true;
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
  const sendMessage = async (
    content: string, 
    role: 'user' | 'assistant' = 'user',
    type: 'text_message' | 'code_run' | 'screen_recording' = 'text_message',
    userInputs?: any
  ) => {
    if (!user || !chatId) return null;
    
    try {
      // Get the current chat to access its script and steps if creating a code_run message
      let script = undefined;
      let steps = undefined;
      
      if (type === 'code_run') {
        // Find the current chat to get its script and steps
        const currentChat = chats.find(chat => chat.id === chatId);
        if (currentChat) {
          script = currentChat.script;
          steps = currentChat.steps;
        }
      }
      
      const newMessage = {
        chat_id: chatId,
        role,
        content,
        type,
        uid: user.id,
        script,             // Add script from chat if type is code_run
        steps,              // Add steps from chat if type is code_run
        user_inputs: userInputs, // Add user inputs if provided
        code_run_state: type === 'code_run' ? 'running' as const : undefined // Fix: Use as const to specify exact type
      };
      
      console.log("Creating new message with data:", newMessage);
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;
      
      // The message will be added via the subscription, no need to manually update state
      
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

  // Add a new coderun event to its parent message (not used directly anymore, handled by subscription)
  const addCoderunEventToMessage = (newEvent: CoderunEvent) => {
    setDataState(prevState => {
      // Skip if we already have this event
      if (prevState.coderunEvents[newEvent.id]) {
        return prevState;
      }

      const newState = { ...prevState };
      
      // Add the new coderun event
      newState.coderunEvents[newEvent.id] = {
        ...newEvent,
        browserEvents: [] as string[],
      };
      
      // Link to parent message if it exists in our state
      if (newState.messages[newEvent.message_id]) {
        const currentEvents = newState.messages[newEvent.message_id].coderunEvents || [];
        // Only add if it's not already in the array
        if (!currentEvents.includes(newEvent.id)) {
          newState.messages[newEvent.message_id].coderunEvents = [...currentEvents, newEvent.id];
        }
      }
      
      return newState;
    });
  };

  // Add a new browser event to its parent coderun event (not used directly anymore, handled by subscription)
  const addBrowserEventToCoderun = (newEvent: BrowserEvent) => {
    setDataState(prevState => {
      // Skip if we already have this event
      if (prevState.browserEvents[newEvent.id]) {
        return prevState;
      }

      const newState = { ...prevState };
      
      // Add the new browser event
      newState.browserEvents[newEvent.id] = newEvent;
      
      // Link to parent coderun event if it exists in our state
      if (newState.coderunEvents[newEvent.coderun_event_id]) {
        const currentEvents = newState.coderunEvents[newEvent.coderun_event_id].browserEvents || [];
        // Only add if it's not already in the array
        if (!currentEvents.includes(newEvent.id)) {
          newState.coderunEvents[newEvent.coderun_event_id].browserEvents = [...currentEvents, newEvent.id];
        }
      }
      
      return newState;
    });
  };

  // Set up real-time subscriptions
  useEffect(() => {
    // Reset state when chat changes
    if (chatId !== Object.keys(channelsRef.current)[0]) {
      // Reset state and loading flag when chat changes
      setDataState({
        messages: {},
        coderunEvents: {},
        browserEvents: {},
      });
      setLoading(true);
      initialDataLoadedRef.current = false;
      
      // Clean up previous subscriptions
      Object.values(channelsRef.current).forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = {};
    }
    
    if (!user || !chatId) return;
    
    // Fetch initial messages if not already loaded
    if (!initialDataLoadedRef.current) {
      fetchMessages();
    }

    // Only set up subscriptions if we don't already have them for this chat
    if (!channelsRef.current[chatId]) {
      // Subscribe to message changes for the current chat
      const messageChannel = supabase
        .channel(`messages-${chatId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
          (payload) => {
            // Add new message to state
            const newMessage = payload.new as Message;
            console.log("New message received:", newMessage);
            
            setDataState(prevState => {
              // Skip if we already have this message
              if (prevState.messages[newMessage.id]) {
                return prevState;
              }
              
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
            console.log("Message updated:", updatedMessage);
            
            setDataState(prevState => {
              // Only update if we have this message
              if (!prevState.messages[updatedMessage.id]) {
                return prevState;
              }
              
              const newState = { ...prevState };
              // Preserve the coderunEvents references
              const coderunEvents = newState.messages[updatedMessage.id].coderunEvents || [];
              newState.messages[updatedMessage.id] = {
                ...updatedMessage,
                coderunEvents,
              };
              return newState;
            });
          }
        )
        .subscribe();

      // Subscribe to coderun events for the current chat
      const coderunChannel = supabase
        .channel(`coderun-${chatId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'coderun_events', filter: `chat_id=eq.${chatId}` },
          (payload) => {
            const newEvent = payload.new as CoderunEvent;
            console.log("New coderun event received:", newEvent);
            addCoderunEventToMessage(newEvent);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'coderun_events', filter: `chat_id=eq.${chatId}` },
          (payload) => {
            const updatedEvent = payload.new as CoderunEvent;
            console.log("Coderun event updated:", updatedEvent);
            
            setDataState(prevState => {
              // Only update if we have this event
              if (!prevState.coderunEvents[updatedEvent.id]) {
                return prevState;
              }
              
              const newState = { ...prevState };
              // Preserve the browserEvents references
              const browserEvents = newState.coderunEvents[updatedEvent.id].browserEvents || [];
              newState.coderunEvents[updatedEvent.id] = {
                ...updatedEvent,
                browserEvents,
              };
              return newState;
            });
          }
        )
        .subscribe();

      // Subscribe to browser steps for the current chat 
      const browserChannel = supabase
        .channel(`browser-${chatId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'browser_steps', filter: `chat_id=eq.${chatId}` },
          (payload: { new: { id: string; coderun_event_id: string; message_id: string; [key: string]: any } }) => {
            // Use explicit typing for the payload to avoid excessive type instantiation
            const newEvent = payload.new as BrowserEvent;
            console.log("New browser event received:", newEvent);
            addBrowserEventToCoderun(newEvent);
          }
        )
        .subscribe();
        
      // Store channels in the ref
      channelsRef.current = {
        [chatId]: [messageChannel, coderunChannel, browserChannel]
      };
    }

    // Cleanup
    return () => {
      // We'll clean up only when chatId changes, not on every render
    };
  }, [user, chatId, chats]);

  return {
    dataState,
    loading,
    sendMessage,
    refreshMessages: fetchMessages,
  };
};
