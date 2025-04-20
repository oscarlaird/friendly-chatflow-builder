
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
  instructions: string;
  script: string | null;
  steps: any; // Changed from any[] to any to support Json type from Supabase
  requires_browser: boolean;
  apps: string[] | null;
  created_at: string;
}

interface WorkflowGalleryProps {
  onSelectTemplate: (template: Template) => void;
}

export function WorkflowGallery({ onSelectTemplate }: WorkflowGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTemplates() {
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
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">No templates available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="overflow-hidden card-hover">
          <CardHeader className="pb-2">
            <div className="text-3xl mb-2">{template.icon || '📝'}</div>
            <CardTitle>{template.title}</CardTitle>
            <CardDescription>{template.description || 'No description available'}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full justify-between mt-2"
              onClick={() => onSelectTemplate(template)}
            >
              Use template
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
