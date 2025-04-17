
import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { RecentRuns } from '@/components/dashboard/RecentRuns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { WorkflowList } from '@/components/workflow/WorkflowList';
import { WorkflowTemplateGallery } from '@/components/workflow/WorkflowTemplateGallery';
import { useChats } from '@/hooks/useChats';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const { createChat } = useChats();
  const navigate = useNavigate();

  const handleTemplateSelect = async (templateId: string | null) => {
    try {
      // Create a blank workflow for now
      const newChat = await createChat('New Workflow');
      
      if (newChat) {
        console.log('Created new workflow with ID:', newChat.id);
        setTemplateGalleryOpen(false);
        navigate(`/workflow/${newChat.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  // Show skeleton if auth is loading
  if (authLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-7 w-40 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-muted rounded"></div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-7 w-40 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-muted rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // If not logged in, show login page
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Workflows</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => navigate('/workflows')}
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="gap-1 bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue))/90%]"
                  onClick={() => setTemplateGalleryOpen(true)}
                >
                  <FilePlus className="h-4 w-4" />
                  New Workflow
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <WorkflowList className="grid grid-cols-1 gap-4" />
            </CardContent>
          </Card>

          <RecentRuns />
        </div>

        <WorkflowTemplateGallery 
          open={templateGalleryOpen}
          onOpenChange={setTemplateGalleryOpen}
          onSelectTemplate={handleTemplateSelect}
        />
      </div>
    </Layout>
  );
}
