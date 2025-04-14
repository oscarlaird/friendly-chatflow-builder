
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { WorkflowList } from '@/components/workflow/WorkflowList';
import { WorkflowTemplateGallery } from '@/components/workflow/WorkflowTemplateGallery';
import { Plus } from 'lucide-react';
import { useChats } from '@/hooks/useChats';

export default function Workflows() {
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const { createChat } = useChats();
  const navigate = useNavigate();

  const handleTemplateSelect = async (templateId: string | null) => {
    try {
      // For now, create a blank workflow regardless of template selection
      const newChat = await createChat('New Workflow');
      
      if (newChat) {
        console.log('Created new workflow with ID:', newChat.id);
        setTemplateGalleryOpen(false);
        
        // Force navigation to the new workflow
        // Use replace instead of push to avoid navigation stack issues
        navigate(`/workflow/${newChat.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Workflows</h1>
          <Button onClick={() => setTemplateGalleryOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
        
        <WorkflowList />
        
        <WorkflowTemplateGallery 
          open={templateGalleryOpen}
          onOpenChange={setTemplateGalleryOpen}
          onSelectTemplate={handleTemplateSelect}
        />
      </div>
    </Layout>
  );
}
