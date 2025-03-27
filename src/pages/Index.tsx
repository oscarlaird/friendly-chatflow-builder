
import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ChatList } from '@/components/chat/ChatList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { LogOut, PanelLeftClose, PanelLeft } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useChats } from '@/hooks/useChats';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Cookies from 'js-cookie';

// Simple component to use the correct icon based on sidebar state
const SidebarIcon = () => {
  const { open } = useSidebar();
  return open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />;
};

const SELECTED_CHAT_COOKIE = 'selected_chat_id';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { chats, loading: chatsLoading } = useChats();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatIdFromUrl = searchParams.get('chatId');
  
  // Function to update both state and URL
  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    Cookies.set(SELECTED_CHAT_COOKIE, chatId, { expires: 30 }); // Store in cookie for 30 days
    navigate(`/?chatId=${chatId}`, { replace: true });
  };
  
  // Handle initial load - prioritize URL param, then cookie
  useEffect(() => {
    if (!chatsLoading && chats.length > 0) {
      // Check URL parameter first
      if (chatIdFromUrl) {
        // Verify the chat exists before selecting it
        const chatExists = chats.some(chat => chat.id === chatIdFromUrl);
        if (chatExists) {
          setSelectedChatId(chatIdFromUrl);
          return;
        }
      }
      
      // If no URL param or invalid, try cookie
      const savedChatId = Cookies.get(SELECTED_CHAT_COOKIE);
      if (savedChatId) {
        const chatExists = chats.some(chat => chat.id === savedChatId);
        if (chatExists) {
          setSelectedChatId(savedChatId);
          navigate(`/?chatId=${savedChatId}`, { replace: true });
          return;
        }
      }
      
      // If no valid cookie, select most recent chat
      const sortedChats = [...chats].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      handleSelectChat(sortedChats[0].id);
    }
  }, [chats, chatsLoading, chatIdFromUrl, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar collapsible="offcanvas">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="text-lg font-bold">Chat App</h1>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ChatList
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
            />
          </div>
        </Sidebar>

        <SidebarInset className="flex flex-col overflow-hidden">
          <div className="flex items-center p-4 border-b flex-shrink-0">
            <SidebarTrigger className="mr-2">
              <SidebarIcon />
            </SidebarTrigger>
            <h2 className="text-lg font-medium flex-1">
              {selectedChatId ? 'Chat' : 'Select or create a chat'}
            </h2>
            <ThemeToggle />
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface chatId={selectedChatId} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
