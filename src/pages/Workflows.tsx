
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { WorkflowList } from '@/components/workflow/WorkflowList';
import { WorkflowTemplateDialog } from '@/components/workflow/WorkflowTemplateDialog';
import { Plus } from 'lucide-react';

export default function Workflows() {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Workflows</h1>
          <Button onClick={() => setTemplateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
        
        <WorkflowList />
        
        <WorkflowTemplateDialog 
          open={templateDialogOpen} 
          onOpenChange={setTemplateDialogOpen} 
        />
      </div>
    </Layout>
  );
}
