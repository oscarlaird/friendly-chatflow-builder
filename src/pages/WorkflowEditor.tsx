
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Workflow } from '@/components/workflow/Workflow';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, PanelLeftClose, PanelLeft, Edit2, Check, Trash2 } from 'lucide-react';
import { ExtensionStatus } from '@/components/ui/extension-status';
import { ConnectedApps } from '@/components/ui/ConnectedApps';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserProfile } from '@/components/ui/user-profile';
import { WorkflowSidePanel } from '@/components/workflow/WorkflowSidePanel';
import { useChats } from '@/hooks/useChats';

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { chats, updateChatTitle, deleteChat } = useChats();
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [workflowPanelOpen, setWorkflowPanelOpen] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/workflows');
      return;
    }

    const workflow = chats.find(chat => chat.id === id);
    if (workflow) {
      setTitle(workflow.title);
    } else {
      navigate('/workflows');
    }
  }, [id, chats, navigate]);

  const handleSaveTitle = async () => {
    if (id && title.trim() !== '') {
      await updateChatTitle(id, title);
      setEditingTitle(false);
    }
  };

  const handleDeleteWorkflow = async () => {
    if (id && window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteChat(id);
      navigate('/workflows');
    }
  };

  const toggleWorkflowPanel = () => {
    setWorkflowPanelOpen(prev => !prev);
  };

  if (!id) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workflows')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="h-9 w-64"
                placeholder="Workflow name"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveTitle}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{title}</h1>
              <Button variant="ghost" size="icon" onClick={() => setEditingTitle(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleWorkflowPanel}
            className="lg:hidden"
          >
            {workflowPanelOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
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
        <div className={`flex flex-col border-r ${workflowPanelOpen ? 'w-64' : 'w-0'} transition-width duration-300 overflow-hidden`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full justify-start rounded-none border-b px-4 pt-2">
              <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
              <TabsTrigger value="workflow" className="flex-1">Workflow</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 p-0 data-[state=active]:flex">
              <div className="flex-1 overflow-hidden">
                {/* This will be empty for now, could show chat history */}
                <div className="p-4 text-center text-muted-foreground">
                  Chat history panel
                </div>
              </div>
            </TabsContent>
            <TabsContent value="workflow" className="flex-1 p-0 data-[state=active]:flex">
              <WorkflowSidePanel steps={[]} chatId={id} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          <div className="overflow-hidden border-r">
            <ChatInterface chatId={id} />
          </div>
          <div className="overflow-hidden">
            <Workflow chatId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
