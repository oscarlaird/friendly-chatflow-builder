
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface MillCapabilitiesProps {
  onSelectCapability: (message: string) => void;
}

export const MillCapabilities: React.FC<MillCapabilitiesProps> = ({ onSelectCapability }) => {
  const handleOptionClick = (message: string) => {
    // Only call onSelectCapability once with the selected message
    onSelectCapability(message);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto my-4 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
      <h2 className="text-xl font-semibold mb-4 text-center">Mill can help you with:</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
        <div className="bg-white dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-lg mb-2">Web Automation</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Mill can navigate websites, fill forms, and extract data for you.</p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleOptionClick("I need help with automating a website task. Can you help me navigate and interact with a specific website?")}
          >
            Try Web Automation
          </Button>
        </div>
        
        <div className="bg-white dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-lg mb-2">Data Processing</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Mill can organize, analyze, and transform your data across various formats.</p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleOptionClick("I need help with processing data from spreadsheets. Can you help me organize and analyze some information?")}
          >
            Try Data Processing
          </Button>
        </div>
        
        <div className="bg-white dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-lg mb-2">Work Tools</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Mill can use professional tools like Slack, Notion, Trello, and more.</p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleOptionClick("I need help with using work tools like Trello or Notion. Can you show me how you can interact with these platforms?")}
          >
            Try Work Tools
          </Button>
        </div>
      </div>
      
      <a 
        href="https://docs.mill.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary flex items-center gap-1 text-sm hover:underline"
      >
        Learn more about what Mill can do <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
};
