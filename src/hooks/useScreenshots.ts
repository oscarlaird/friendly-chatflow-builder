import { useState, useEffect } from 'react';

export interface Screenshot {
  roomId: string;
  screenshot: string;
  timestamp: number;
}

export function useScreenshots(roomId?: string | null) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [latestScreenshot, setLatestScreenshot] = useState<Screenshot | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Listen for screenshot messages from extension
  useEffect(() => {
    const handleScreenshotMessage = (event: MessageEvent) => {
      if (
        event.data && 
        event.data.type === 'AGENT_SCREENSHOT_RESPONSE' && 
        event.data.payload
      ) {
        const { roomId: screenshotRoomId, screenshot } = event.data.payload;
        
        // If we're filtering by roomId, only process screenshots for that room
        if (roomId && screenshotRoomId !== roomId) return;
        
        const newScreenshot = {
          roomId: screenshotRoomId,
          screenshot,
          timestamp: Date.now()
        };
        
        setScreenshots(prev => {
          // Keep only last 30 screenshots to prevent memory issues
          const updatedScreenshots = [...prev, newScreenshot].slice(-30);
          return updatedScreenshots;
        });
        
        setLatestScreenshot(newScreenshot);
        setIsCapturing(true);
      }
    };
    
    window.addEventListener('message', handleScreenshotMessage);
    
    return () => {
      window.removeEventListener('message', handleScreenshotMessage);
    };
  }, [roomId]);
  
  // Request a screenshot for a specific room
  const requestScreenshot = (targetRoomId: string) => {
    window.postMessage({
      type: 'REQUEST_AGENT_SCREENSHOT',
      payload: {
        roomId: targetRoomId
      }
    }, '*');
  };
  
  // Clear screenshots for a room
  const clearScreenshots = (targetRoomId?: string) => {
    if (targetRoomId) {
      setScreenshots(prev => prev.filter(s => s.roomId !== targetRoomId));
    } else {
      setScreenshots([]);
    }
    
    if (latestScreenshot && (!targetRoomId || targetRoomId === latestScreenshot.roomId)) {
      setLatestScreenshot(null);
    }
  };

  return {
    screenshots,
    latestScreenshot,
    isCapturing,
    requestScreenshot,
    clearScreenshots
  };
}
