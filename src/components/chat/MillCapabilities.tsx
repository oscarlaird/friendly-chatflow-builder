
import { WandSparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const MillCapabilities = () => {
  const sections = [
    {
      title: "Web Automation",
      capabilities: [
        "Navigate and interact with websites",
        "Fill forms and submit data",
        "Extract information from web pages",
        "Handle multiple browser tabs"
      ]
    },
    {
      title: "Data Processing",
      capabilities: [
        "Work with spreadsheets and documents",
        "Process and analyze data",
        "Generate reports",
        "Export data in various formats"
      ]
    },
    {
      title: "Integration",
      capabilities: [
        "Connect with various web services",
        "Automate tasks across platforms",
        "Schedule and monitor workflows",
        "Handle API interactions"
      ]
    }
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-6 py-4 text-center">
      <div className="flex items-center gap-2 text-[hsl(var(--dropbox-blue))]">
        <WandSparkles className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Mill's Capabilities</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {sections.map((section) => (
          <Card key={section.title} className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--dropbox-blue))]">
              {section.title}
            </h3>
            <ul className="space-y-2 text-left">
              {section.capabilities.map((capability) => (
                <li key={capability} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Button 
        variant="link" 
        className="text-[hsl(var(--dropbox-blue))] hover:text-[hsl(var(--dropbox-blue))/80%] gap-2"
        onClick={() => window.open('https://docs.lovable.dev/', '_blank')}
      >
        Learn more about Mill's capabilities
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
};
