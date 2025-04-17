
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  
  // Handle sending the initial prompt
  useEffect(() => {
    if (initialPrompt && id && sendMessage) {
      // Send the initial prompt as a user message
      sendMessage(initialPrompt, 'user', 'text_message')
        .then(() => {
          // Remove the initialPrompt from the URL after sending
          navigate(`/workflow/${id}`, { replace: true });
        })
        .catch(error => {
          console.error('Error sending initial prompt:', error);
        });
    }
  }, [initialPrompt, id, sendMessage, navigate]);

  useEffect(() => {
    if (selectedChat?.title) {
      setEditTitle(selectedChat.title);
    }
  }, [selectedChat]);

  const handleBack = () => {
    navigate('/workflows');
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!id || editTitle.trim() === '') return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ title: editTitle })
        .eq('id', id);
      
      if (error) throw error;
      
      setIsEditingTitle(false);
      toast.success('Workflow renamed');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      if (selectedChat?.title) {
        setEditTitle(selectedChat.title);
      }
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
        <div className="flex items-center px-4 py-2 border-b">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="max-w-md"
              />
              <Button size="icon" onClick={handleSaveTitle}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="text-lg font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
              onClick={handleEditTitle}
            >
              {selectedChat.title || 'Untitled Workflow'}
            </div>
          )}
        </div>
        <ChatInterface chatId={id} />
      </div>
    </Layout>
  );
}
