
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useChats } from '@/hooks/useChats';
import { Instagram, Users, Database, Send, Plus } from 'lucide-react';

interface WorkflowTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Template definitions
const templates = [
  {
    id: 'instagram',
    title: 'Instagram Messaging from Sheet',
    description: 'Send personalized messages to Instagram accounts from a Google Sheet',
    icon: Instagram,
    category: 'marketing'
  },
  {
    id: 'research',
    title: 'Research Companies',
    description: 'Automatically research companies and generate detailed profiles',
    icon: Users,
    category: 'research'
  },
  {
    id: 'salesforce',
    title: 'Update Salesforce CRM',
    description: 'Keep your Salesforce contacts updated with the latest information',
    icon: Database,
    category: 'sales'
  },
  {
    id: 'outreach',
    title: 'Email Outreach Campaign',
    description: 'Create and run personalized email outreach campaigns',
    icon: Send,
    category: 'marketing'
  },
];

export function WorkflowTemplateDialog({ open, onOpenChange }: WorkflowTemplateDialogProps) {
  const navigate = useNavigate();
  const { createChat } = useChats();
  const [activeTab, setActiveTab] = useState('templates');
  
  const handleCreateBlank = async () => {
    const newWorkflow = await createChat('Untitled Workflow');
    if (newWorkflow) {
      onOpenChange(false);
      navigate(`/workflow/${newWorkflow.id}`);
    }
  };
  
  const handleSelectTemplate = async (template: typeof templates[0]) => {
    // For now, all templates just create a blank workflow
    const newWorkflow = await createChat(template.title);
    if (newWorkflow) {
      onOpenChange(false);
      navigate(`/workflow/${newWorkflow.id}`);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Start with a template or create a blank workflow
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="blank">Blank Workflow</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <template.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{template.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{template.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="blank" className="mt-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCreateBlank}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Blank Workflow</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Start from scratch and build your custom workflow
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCreateBlank} className="w-full">
                  Create Blank Workflow
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
