
import { useState } from 'react';
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
import { AnimatedText } from '@/components/ui/animated-text';
import '../styles/animations.css';

// Updated prompts with full text
const examplePrompts = [
  "Research the companies in my google sheets, find the founders and send them a linkedin request.",
  "Get data from dashboard and put that in google sheet",
  "Update contacts in my salesforce instance if they no longer work in the same company - mark them disqualified.",
  "Build drafts for messages that came in for product query in my gmail."
];

// Shortened versions for display
const shortPrompts = [
  "Research companies & founders",
  "Dashboard data to sheets",
  "Update disqualified contacts",
  "Draft product query responses"
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
        // Navigate to workflow editor
        navigate(`/workflow/${newChat.id}`);
        
        // Use a small delay before sending the initial message
        setTimeout(() => {
          // We'll handle sending the initial message in the WorkflowEditor
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

  // Animation phrases
  const animationPhrases = [
    "build your customized workflow",
    "use browser to interact with your systems",
    "run your workflows",
    "be your virtual employee"
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="border-b border-gray-800">
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

        {/* Hero Section */}
        <section className="py-16 text-center max-w-3xl mx-auto px-4">
          <div className="space-y-8 fade-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Idea to workflow in seconds.
            </h1>
            <p className="text-xl text-gray-400">
              <span className="text-white">Ask Mill to </span>
              <AnimatedText 
                baseText="" 
                phrases={animationPhrases}
                className="text-blue-400"
              />
            </p>
            
            <div className="max-w-2xl mx-auto mt-12 fade-in delay-100">
              <div className="flex items-center gap-2 mt-6 rounded-full border border-gray-700 bg-gray-900/60 p-2 shadow-lg backdrop-blur-sm">
                <Input
                  placeholder="Ask Mill to automate your workflow..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base rounded-full"
                />
                <Button 
                  size="icon" 
                  disabled={!prompt.trim()}
                  onClick={() => handleCreateWorkflow()}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 h-10 w-10"
                >
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Updated prompt examples - horizontal layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 fade-in delay-200">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleCreateWorkflow(example)}
                    title={example} // Full prompt as tooltip
                    className="px-4 py-2 text-sm rounded-full border border-gray-700 bg-gray-900/60 backdrop-blur-sm hover:bg-gray-800 transition-colors"
                  >
                    {shortPrompts[index]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Workflows and Gallery Section */}
        <section className="container mx-auto py-8 px-4 fade-in delay-300">
          <Tabs defaultValue="my-workflows" className="w-full">
            <TabsList className="mb-8 bg-gray-900/60 border border-gray-800">
              <TabsTrigger value="my-workflows" className="data-[state=active]:bg-blue-600">My Workflows</TabsTrigger>
              <TabsTrigger value="recent-runs" className="data-[state=active]:bg-blue-600">Recent Runs</TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-blue-600">Workflow Gallery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-workflows" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">My Workflows</h2>
                <Button 
                  onClick={() => setTemplateGalleryOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Workflow
                </Button>
              </div>
              <WorkflowList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
              
              <Button 
                variant="outline" 
                className="mt-6 mx-auto flex items-center border-gray-700 hover:bg-gray-800" 
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
