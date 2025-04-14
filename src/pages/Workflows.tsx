
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, GitBranch } from 'lucide-react';
import { useChats } from '@/hooks/useChats';
import { Card } from '@/components/ui/card';
import { WorkflowList } from '@/components/workflow/WorkflowList';

const Workflows = () => {
  const { chats, loading, createChat } = useChats();
  const navigate = useNavigate();

  // Create a new workflow (chat)
  const handleCreateWorkflow = async () => {
    try {
      const newChat = await createChat('New Workflow');
      if (newChat) {
        navigate(`/workflow/${newChat.id}`);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Workflows
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleCreateWorkflow} className="gap-1">
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>
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
            <Button onClick={handleCreateWorkflow} className="gap-1">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          </Card>
        ) : (
          <WorkflowList workflows={chats} />
        )}
      </main>
    </div>
  );
};

export default Workflows;
