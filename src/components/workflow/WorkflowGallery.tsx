
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: 'crm-qualification',
    title: 'CRM Qualification',
    description: 'Automatically qualify leads in your CRM based on predefined criteria',
    icon: '🔍',
    prompt: 'Create a workflow that qualifies new CRM leads based on company size, industry, and budget'
  },
  {
    id: 'email-outreach',
    title: 'Email Outreach',
    description: 'Automate email campaigns with personalized follow-ups',
    icon: '✉️',
    prompt: 'Build an email outreach workflow with 3 follow-up emails and lead scoring'
  },
  {
    id: 'content-calendar',
    title: 'Content Calendar',
    description: 'Manage your content pipeline from ideation to publication',
    icon: '📅',
    prompt: 'Create a content calendar workflow with approval steps and publication scheduling'
  },
  {
    id: 'support-ticket',
    title: 'Support Ticket Routing',
    description: 'Route support tickets to the right team based on content analysis',
    icon: '🎫',
    prompt: 'Build a workflow that routes support tickets to the correct team based on content analysis'
  },
  {
    id: 'social-monitoring',
    title: 'Social Media Monitoring',
    description: 'Monitor and respond to social media mentions automatically',
    icon: '📱',
    prompt: 'Create a workflow that monitors social media for brand mentions and suggests responses'
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis Pipeline',
    description: 'Process and analyze data from multiple sources',
    icon: '📊',
    prompt: 'Build a data analysis workflow that processes CSV files and generates reports'
  }
];

interface WorkflowGalleryProps {
  onSelectTemplate: (prompt: string) => void;
}

export function WorkflowGallery({ onSelectTemplate }: WorkflowGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {galleryItems.map((item) => (
        <Card key={item.id} className="overflow-hidden card-hover">
          <CardHeader className="pb-2">
            <div className="text-3xl mb-2">{item.icon}</div>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full justify-between mt-2"
              onClick={() => onSelectTemplate(item.prompt)}
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
