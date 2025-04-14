
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Workflow } from '@/components/workflow/Workflow';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { useChats } from '@/hooks/useChats';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft } from 'lucide-react';

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { chats } = useChats();

  useEffect(() => {
    if (!id) {
      console.log("No ID provided, navigating to workflows");
      navigate('/workflows');
      return;
    }

    console.log("Looking for workflow with ID:", id);
    console.log("Available chats:", chats);

    const workflow = chats.find(chat => chat.id === id);
    if (!workflow && chats.length > 0) {
      console.log("Workflow not found, navigating to workflows");
      navigate('/workflows');
    }
  }, [id, chats, navigate]);

  if (!id) return null;

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="flex items-center p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workflows')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </header>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          <div className="overflow-hidden border-r">
            <ChatInterface chatId={id} />
          </div>
          <div className="overflow-hidden">
            <Workflow chatId={id} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
