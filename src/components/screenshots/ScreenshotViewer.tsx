
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Maximize2, Pause, Play } from "lucide-react";
import { Screenshot } from '@/hooks/useScreenshots';
import { cn } from '@/lib/utils';

interface ScreenshotViewerProps {
  screenshots: Screenshot[];
  latestScreenshot: Screenshot | null;
  isRunning?: boolean;
  title?: string;
  autoRequest?: boolean;
  onRequestScreenshot?: () => void;
  className?: string;
  compact?: boolean;
}

export function ScreenshotViewer({
  screenshots,
  latestScreenshot,
  isRunning = false,
  title = "Live View",
  autoRequest = false,
  onRequestScreenshot,
  className,
  compact = false
}: ScreenshotViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Auto-request screenshots when running
  useEffect(() => {
    if (!autoRequest || !isRunning || !onRequestScreenshot || isPaused) return;
    
    const interval = setInterval(() => {
      onRequestScreenshot();
    }, 500); // Request every 500ms
    
    return () => clearInterval(interval);
  }, [autoRequest, isRunning, onRequestScreenshot, isPaused]);
  
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Render empty state if no screenshots
  if (!latestScreenshot) {
    return compact ? null : (
      <Card className={cn("overflow-hidden", className)}>
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <CardContent className="p-4 flex items-center justify-center min-h-[200px] text-muted-foreground">
          No screenshots available
        </CardContent>
      </Card>
    );
  }
  
  const screenshotDisplay = (
    <div className={cn("relative w-full", isRunning && !isPaused && "border-pulse")}>
      <img 
        src={latestScreenshot.screenshot} 
        alt="Screenshot" 
        className="w-full h-auto rounded" 
      />
      <div className="absolute bottom-2 right-2 flex gap-1">
        <Button 
          variant="secondary" 
          size="icon" 
          className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          onClick={togglePause}
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  // For compact view, just return the screenshot with controls
  if (compact) {
    return (
      <div className={cn("relative", className)}>
        {screenshotDisplay}
      </div>
    );
  }
  
  return (
    <>
      <Card className={cn("overflow-hidden", className)}>
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="text-xs text-muted-foreground">
            {screenshots.length} frames captured
          </div>
        </div>
        <CardContent className="p-0">
          {screenshotDisplay}
        </CardContent>
      </Card>

      {/* Fullscreen modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-4xl p-0 border-0 bg-black/95">
          <DialogHeader className="p-4 flex-row justify-between items-center">
            <DialogTitle className="text-white">{title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)} className="text-white">
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="p-4">
            <img 
              src={latestScreenshot.screenshot} 
              alt="Screenshot" 
              className="w-full h-auto rounded" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
