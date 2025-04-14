
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, GitBranch, Search } from 'lucide-react';
import { useChats } from '@/hooks/useChats';
import { Card } from '@/components/ui/card';
import { WorkflowList } from '@/components/workflow/WorkflowList';
import { ConnectedApps } from '@/components/ui/ConnectedApps';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { workflowTemplates } from '@/data/workflowTemplates';

const Workflows = () => {
  const { chats, loading, createChat } = useChats();
  const navigate = useNavigate();
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create a new workflow (chat)
  const handleCreateWorkflow = async (templateName?: string) => {
    try {
      const title = templateName ? templateName : 'New Workflow';
      const newChat = await createChat(title);
      if (newChat) {
        navigate(`/workflow/${newChat.id}`);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const filteredTemplates = workflowTemplates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Workflows
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <ConnectedApps />
            <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Workflow</DialogTitle>
                  <DialogDescription>
                    Start from scratch or choose a template to get started quickly.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <Card 
                      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors flex flex-col items-center justify-center text-center h-40"
                      onClick={() => {
                        handleCreateWorkflow();
                        setShowTemplates(false);
                      }}
                    >
                      <div className="rounded-full bg-primary/10 p-3 mb-3">
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">Blank Workflow</h3>
                      <p className="text-sm text-muted-foreground mt-1">Start from scratch</p>
                    </Card>
                    
                    {filteredTemplates.map((template) => (
                      <Card 
                        key={template.id}
                        className="p-4 cursor-pointer hover:bg-accent/50 transition-colors h-40 relative overflow-hidden"
                        onClick={() => {
                          handleCreateWorkflow(template.name);
                          setShowTemplates(false);
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0" />
                        {template.image && (
                          <img 
                            src={template.image} 
                            alt={template.name} 
                            className="absolute inset-0 w-full h-full object-cover z-[-1]"
                          />
                        )}
                        <div className="relative z-10 h-full flex flex-col justify-end">
                          <h3 className="font-medium text-white drop-shadow-sm">{template.name}</h3>
                          <p className="text-sm text-white/90 mt-1 drop-shadow-sm">{template.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading workflows...</p>
          </div>
        ) : chats.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Workflows Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first workflow to start building automated sequences
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  Create Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Workflow</DialogTitle>
                  <DialogDescription>
                    Start from scratch or choose a template to get started quickly.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Card 
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors flex flex-col items-center justify-center text-center h-40"
                    onClick={() => handleCreateWorkflow()}
                  >
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Blank Workflow</h3>
                    <p className="text-sm text-muted-foreground mt-1">Start from scratch</p>
                  </Card>
                  
                  {workflowTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors h-40 relative overflow-hidden"
                      onClick={() => handleCreateWorkflow(template.name)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0" />
                      {template.image && (
                        <img 
                          src={template.image} 
                          alt={template.name} 
                          className="absolute inset-0 w-full h-full object-cover z-[-1]"
                        />
                      )}
                      <div className="relative z-10 h-full flex flex-col justify-end">
                        <h3 className="font-medium text-white drop-shadow-sm">{template.name}</h3>
                        <p className="text-sm text-white/90 mt-1 drop-shadow-sm">{template.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        ) : (
          <WorkflowList workflows={chats} />
        )}
      </main>
    </div>
  );
};

export default Workflows;
