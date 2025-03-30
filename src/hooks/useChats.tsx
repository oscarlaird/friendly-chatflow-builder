import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat, CodeRewritingStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Cache for chats data to prevent redundant fetches
const chatsCache: {
  data: Chat[];
  lastFetched: number | null;
} = {
  data: [],
  lastFetched: null
};

// Single global channel reference to avoid multiple subscriptions
let globalChannelRef: any = null;
let subscriberCount = 0;

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>(chatsCache.data);
  const [loading, setLoading] = useState(chatsCache.lastFetched === null);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  // Fetch all chats for the user and set up realtime subscription
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      chatsCache.data = [];
      return;
    }
    
    const fetchChats = async () => {
      // Skip fetching if we have recent data (within last 30 seconds)
      const shouldFetch = 
        chatsCache.lastFetched === null || 
        Date.now() - chatsCache.lastFetched > 30000;
        
      if (!shouldFetch && chatsCache.data.length > 0) {
        setChats(chatsCache.data);
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

        chatsCache.data = data || [];
        chatsCache.lastFetched = Date.now();
        setChats(chatsCache.data);
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
      const channelName = `chats-global-channel-${Date.now()}`;
      
      console.log('Creating new global chats subscription channel');
      
      globalChannelRef = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chats' },
          (payload) => {
            console.log('Chats realtime update:', payload);
            
            // Update local cache
            if (payload.eventType === 'INSERT') {
              chatsCache.data = [payload.new as Chat, ...chatsCache.data];
            } 
            else if (payload.eventType === 'UPDATE') {
              chatsCache.data = chatsCache.data.map(chat => 
                chat.id === payload.new.id ? { ...chat, ...payload.new as Chat } : chat
              );
            } 
            else if (payload.eventType === 'DELETE') {
              chatsCache.data = chatsCache.data.filter(chat => chat.id !== payload.old.id);
            }
            
            // Update all subscribers
            setChats([...chatsCache.data]);
          }
        )
        .subscribe();
    }
    
    channelRef.current = globalChannelRef;

    return () => {
      subscriberCount--;
      
      // Only remove the channel when the last subscriber unsubscribes
      if (subscriberCount === 0 && globalChannelRef) {
        console.log('Removing global chats subscription channel');
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

  return {
    chats,
    loading,
    createChat,
    deleteChat,
    updateChatTitle,
  };
};

// Helper utility to determine code rewriting status
export const getCodeRewritingStatus = (chat: Chat | undefined): CodeRewritingStatus => {
  if (!chat) return 'thinking';
  
  // Log the values for debugging
  console.log(`Chat ${chat.id} rewriting status:`, { 
    requires_code_rewrite: chat.requires_code_rewrite, 
    code_approved: chat.code_approved 
  });
  
  if (chat.requires_code_rewrite === null) {
    return 'thinking';
  } else if (chat.requires_code_rewrite === false) {
    return 'done';
  } else {
    // requires_code_rewrite is true
    return chat.code_approved ? 'done' : 'rewriting_code';
  }
};

// Simplified hook to subscribe to a specific chat's updates
export const useSelectedChat = (chatId: string | null) => {
  const [codeRewritingStatus, setCodeRewritingStatus] = useState<CodeRewritingStatus>('thinking');
  const { chats } = useChats();
  
  // Find the selected chat from the chats array
  const selectedChat = chatId ? chats.find(chat => chat.id === chatId) || null : null;

  // Update code rewriting status whenever the selected chat changes
  useEffect(() => {
    if (!selectedChat) {
      setCodeRewritingStatus('thinking');
      return;
    }
    
    const status = getCodeRewritingStatus(selectedChat);
    console.log(`Updated status for chat ${selectedChat.id}:`, status);
    setCodeRewritingStatus(status);
  }, [selectedChat]);

  return {
    selectedChat,
    codeRewritingStatus
  };
};
