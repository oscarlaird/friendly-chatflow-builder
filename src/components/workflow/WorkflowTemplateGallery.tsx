
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
  instructions: string;
  script: string | null;
  steps: any[] | null;
  requires_browser: boolean;
  apps: string[] | null;
  created_at: string;
}

interface WorkflowTemplateGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templateId: string | null) => Promise<void>;
}

export function WorkflowTemplateGallery({
  open,
  onOpenChange,
  onSelectTemplate,
}: WorkflowTemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTemplates() {
      if (!open) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setTemplates(data || []);
      } catch (error: any) {
        console.error('Error fetching templates:', error);
        toast({
          title: 'Error fetching templates',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [open, toast]);

  // Prevent gallery from closing automatically when template is selected
  const handleTemplateSelect = async (templateId: string | null) => {
    // Don't close the dialog here - let the parent component handle it
    // after successful workflow creation
    try {
      await onSelectTemplate(templateId);
    } catch (error) {
      console.error('Error selecting template:', error);
      // Only close on error to prevent flashing UI
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a template or create a blank workflow
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="justify-start h-auto p-4"
            onClick={() => handleTemplateSelect(null)}
          >
            <FileText className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Blank Workflow</div>
              <div className="text-sm text-muted-foreground">
                Start from scratch with an empty workflow
              </div>
            </div>
          </Button>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">No templates available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="text-xl">{template.icon || '📝'}</div>
                      <CardTitle className="text-base">{template.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{template.description || 'No description available'}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
