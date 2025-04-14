
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Table2, Users, Database } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const templates: Template[] = [
  {
    id: 'instagram',
    title: 'Instagram Messaging from Sheet',
    description: 'Automatically send Instagram messages using data from a spreadsheet',
    icon: Table2,
  },
  {
    id: 'research',
    title: 'Research Companies',
    description: 'Gather and analyze company information from multiple sources',
    icon: Users,
  },
  {
    id: 'salesforce',
    title: 'Update Salesforce CRM',
    description: 'Bulk update contacts and leads in Salesforce',
    icon: Database,
  },
];

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <template.icon className="h-5 w-5" />
                    <CardTitle className="text-base">{template.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{template.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
