
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useSelectedChat } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';

export default function WorkflowEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('initialPrompt');
  const { selectedChat, codeRewritingStatus } = useSelectedChat(id || '');
  const { sendMessage } = useMessages(id);
  const navigate = useNavigate();
  
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <ChatInterface chatId={id} />
      </div>
    </Layout>
  );
}
