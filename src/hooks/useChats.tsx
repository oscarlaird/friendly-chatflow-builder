
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat, CodeRewritingStatus, Message, CodeRunEvent, BrowserEvent } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Global state cache to maintain consistency across components
interface DataCache {
  chats: Record<string, Chat>;
  messages: Record<string, Message & { coderunEvents: string[] }>;
  coderunEvents: Record<string, CodeRunEvent & { browserEvents: string[] }>;
  browserEvents: Record<string, BrowserEvent>;
  lastFetched: number | null;
}

const dataCache: DataCache = {
  chats: {},
  messages: {},
  coderunEvents: {},
  browserEvents: {},
  lastFetched: null
};

// Single global channel reference to avoid multiple subscriptions
let globalChannelRef: any = null;
let subscriberCount = 0;

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>(Object.values(dataCache.chats));
  const [loading, setLoading] = useState(dataCache.lastFetched === null);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  // Fetch all chats for the user and set up realtime subscription
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      dataCache.chats = {};
      dataCache.messages = {};
      dataCache.coderunEvents = {};
      dataCache.browserEvents = {};
      dataCache.lastFetched = null;
      return;
    }
    
    const fetchChats = async () => {
      // Skip fetching if we have recent data (within last 30 seconds)
      const shouldFetch = 
        dataCache.lastFetched === null || 
        Date.now() - dataCache.lastFetched > 30000;
        
      if (!shouldFetch && Object.keys(dataCache.chats).length > 0) {
        setChats(Object.values(dataCache.chats));
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Update the normalized cache with the fresh data
        const chatMap: Record<string, Chat> = {};
        (data || []).forEach(chat => {
          chatMap[chat.id] = chat;
        });
        
        dataCache.chats = chatMap;
        dataCache.lastFetched = Date.now();
        setChats(Object.values(dataCache.chats));
      } catch (error: any) {
        toast({
          title: 'Error fetching chats',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchChats();

    // Set up realtime subscription using a shared global channel
    subscriberCount++;
    
    if (!globalChannelRef) {
      const channelName = `global-realtime-channel-${Date.now()}`;
      
      console.log('Creating new global realtime subscription channel');
      
      globalChannelRef = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chats' },
          (payload) => {
            console.log('Chats realtime update:', payload);
            
            // Update normalized cache
            if (payload.eventType === 'INSERT') {
              dataCache.chats[payload.new.id] = payload.new as Chat;
            } 
            else if (payload.eventType === 'UPDATE') {
              dataCache.chats[payload.new.id] = { 
                ...dataCache.chats[payload.new.id], 
                ...payload.new as Chat 
              };
            } 
            else if (payload.eventType === 'DELETE') {
              delete dataCache.chats[payload.old.id];
            }
            
            // Update all subscribers
            setChats(Object.values(dataCache.chats));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          (payload) => {
            console.log('Messages realtime update:', payload);
            
            // Update normalized cache for messages
            if (payload.eventType === 'INSERT') {
              const newMessage = payload.new as Message;
              dataCache.messages[newMessage.id] = {
                ...newMessage,
                coderunEvents: []
              };
            } 
            else if (payload.eventType === 'UPDATE') {
              const updatedMessage = payload.new as Message;
              dataCache.messages[updatedMessage.id] = { 
                ...dataCache.messages[updatedMessage.id], 
                ...updatedMessage,
              };
            } 
            else if (payload.eventType === 'DELETE') {
              delete dataCache.messages[payload.old.id];
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'coderun_events' },
          (payload) => {
            console.log('CodeRun events realtime update:', payload);
            
            // Update normalized cache for coderun events
            if (payload.eventType === 'INSERT') {
              const newEvent = payload.new as CodeRunEvent;
              dataCache.coderunEvents[newEvent.id] = {
                ...newEvent,
                browserEvents: []
              };
              
              // Update the parent message's coderunEvents array
              if (newEvent.message_id && dataCache.messages[newEvent.message_id]) {
                if (!dataCache.messages[newEvent.message_id].coderunEvents.includes(newEvent.id)) {
                  dataCache.messages[newEvent.message_id].coderunEvents.push(newEvent.id);
                }
              }
            } 
            else if (payload.eventType === 'UPDATE') {
              const updatedEvent = payload.new as CodeRunEvent;
              dataCache.coderunEvents[updatedEvent.id] = { 
                ...dataCache.coderunEvents[updatedEvent.id], 
                ...updatedEvent 
              };
            } 
            else if (payload.eventType === 'DELETE') {
              // Remove this event from its parent message's coderunEvents array
              const deletedEvent = payload.old as CodeRunEvent;
              if (deletedEvent.message_id && dataCache.messages[deletedEvent.message_id]) {
                dataCache.messages[deletedEvent.message_id].coderunEvents = 
                  dataCache.messages[deletedEvent.message_id].coderunEvents.filter(
                    id => id !== deletedEvent.id
                  );
              }
              
              delete dataCache.coderunEvents[payload.old.id];
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'browser_events' },
          (payload) => {
            console.log('Browser events realtime update:', payload);
            
            // Update normalized cache for browser events
            if (payload.eventType === 'INSERT') {
              const newEvent = payload.new as BrowserEvent;
              dataCache.browserEvents[newEvent.id] = newEvent;
              
              // Update the parent coderun event's browserEvents array
              if (newEvent.coderun_event_id && dataCache.coderunEvents[newEvent.coderun_event_id]) {
                if (!dataCache.coderunEvents[newEvent.coderun_event_id].browserEvents.includes(newEvent.id)) {
                  dataCache.coderunEvents[newEvent.coderun_event_id].browserEvents.push(newEvent.id);
                }
              }
            } 
            else if (payload.eventType === 'UPDATE') {
              const updatedEvent = payload.new as BrowserEvent;
              dataCache.browserEvents[updatedEvent.id] = { 
                ...dataCache.browserEvents[updatedEvent.id], 
                ...updatedEvent 
              };
            } 
            else if (payload.eventType === 'DELETE') {
              // Remove this event from its parent coderun event's browserEvents array
              const deletedEvent = payload.old as BrowserEvent;
              if (deletedEvent.coderun_event_id && dataCache.coderunEvents[deletedEvent.coderun_event_id]) {
                dataCache.coderunEvents[deletedEvent.coderun_event_id].browserEvents = 
                  dataCache.coderunEvents[deletedEvent.coderun_event_id].browserEvents.filter(
                    id => id !== deletedEvent.id
                  );
              }
              
              delete dataCache.browserEvents[payload.old.id];
            }
          }
        )
        .subscribe();
    }
    
    channelRef.current = globalChannelRef;

    return () => {
      subscriberCount--;
      
      // Only remove the channel when the last subscriber unsubscribes
      if (subscriberCount === 0 && globalChannelRef) {
        console.log('Removing global realtime subscription channel');
        supabase.removeChannel(globalChannelRef);
        globalChannelRef = null;
      }
    };
  }, [user]);

  // Create a new chat
  const createChat = async (title: string) => {
    if (!user) return null;
    
    try {
      const newChat = {
        title: title || 'New Chat',
        uid: user.id,
        is_example: false
      };
      
      const { data, error } = await supabase
        .from('chats')
        .insert(newChat)
        .select()
        .single();

      if (error) throw error;
      
      // The realtime subscription will handle the state update
      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating chat',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Delete a chat
  const deleteChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;
      
      // The realtime subscription will handle the state update
    } catch (error: any) {
      toast({
        title: 'Error deleting chat',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Update a chat's title
  const updateChatTitle = async (chatId: string, title: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId);

      if (error) throw error;
      
      // The realtime subscription will handle the state update
    } catch (error: any) {
      toast({
        title: 'Error updating chat',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Expose the data in the required format
  return {
    chats,
    loading,
    createChat,
    deleteChat,
    updateChatTitle,
    // Expose the normalized data structure for components that need it
    data: {
      chats: dataCache.chats,
      messages: dataCache.messages,
      coderunEvents: dataCache.coderunEvents,
      browserEvents: dataCache.browserEvents
    }
  };
};

// Helper utility to determine code rewriting status
export const getCodeRewritingStatus = (chat: Chat | undefined): CodeRewritingStatus => {
  if (!chat) return 'thinking';
  
  if (chat.requires_code_rewrite === null) {
    return 'thinking';
  } else if (chat.requires_code_rewrite === false) {
    return 'done';
  } else {
    // requires_code_rewrite is true
    return chat.code_approved ? 'done' : 'rewriting_code';
  }
};

// Hook to subscribe to a specific chat's updates
export const useSelectedChat = (chatId: string | null) => {
  const [loading, setLoading] = useState(false);
  const [codeRewritingStatus, setCodeRewritingStatus] = useState<CodeRewritingStatus>('thinking');
  const { chats, data } = useChats();
  
  // Find the selected chat from the normalized data structure
  const selectedChat = chatId ? data.chats[chatId] || null : null;

  // Update code rewriting status whenever the selected chat changes
  useEffect(() => {
    if (!selectedChat) {
      setCodeRewritingStatus('thinking');
      return;
    }
    
    // Update code rewriting status based on the selected chat
    setCodeRewritingStatus(getCodeRewritingStatus(selectedChat));
  }, [selectedChat]);

  // Get related messages for this chat
  const getMessagesForChat = (chatId: string | null) => {
    if (!chatId) return [];
    
    return Object.values(data.messages)
      .filter(message => message.chat_id === chatId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  // Get coderun events for a message
  const getCodeRunEventsForMessage = (messageId: string) => {
    return data.messages[messageId]?.coderunEvents.map(eventId => data.coderunEvents[eventId]) || [];
  };

  // Get browser events for a coderun event
  const getBrowserEventsForCodeRun = (codeRunId: string) => {
    return data.coderunEvents[codeRunId]?.browserEvents.map(eventId => data.browserEvents[eventId]) || [];
  };

  return {
    selectedChat,
    loading,
    codeRewritingStatus,
    getMessagesForChat,
    getCodeRunEventsForMessage,
    getBrowserEventsForCodeRun
  };
};
