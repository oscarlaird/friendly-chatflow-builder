
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ChatList } from '@/components/chat/ChatList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { LogOut } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

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
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="text-lg font-bold">Chat App</h1>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <ChatList
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
            />
          </div>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <div className="flex items-center p-4 border-b">
            <SidebarTrigger className="mr-2" />
            <h2 className="text-lg font-medium flex-1">
              {selectedChatId ? 'Chat' : 'Select or create a chat'}
            </h2>
          </div>
          <div className="flex-1">
            <ChatInterface chatId={selectedChatId} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
