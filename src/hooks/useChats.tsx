import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Chat } from '@/types';
import { toast } from 'sonner';

export const useChats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('uid', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setChats(data || []);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching chats:', error);
        setError(error);
        toast.error('Failed to load workflows');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Subscribe to changes
    const chatsSubscription = supabase
      .channel('chats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chats', filter: `uid=eq.${user?.id}` },
        (payload) => {
          if (!user) return;
          
          // Fetch the updated list of chats after a change
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatsSubscription);
    };
  }, [user]);

  // Function to create a new chat/workflow
  const createChat = async (title: string = 'New Workflow') => {
    if (!user) return null;
    
    try {
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([{ title, uid: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state with the new chat
      setChats(prevChats => [...prevChats, newChat as Chat]);
      
      return newChat as Chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create workflow');
      return null;
    }
  };
  
  const updateChatTitle = async (chatId: string, title: string) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId)
        .select()
        .single();

      if (error) throw error;

      // Optimistically update local state
      setChats(prevChats =>
        prevChats.map(chat => (chat.id === chatId ? { ...chat, title } : chat))
      );
      
      toast.success('Workflow title updated');
    } catch (error) {
      console.error('Error updating chat title:', error);
      toast.error('Failed to update workflow title');
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      // Optimistically update local state
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      toast.success('Workflow deleted');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete workflow');
    }
  };

  return {
    chats,
    loading,
    error,
    createChat, 
    updateChatTitle,
    deleteChat
  };
};

export const useSelectedChat = (chatId: string | null) => {
  const { chats, loading, error } = useChats();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [codeRewritingStatus, setCodeRewritingStatus] = useState<'thinking' | 'rewriting_code' | 'done'>('done');

  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find(chat => chat.id === chatId) || null;
      setSelectedChat(chat);
    } else {
      setSelectedChat(null);
    }
  }, [chatId, chats]);

  useEffect(() => {
    if (selectedChat?.requires_code_rewrite === true) {
      setCodeRewritingStatus('thinking');
    } else {
      setCodeRewritingStatus('done');
    }
  }, [selectedChat?.requires_code_rewrite]);

  return {
    selectedChat,
    loading,
    error,
    codeRewritingStatus
  };
};
