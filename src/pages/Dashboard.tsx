import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SendHorizontal, Plus, ChevronRight, Search, FileSpreadsheet, RefreshCw, Mail } from 'lucide-react';
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
import { RequestWorkflowModal } from '@/components/workflow/RequestWorkflowModal';
import { RecentRuns } from '@/components/dashboard/RecentRuns';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import '../styles/animations.css';

// Shorter prompts with icons
const examplePrompts = [
  { text: "Research companies", icon: <Search className="mr-1 h-3 w-3" />, fullText: "Research companies in Google Sheets, find founders, send LinkedIn requests" },
  { text: "Transfer data", icon: <FileSpreadsheet className="mr-1 h-3 w-3" />, fullText: "Transfer dashboard data to Google Sheet" },
  { text: "Update contacts", icon: <RefreshCw className="mr-1 h-3 w-3" />, fullText: "Update Salesforce contacts if they've changed companies" },
  { text: "Draft responses", icon: <Mail className="mr-1 h-3 w-3" />, fullText: "Draft product query responses in Gmail" }
];

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const { user } = useAuth();
  const { createChat, chats, loading } = useChats();
  const navigate = useNavigate();

  // Default to my-workflows initially but will be changed based on chats
  const [tabValue, setTabValue] = useState('my-workflows');
  
  // Set the active tab based on whether the user has workflows
  useEffect(() => {
    if (user && !loading) {
      // If the user has no workflows, show the gallery tab
      if (chats?.length === 0) {
        console.log("No workflows found, showing gallery tab");
        setTabValue('gallery');
      } else {
        console.log("Workflows found, showing my-workflows tab");
        setTabValue('my-workflows');
        
      }
    }
  }, [user, loading, chats]);

  const handleCreateWorkflow = async (initialPrompt?: string) => {
    const promptText = initialPrompt || prompt;
    if (!promptText.trim()) return;

    if (!user) {
      // Save the prompt to sessionStorage before redirecting
      sessionStorage.setItem('pendingPrompt', promptText);
      navigate('/auth');
      return;
    }
    
    try {
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

  const handleSelectTemplate = async (template: any) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Create a new chat with the template title
      const newChat = await createChat(template.title);
      
      if (newChat) {
        // Update the chat with template data
        const { error: updateError } = await supabase
          .from('chats')
          .update({
            script: template.script,
            steps: template.steps,
            apps: template.apps,
            requires_browser: template.requires_browser
          })
          .eq('id', newChat.id);
          
        if (updateError) throw updateError;
        
        // If template has instructions, create an initial message
        if (template.instructions) {
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              chat_id: newChat.id,
              content: template.instructions,
              role: 'assistant',
              type: 'text_message',
              uid: user.id
            });
            
          if (messageError) throw messageError;
        }
        
        // Navigate to the new workflow
        navigate(`/workflow/${newChat.id}`);
      }
    } catch (error) {
      console.error('Error creating workflow from template:', error);
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
              <h1 className="text-2xl font-bold">Macro</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <ConnectedApps />
                  <ExtensionStatus />
                  <ThemeToggle />
                  <UserProfile />
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue)_/0.85)] text-white hover:text-white transition-colors"
                  >
                    Sign In
                  </Button>
                </div>
              )}
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
                Macro is your workflow builder assistant.
              </p>
              
              <div className="max-w-xl mx-auto mt-12 fade-in delay-100">
                <div className="enhanced-input-container">
                  <Input
                    placeholder="Ask Macro to automate your workflow..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="enhanced-input"
                  />
                  <Button 
                    size="icon" 
                    disabled={!prompt.trim()}
                    onClick={() => handleCreateWorkflow()}
                    className="bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue)_/0.85)] text-white hover:text-white transition-colors"
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex justify-center gap-3 mt-4 fade-in delay-200">
                  {examplePrompts.map((example, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleCreateWorkflow(example.fullText)}
                          className="prompt-badge-mini"
                        >
                          {example.icon}
                          {example.text}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{example.fullText}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
        
        {/* Only show workflows section if user is logged in */}
        {user && (
          <section className="container mx-auto py-8 px-4 fade-in delay-300">
            <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
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
                    className="bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue)_/0.85)] text-white hover:text-white transition-colors"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Workflow
                  </Button>
                </div>
                <WorkflowList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" limit={5} />
                
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
                  <Button 
                    variant="outline"
                    onClick={() => setRequestModalOpen(true)}
                  >
                    Request Workflow
                  </Button>
                </div>
                <WorkflowGallery onSelectTemplate={handleSelectTemplate} />
              </TabsContent>
            </Tabs>
          </section>
        )}
        
        <WorkflowTemplateGallery 
          open={templateGalleryOpen}
          onOpenChange={setTemplateGalleryOpen}
          onSelectTemplate={async (templateId) => {
            if (!user) {
              navigate('/auth');
              return;
            }

            try {
              // Fetch the template details
              const { data: template, error } = await supabase
                .from('templates')
                .select('*')
                .eq('id', templateId)
                .single();
                
              if (error) throw error;
              
              if (template) {
                // Create a new chat with the template title
                const newChat = await createChat(template.title);
                
                if (newChat) {
                  // Update the chat with template data
                  const { error: updateError } = await supabase
                    .from('chats')
                    .update({
                      script: template.script,
                      steps: template.steps,
                      apps: template.apps,
                      requires_browser: template.requires_browser
                    })
                    .eq('id', newChat.id);
                    
                  if (updateError) throw updateError;
                  
                  // If template has instructions, create an initial message
                  if (template.instructions) {
                    const { error: messageError } = await supabase
                      .from('messages')
                      .insert({
                        chat_id: newChat.id,
                        content: template.instructions,
                        role: 'assistant',
                        type: 'text_message',
                        uid: user.id
                      });
                      
                    if (messageError) throw messageError;
                  }
                  
                  setTemplateGalleryOpen(false);
                  navigate(`/workflow/${newChat.id}`);
                }
              }
            } catch (error) {
              console.error('Error creating workflow from template:', error);
            }
          }}
        />

        <RequestWorkflowModal
          open={requestModalOpen}
          onOpenChange={setRequestModalOpen}
        />
      </div>
    </TooltipProvider>
  );
}
