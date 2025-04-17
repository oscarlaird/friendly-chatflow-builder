
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat, CodeRewritingStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const navigate = useNavigate();

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
            console.log('Chats realtime update received:', payload);
            
            // Enhanced logging for code_rewrite fields
            if (payload.eventType === 'UPDATE') {
              const newChat = payload.new as Chat;
              const oldChat = payload.old as Chat;
              console.log(`Chat ${newChat.id} updated with:`, {
                requires_code_rewrite: newChat.requires_code_rewrite,
                code_approved: newChat.code_approved,
                previous_requires_code_rewrite: oldChat.requires_code_rewrite,
                previous_code_approved: oldChat.code_approved
              });
            }
            
            // Create a new reference of the chats array to trigger re-renders
            let updatedChats: Chat[] = [];
            
            // Update local cache based on event type
            if (payload.eventType === 'INSERT') {
              const newChat = payload.new as Chat;
              updatedChats = [newChat, ...chatsCache.data];
              chatsCache.data = updatedChats;
              
              // DO NOT AUTO-NAVIGATE HERE - let the component handle it
              console.log(`New chat ${newChat.id} created, not auto-navigating`);
              
              // Show toast notification
              toast({
                title: 'Workflow Created',
                description: `"${newChat.title}" has been created successfully`,
                duration: 2000,
              });
            } 
            else if (payload.eventType === 'UPDATE') {
              const updatedChat = payload.new as Chat;
              updatedChats = chatsCache.data.map(chat => 
                chat.id === updatedChat.id ? { ...updatedChat } : chat
              );
              chatsCache.data = updatedChats;
            } 
            else if (payload.eventType === 'DELETE') {
              updatedChats = chatsCache.data.filter(chat => chat.id !== payload.old.id);
              chatsCache.data = updatedChats;
            }
            
            console.log('Updated chats cache:', chatsCache.data);
            
            // Update the state with a completely new array reference to ensure re-renders
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
  }, [user, navigate]);

  // Create a new chat
  const createChat = async (title: string) => {
    if (!user) return null;
    
    try {
      const newChat = {
        title: title || 'New Workflow',
        uid: user.id,
        is_example: false
      };
      
      const { data, error } = await supabase
        .from('chats')
        .insert(newChat)
        .select()
        .single();

      if (error) throw error;
      
      // Add the new chat to cache manually to avoid race conditions
      const createdChat = data as Chat;
      chatsCache.data = [createdChat, ...chatsCache.data];
      setChats([...chatsCache.data]);
      
      console.log('Created chat and updated local cache:', createdChat.id);
      
      // Return the data from the API call
      return createdChat;
    } catch (error: any) {
      toast({
        title: 'Error creating workflow',
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
  console.log(`getCodeRewritingStatus for chat ${chat.id}:`, { 
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
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const lastChatIdRef = useRef<string | null>(null);
  
  // Prevent unnecessary status updates if chat hasn't changed
  const updateStatus = useCallback((newStatus: CodeRewritingStatus) => {
    setCodeRewritingStatus(prev => {
      if (prev === newStatus) return prev; // Don't update if unchanged
      console.log(`Updating codeRewritingStatus from ${prev} to ${newStatus}`);
      return newStatus;
    });
  }, []);
  
  // Update selectedChat whenever chatId changes
  useEffect(() => {
    if (!chatId || !user) {
      setSelectedChat(null);
      setCodeRewritingStatus('thinking');
      return;
    }

    // Initial fetch from cache or database
    const fetchSelectedChat = async () => {
      try {
        // First try to get from cache
        const cachedChat = chatsCache.data.find(chat => chat.id === chatId);
        
        if (cachedChat) {
          setSelectedChat(cachedChat);
          const status = getCodeRewritingStatus(cachedChat);
          setCodeRewritingStatus(status);
          console.log(`useSelectedChat: Found cached chat ${chatId}, status: ${status}`);
        } else {
          // If not in cache, fetch from database
          const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('id', chatId)
            .single();

          if (error) throw error;
          
          if (data) {
            setSelectedChat(data);
            const status = getCodeRewritingStatus(data);
            setCodeRewritingStatus(status);
            console.log(`useSelectedChat: Fetched chat ${chatId}, status: ${status}`);
          }
        }
      } catch (error: any) {
        console.error('Error fetching selected chat:', error);
        setSelectedChat(null);
        setCodeRewritingStatus('thinking');
      }
    };

    fetchSelectedChat();

    // Set up a direct realtime subscription for this specific chat
    const channelName = `selected-chat-${chatId}-${Date.now()}`;
    
    console.log(`Creating direct subscription for chat ${chatId}`);
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chats',
          filter: `id=eq.${chatId}`
        },
        (payload) => {
          console.log(`Direct update for selected chat ${chatId}:`, payload);
          const updatedChat = payload.new as Chat;
          setSelectedChat(updatedChat);
          const status = getCodeRewritingStatus(updatedChat);
          console.log(`Directly updating status for chat ${chatId} to:`, status);
          setCodeRewritingStatus(status);
        }
      )
      .subscribe();

    return () => {
      // Clean up subscription
      if (channelRef.current) {
        console.log(`Removing direct subscription for chat ${chatId}`);
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [chatId, user]);

  // Return memoized values to prevent unnecessary re-renders
  return useMemo(() => ({
    selectedChat,
    codeRewritingStatus
  }), [selectedChat, codeRewritingStatus]);
};
