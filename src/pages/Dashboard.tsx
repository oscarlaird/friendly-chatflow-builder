import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SendHorizontal, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/ui/user-profile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ExtensionStatus } from '@/components/ui/extension-status';
import { ConnectedApps } from '@/components/ui/ConnectedApps';
import { WorkflowList } from '@/components/workflow/WorkflowList';
import { WorkflowTemplateGallery } from '@/components/workflow/WorkflowTemplateGallery';
import { WorkflowGallery } from '@/components/workflow/WorkflowGallery';
import { RecentRuns } from '@/components/dashboard/RecentRuns';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import '../styles/animations.css';

// Updated prompts with full text
const examplePrompts = [
  "Research companies in Google Sheets, find founders, send LinkedIn requests",
  "Transfer dashboard data to Google Sheet",
  "Update Salesforce contacts if they've changed companies",
  "Draft product query responses in Gmail"
];

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const { user } = useAuth();
  const { createChat } = useChats();
  const navigate = useNavigate();

  const handleCreateWorkflow = async (initialPrompt?: string) => {
    try {
      const promptText = initialPrompt || prompt;
      if (!promptText.trim()) return;
      
      const newChat = await createChat('New Workflow');
      
      if (newChat) {
        navigate(`/workflow/${newChat.id}`);
        
        setTimeout(() => {
          navigate(`/workflow/${newChat.id}?initialPrompt=${encodeURIComponent(promptText)}`);
        }, 100);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
      e.preventDefault();
      handleCreateWorkflow();
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Mill</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <ConnectedApps />
              <ExtensionStatus />
              <ThemeToggle />
              <UserProfile />
            </div>
          </div>
        </header>

        <div className="relative">
          <div className="absolute inset-0 -z-10 h-72 w-full animated-gradient-bg"></div>

          <section className="py-24 text-center max-w-3xl mx-auto px-4">
            <div className="space-y-6 fade-in">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Idea to workflow in seconds.
              </h1>
              <p className="text-xl text-muted-foreground">
                Mill is your workflow builder assistant.
              </p>
              
              <div className="max-w-xl mx-auto mt-12 fade-in delay-100">
                <div className="enhanced-input-container">
                  <Input
                    placeholder="Ask Mill to automate your workflow..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="enhanced-input"
                  />
                  <Button 
                    size="icon" 
                    disabled={!prompt.trim()}
                    onClick={() => handleCreateWorkflow()}
                    className="bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue))/90%]"
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3 mt-4 fade-in delay-200">
                  {examplePrompts.map((example, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleCreateWorkflow(example)}
                          className="prompt-badge flex-shrink-0"
                          style={{ maxWidth: `${200 + index * 50}px` }}
                        >
                          {example.split(',')[0].trim()}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{example}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
        
        {/* Workflows and Gallery Section */}
        <section className="container mx-auto py-8 px-4 fade-in delay-300">
          <Tabs defaultValue="my-workflows" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="my-workflows">My Workflows</TabsTrigger>
              <TabsTrigger value="recent-runs">Recent Runs</TabsTrigger>
              <TabsTrigger value="gallery">Workflow Gallery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-workflows" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">My Workflows</h2>
                <Button 
                  onClick={() => setTemplateGalleryOpen(true)}
                  className="bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue))/90%]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Workflow
                </Button>
              </div>
              <WorkflowList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
              
              <Button 
                variant="outline" 
                className="mt-6 mx-auto flex items-center" 
                onClick={() => navigate('/workflows')}
              >
                View all workflows
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </TabsContent>
            
            <TabsContent value="recent-runs">
              <RecentRuns />
            </TabsContent>
            
            <TabsContent value="gallery">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Workflow Gallery</h2>
              </div>
              <WorkflowGallery onSelectTemplate={handleCreateWorkflow} />
            </TabsContent>
          </Tabs>
        </section>
        
        <WorkflowTemplateGallery 
          open={templateGalleryOpen}
          onOpenChange={setTemplateGalleryOpen}
          onSelectTemplate={async (templateId) => {
            try {
              const newChat = await createChat('New Workflow');
              if (newChat) {
                setTemplateGalleryOpen(false);
                navigate(`/workflow/${newChat.id}`);
              }
            } catch (error) {
              console.error('Error creating workflow:', error);
            }
          }}
        />
      </div>
    </TooltipProvider>
  );
}
