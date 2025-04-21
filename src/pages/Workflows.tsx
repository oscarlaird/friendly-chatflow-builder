
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { WorkflowList } from '@/components/workflow/WorkflowList';
import { WorkflowTemplateGallery } from '@/components/workflow/WorkflowTemplateGallery';
import { Plus } from 'lucide-react';
import { useChats } from '@/hooks/useChats';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RequestWorkflowModal } from "@/components/workflow/RequestWorkflowModal";

export default function Workflows() {
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const { createChat, chats, loading } = useChats();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Open template gallery if user has no workflows and not loading
  useEffect(() => {
    if (!loading && user && chats.length === 0) {
      setTemplateGalleryOpen(true);
    }
  }, [chats, loading, user]);

  const handleTemplateSelect = async (templateId: string | null) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!templateId) {
      try {
        const newChat = await createChat('New Workflow');
        if (newChat) {
          setTemplateGalleryOpen(false);
          navigate(`/workflow/${newChat.id}`);
        }
      } catch (error) {
        console.error('Error creating workflow:', error);
      }
      return;
    }

    try {
      const { data: template, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .maybeSingle();

      if (error) throw error;
      if (!template) {
        console.warn("Template not found");
        return;
      }
      
      const newChat = await createChat(template.title);
      if (newChat) {
        await supabase
          .from('chats')
          .update({
            script: template.script,
            steps: template.steps,
            apps: template.apps,
            requires_browser: template.requires_browser,
            requires_code_rewrite: false, // force false on chat creation from template
          })
          .eq('id', newChat.id);

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
    } catch (error) {
      console.error('Error creating workflow from template:', error);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold">Workflows</h1>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setTemplateGalleryOpen(true)}
              className="bg-[hsl(var(--dropbox-blue))] hover:bg-[hsl(var(--dropbox-blue))/90%]"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
            <Button 
              onClick={() => setRequestModalOpen(true)}
              variant="outline"
            >
              Request Workflow
            </Button>
          </div>
        </div>
        <WorkflowList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
        <WorkflowTemplateGallery 
          open={templateGalleryOpen}
          onOpenChange={setTemplateGalleryOpen}
          onSelectTemplate={handleTemplateSelect}
        />
        <RequestWorkflowModal
          open={requestModalOpen}
          onOpenChange={setRequestModalOpen}
        />
      </div>
    </Layout>
  );
}
