
import { CheckCircle, XCircle } from 'lucide-react';
import { useExtensionStatus } from '@/hooks/useExtensionStatus';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export function ExtensionStatus() {
  const { isExtensionInstalled } = useExtensionStatus();
  
  const handleClick = () => {
    if (!isExtensionInstalled) {
      // Open the Chrome Web Store in a new tab
      let ext_install_instructions_google_doc = "https://docs.google.com/document/d/1bsP5nc0KAeq-IRD2v9RoYBVWd-hz2NtbbBRNUPbn4l4/edit?tab=t.0";
      // window.open('https://chrome.google.com/webstore/detail/your-extension-id', '_blank');
      window.open(ext_install_instructions_google_doc, '_blank');
      
      // Also download the extension.zip file
      const downloadLink = document.createElement('a');
      downloadLink.href = '/extension.zip';
      downloadLink.download = 'extension.zip';
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (isExtensionInstalled === null) {
    return (
      <TooltipProvider>
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
      </TooltipProvider>
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
