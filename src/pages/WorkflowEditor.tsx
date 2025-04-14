
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { ExtensionStatus } from '@/components/ui/extension-status';
import { ConnectedApps } from '@/components/ui/ConnectedApps';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserProfile } from '@/components/ui/user-profile';
import { useChats } from '@/hooks/useChats';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Workflow } from '@/components/workflow/Workflow';

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { chats, deleteChat } = useChats();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!id) {
      console.log("No ID provided, navigating to workflows");
      navigate('/workflows');
      return;
    }

    console.log("Looking for workflow with ID:", id);
    console.log("Available chats:", chats);

    const workflow = chats.find(chat => chat.id === id);
    if (workflow) {
      console.log("Found workflow:", workflow);
      setTitle(workflow.title);
    } else {
      console.log("Workflow not found, navigating to workflows");
      if (chats.length > 0) {
        // Only navigate away if we've already loaded chats
        navigate('/workflows');
      }
    }
  }, [id, chats, navigate]);

  const handleDeleteWorkflow = async () => {
    if (id && window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteChat(id);
      navigate('/workflows');
    }
  };

  // Show loading state if ID is present but chats are still loading
  if (!id) return null;

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/workflows')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">{title || 'Loading...'}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteWorkflow}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <ConnectedApps />
            <ExtensionStatus />
            <ThemeToggle />
            <UserProfile />
          </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Simple two-column layout */}
          <div className="flex-1 overflow-hidden border-r">
            <ChatInterface chatId={id} />
          </div>
          <div className="flex-1 overflow-hidden">
            <Workflow chatId={id} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
