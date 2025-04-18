import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useSelectedChat } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function WorkflowEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('initialPrompt');
  const { selectedChat, codeRewritingStatus } = useSelectedChat(id || '');
  const { sendMessage } = useMessages(id);
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [initialPromptSent, setInitialPromptSent] = useState(false);
  
  // Set up editing state when selectedChat changes
  useEffect(() => {
    if (selectedChat?.title) {
      setEditTitle(selectedChat.title);
    }
  }, [selectedChat]);
  
  // Handle sending the initial prompt - only once
  useEffect(() => {
    if (initialPrompt && id && sendMessage && !initialPromptSent) {
      // Send the initial prompt as a user message
      sendMessage(initialPrompt, 'user', 'text_message')
        .then(() => {
          // Remove the initialPrompt from the URL after sending
          navigate(`/workflow/${id}`, { replace: true });
          setInitialPromptSent(true);
        })
        .catch(error => {
          console.error('Error sending initial prompt:', error);
        });
    }
  }, [initialPrompt, id, sendMessage, navigate, initialPromptSent]);

  const handleBack = () => {
    navigate('/');
  };
  
  const startEditing = () => {
    setIsEditing(true);
    setEditTitle(selectedChat?.title || 'Untitled Workflow');
  };
  
  const saveTitle = async () => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ title: editTitle })
        .eq('id', id);
      
      if (error) throw error;
      
      setIsEditing(false);
      toast.success('Workflow renamed');
    } catch (error) {
      console.error('Error updating workflow title:', error);
      toast.error('Failed to rename workflow');
    }
  };

  // Show loading state while chat is being fetched
  if (codeRewritingStatus === 'thinking' && !selectedChat) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!selectedChat) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Chat not found</p>
          <Button variant="outline" onClick={handleBack} className="ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="p-2 border-b flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          {isEditing ? (
            <div className="flex items-center flex-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mr-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveTitle();
                  } else if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditTitle(selectedChat.title || 'Untitled Workflow');
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={saveTitle}
                className="bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue))/90%]"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="text-base font-semibold flex-1 cursor-pointer hover:text-blue-600 transition-colors flex items-center" 
              onClick={startEditing}
            >
              {selectedChat.title || 'Untitled Workflow'}
              <Edit className="ml-2 h-3.5 w-3.5 opacity-50" />
            </div>
          )}
        </div>
        
        <ChatInterface chatId={id} />
      </div>
    </Layout>
  );
}
