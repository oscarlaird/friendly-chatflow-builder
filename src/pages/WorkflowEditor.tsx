import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Pencil, Check, X } from 'lucide-react';
import { ExtensionStatus } from '@/components/ui/extension-status';
import { ConnectedApps } from '@/components/ui/ConnectedApps';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserProfile } from '@/components/ui/user-profile';
import { useChats } from '@/hooks/useChats';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { chats, deleteChat, updateChatTitle } = useChats();
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  // Helper function to ensure scrolling works
  const scrollMessagesToBottom = () => {
    // Try different selectors to find the scroll container
    const selectors = [
      '#message-end',
      '[data-radix-scroll-area-viewport]',
      '.message-list-container',
      '.overflow-auto',
      '.overflow-y-auto'
    ];
    
    // Try each selector
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (selector === '#message-end') {
          (el as HTMLElement).scrollIntoView({ behavior: 'auto', block: 'end' });
        } else {
          (el as HTMLElement).scrollTop = (el as HTMLElement).scrollHeight;
        }
      });
    }
  };

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
      setEditTitle(workflow.title);
      
      // Scroll to bottom when workflow loads
      setTimeout(scrollMessagesToBottom, 300);
      setTimeout(scrollMessagesToBottom, 800);
    } else {
      console.log("Workflow not found, navigating to workflows");
      if (chats.length > 0) {
        // Only navigate away if we've already loaded chats
        navigate('/workflows');
      }
    }
  }, [id, chats, navigate]);
  
  // Set up a regular interval to check and force scroll
  useEffect(() => {
    const scrollInterval = setInterval(scrollMessagesToBottom, 2000);
    return () => clearInterval(scrollInterval);
  }, []);

  const handleDeleteWorkflow = async () => {
    if (id && window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteChat(id);
      navigate('/workflows');
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditTitle(title);
  };

  const handleSaveTitle = async () => {
    if (id && editTitle.trim() !== '') {
      await updateChatTitle(id, editTitle);
      setTitle(editTitle);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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
            
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                  className="h-9 w-60"
                />
                <Button variant="ghost" size="icon" onClick={handleSaveTitle}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{title || 'Loading...'}</h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleEditClick}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <ConnectedApps />
            <ExtensionStatus />
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
              onClick={handleDeleteWorkflow}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <UserProfile />
          </div>
        </header>
        
        {/* Use a simplified layout with chat interface only */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface chatId={id} />
        </div>
      </div>
    </TooltipProvider>
  );
}
