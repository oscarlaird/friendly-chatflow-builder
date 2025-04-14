
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { Workflow } from '@/components/workflow/Workflow';
import { useSelectedChat } from '@/hooks/useChats';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWindowMessages } from '@/hooks/useWindowMessages';

const WorkflowEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { dataState, loading, sendMessage } = useMessages(id || null);
  const { selectedChat, codeRewritingStatus } = useSelectedChat(id || '');
  const [sending, setSending] = useState(false);
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<'chat' | 'workflow'>(isMobile ? 'workflow' : 'chat');
  const navigate = useNavigate();
  
  // Initialize the window message handler
  useWindowMessages();

  // Get initial workflow steps from selected chat
  const initialWorkflowSteps = selectedChat?.steps as any[] || [];

  const handleSendMessage = async (content: string, type: 'text_message' | 'code_run' = 'text_message') => {
    if (!id) return;
    
    setSending(true);
    try {
      await sendMessage(content, 'user', type);
    } finally {
      setSending(false);
    }
  };

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">No workflow selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="flex h-16 items-center px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/workflows')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold truncate">
            {selectedChat?.title || 'Workflow Editor'}
          </h1>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="md:hidden border-b">
        <Tabs defaultValue={activeView} value={activeView} onValueChange={(value) => setActiveView(value as 'chat' | 'workflow')}>
          <TabsList className="w-full">
            <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
            <TabsTrigger value="workflow" className="flex-1">Workflow</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile view (tabs) */}
      <div className="md:hidden flex-1 overflow-hidden">
        {activeView === 'chat' ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <MessageList dataState={dataState} loading={loading} />
            <MessageInput onSendMessage={handleSendMessage} disabled={sending || !id} />
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <Workflow 
              initialSteps={initialWorkflowSteps} 
              chatId={id} 
            />
          </div>
        )}
      </div>

      {/* Desktop view (resizable panels) */}
      <div className="hidden md:block flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <MessageList dataState={dataState} loading={loading} />
              <MessageInput onSendMessage={handleSendMessage} disabled={sending || !id} />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={50} minSize={30}>
            <Workflow 
              initialSteps={initialWorkflowSteps} 
              chatId={id} 
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkflowEditor;
