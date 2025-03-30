
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat, CodeRewritingStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);

  // Fetch all chats for the user and set up realtime subscription
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }
    
    const fetchChats = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setChats(data || []);
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

    // Set up realtime subscription
    const channel = supabase
      .channel('chats-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chats' },
        (payload) => {
          console.log('Chats realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setChats(prev => [payload.new as Chat, ...prev]);
          } 
          else if (payload.eventType === 'UPDATE') {
            setChats(prev => 
              prev.map(chat => 
                chat.id === payload.new.id ? { ...chat, ...payload.new as Chat } : chat
              )
            );
          } 
          else if (payload.eventType === 'DELETE') {
            setChats(prev => prev.filter(chat => chat.id !== payload.old.id));
          }
        }
      )
      .subscribe();
    
    subscriptionRef.current = channel;

    return () => {
      // Clean up subscription
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
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
      
      // No need to update state manually - the realtime subscription will handle it
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
      
      // No need to update state manually - the realtime subscription will handle it
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
      
      // No need to update state manually - the realtime subscription will handle it
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
  const { user } = useAuth();
  const { chats } = useChats();
  
  // Find the selected chat from the chats array instead of making a new query
  const selectedChat = chatId ? chats.find(chat => chat.id === chatId) || null : null;

  // Update code rewriting status whenever the selected chat changes
  useEffect(() => {
    if (!selectedChat) {
      setCodeRewritingStatus('thinking');
      return;
    }
    
    // Update code rewriting status based on the selected chat
    if (selectedChat.requires_code_rewrite === null) {
      setCodeRewritingStatus('thinking');
    } else if (selectedChat.requires_code_rewrite === false) {
      setCodeRewritingStatus('done');
    } else {
      // requires_code_rewrite is true
      setCodeRewritingStatus(selectedChat.code_approved ? 'done' : 'rewriting_code');
    }
  }, [selectedChat]);

  return {
    selectedChat,
    loading,
    codeRewritingStatus
  };
};
