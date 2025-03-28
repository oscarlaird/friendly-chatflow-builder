
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat, CodeRewritingStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch all chats for the user
  const fetchChats = async () => {
    if (!user) return;
    
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

  // Create a new chat
  const createChat = async (title: string) => {
    if (!user) return null;
    
    try {
      const newChat = {
        title: title || 'New Chat',
        uid: user.id,
        // id is auto-generated by Supabase, so no need to specify it here
        is_example: false
      };
      
      const { data, error } = await supabase
        .from('chats')
        .insert(newChat)
        .select()
        .single();

      if (error) throw error;
      
      setChats(prev => [data, ...prev]);
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
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
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
      
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      ));
    } catch (error: any) {
      toast({
        title: 'Error updating chat',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Load chats when user changes
  useEffect(() => {
    if (user) {
      fetchChats();
    } else {
      setChats([]);
      setLoading(false);
    }
  }, [user]);

  return {
    chats,
    loading,
    createChat,
    deleteChat,
    updateChatTitle,
    refreshChats: fetchChats,
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
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeRewritingStatus, setCodeRewritingStatus] = useState<CodeRewritingStatus>('thinking');
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !chatId) {
      setSelectedChat(null);
      setCodeRewritingStatus('thinking');
      return;
    }

    const fetchChat = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();

        if (error) {
          console.error('Error fetching chat:', error);
          return;
        }

        console.log('Initial chat data loaded:', data);
        setSelectedChat(data);
        
        // Directly set the code rewriting status based on the data
        if (data.requires_code_rewrite === null) {
          setCodeRewritingStatus('thinking');
        } else if (data.requires_code_rewrite === false) {
          setCodeRewritingStatus('done');
        } else {
          // requires_code_rewrite is true
          setCodeRewritingStatus(data.code_approved ? 'done' : 'rewriting_code');
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();

    // Subscribe to changes for this specific chat
    console.log(`Setting up real-time subscription for chat ${chatId}`);
    
    const channel = supabase
      .channel(`chat-updates-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`
        },
        (payload) => {
          console.log('Real-time chat update received:', payload);
          
          if (payload.eventType === 'DELETE') {
            // Handle chat deletion if needed
            setSelectedChat(null);
            setCodeRewritingStatus('thinking');
          } else {
            // Handle chat insertion or update
            const updatedChat = payload.new as Chat;
            console.log('Updated chat data:', updatedChat);
            
            // Force update the local state
            setSelectedChat(updatedChat);
            
            // Directly set the code rewriting status based on the updated chat
            console.log('Directly updating status based on:', updatedChat.requires_code_rewrite, updatedChat.code_approved);
            
            if (updatedChat.requires_code_rewrite === null) {
              setCodeRewritingStatus('thinking');
            } else if (updatedChat.requires_code_rewrite === false) {
              setCodeRewritingStatus('done');
            } else {
              // requires_code_rewrite is true
              setCodeRewritingStatus(updatedChat.code_approved ? 'done' : 'rewriting_code');
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`Supabase channel status for chat ${chatId}:`, status);
      });

    return () => {
      console.log(`Cleaning up real-time subscription for chat ${chatId}`);
      supabase.removeChannel(channel);
    };
  }, [chatId, user]);

  return {
    selectedChat,
    loading,
    codeRewritingStatus
  };
};
