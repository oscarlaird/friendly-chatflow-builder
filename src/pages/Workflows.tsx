
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { WorkflowList } from '@/components/workflow/WorkflowList';
import { WorkflowTemplateGallery } from '@/components/workflow/WorkflowTemplateGallery';
import { Plus } from 'lucide-react';
import { useChats } from '@/hooks/useChats';
import { useAuth } from '@/hooks/useAuth';

export default function Workflows() {
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const { createChat } = useChats();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTemplateSelect = async (templateId: string | null) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const newChat = await createChat('New Workflow');
      
      if (newChat) {
        console.log('Created new workflow with ID:', newChat.id);
        setTemplateGalleryOpen(false);
        
        navigate(`/workflow/${newChat.id}`);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Workflows</h1>
          <Button 
            onClick={() => setTemplateGalleryOpen(true)}
            className="bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue))/90%]"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
        
        <WorkflowList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
        
        <WorkflowTemplateGallery 
          open={templateGalleryOpen}
          onOpenChange={setTemplateGalleryOpen}
          onSelectTemplate={handleTemplateSelect}
        />
      </div>
    </Layout>
  );
}
