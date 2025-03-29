
import { CheckCircle, XCircle } from 'lucide-react';
import { useExtensionStatus } from '@/hooks/useExtensionStatus';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export function ExtensionStatus() {
  const { isExtensionInstalled } = useExtensionStatus();
  
  const handleClick = () => {
    if (!isExtensionInstalled) {
      // Replace with actual Chrome Web Store URL when available
      window.open('https://chrome.google.com/webstore/detail/your-extension-id', '_blank');
    }
  };

  if (isExtensionInstalled === null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-auto py-1 px-2">
            <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse" />
            <span className="text-sm whitespace-nowrap">Checking extension...</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Checking extension status...</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button 
      variant="ghost" 
      className="flex items-center gap-2 h-auto py-1 px-2" 
      onClick={handleClick}
    >
      {isExtensionInstalled ? (
        <>
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm whitespace-nowrap">Extension Installed</span>
        </>
      ) : (
        <>
          <XCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm whitespace-nowrap">Extension Not Installed</span>
        </>
      )}
    </Button>
  );
}
