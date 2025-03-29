
import { CheckCircle, XCircle } from 'lucide-react';
import { useExtensionStatus } from '@/hooks/useExtensionStatus';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ExtensionStatus() {
  const { isExtensionInstalled } = useExtensionStatus();

  if (isExtensionInstalled === null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Checking extension status...</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center">
          {isExtensionInstalled ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isExtensionInstalled ? 'Extension installed' : 'Extension not installed'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
