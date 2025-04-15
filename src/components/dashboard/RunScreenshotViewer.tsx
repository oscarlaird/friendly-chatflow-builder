
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Loader2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RunScreenshotViewerProps {
  chatId?: string;
  className?: string;
  onClick?: () => void;
  isInteractive?: boolean;
}

export const RunScreenshotViewer = ({ chatId, className, onClick, isInteractive = true }: RunScreenshotViewerProps) => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const screenshotInterval = useRef<NodeJS.Timeout | null>(null);
  const requestId = useRef<number>(0);

  const startScreenshotRequests = () => {
    // Clear any existing interval
    if (screenshotInterval.current) {
      clearInterval(screenshotInterval.current);
    }

    // Request screenshots every 300ms
    screenshotInterval.current = setInterval(() => {
      const currentRequestId = ++requestId.current;
      window.postMessage({
        type: 'REQUEST_AGENT_SCREENSHOT',
        payload: { roomId: chatId }
      }, '*');
    }, 300);
  };

  const stopScreenshotRequests = () => {
    if (screenshotInterval.current) {
      clearInterval(screenshotInterval.current);
      screenshotInterval.current = null;
    }
  };

  useEffect(() => {
    if (!chatId) {
      setScreenshot(null);
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'AGENT_SCREENSHOT_RESPONSE' && 
          event.data.payload?.roomId === chatId && 
          event.data.payload?.screenshot) {
        setScreenshot(event.data.payload.screenshot);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Start requesting screenshots if we have a chatId
    if (chatId) {
      startScreenshotRequests();
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      stopScreenshotRequests();
    };
  }, [chatId]);

  if (!screenshot) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-md",
        className
      )}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const previewContent = (
    <div className="relative group">
      <img 
        src={screenshot} 
        alt="Agent View" 
        className={cn(
          "w-full h-full object-contain rounded-md",
          isInteractive && "cursor-pointer"
        )}
      />
      {isInteractive && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );

  if (!isInteractive) {
    return previewContent;
  }

  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className={className}>
        {previewContent}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <div className="w-full h-full flex items-center justify-center p-4">
            <img 
              src={screenshot} 
              alt="Agent View" 
              className="max-w-full max-h-full object-contain rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
