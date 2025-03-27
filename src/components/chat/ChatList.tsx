
import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChats } from '@/hooks/useChats';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';

interface ChatListProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export const ChatList = ({ selectedChatId, onSelectChat }: ChatListProps) => {
  const { chats, loading, createChat, deleteChat, updateChatTitle } = useChats();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateChat = async () => {
    const newChat = await createChat('New Chat');
    if (newChat) {
      onSelectChat(newChat.id);
    }
  };

  const handleEditChat = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = async (chatId: string) => {
    await updateChatTitle(chatId, editTitle);
    setEditingChatId(null);
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    await deleteChat(chatId);
    if (selectedChatId === chatId) {
      onSelectChat(chats[0]?.id || null);
    }
  };

  return (
    <>
      <SidebarHeader>
        <Button onClick={handleCreateChat} className="w-full flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>
      
      <SidebarContent>
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-sm text-muted-foreground">Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 px-4 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No chats yet. Create your first chat to get started.</p>
          </div>
        ) : (
          <SidebarMenu>
            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                {editingChatId === chat.id ? (
                  <div className="flex items-center w-full p-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                      className="flex-1 mr-2"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleSaveTitle(chat.id)}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleCancelEdit}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <SidebarMenuButton 
                    onClick={() => onSelectChat(chat.id)}
                    isActive={selectedChatId === chat.id}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{chat.title}</span>
                    <div className="ml-auto flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditChat(chat.id, chat.title);
                        }}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter>
        {/* Empty footer - removed "Real-time chat using Supabase" text */}
      </SidebarFooter>
    </>
  );
};
