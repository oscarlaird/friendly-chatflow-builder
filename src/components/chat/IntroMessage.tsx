
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WandSparkles } from 'lucide-react';
import { MillCapabilities } from './MillCapabilities';

export const IntroMessage = () => {
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "I am Mill, your AI assistant. I can help you automate your workflows and make your work more efficient. Tell me what you'd like to automate.";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30); // Adjust speed of typing

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="bg-background p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative w-10 h-10">
            {/* Geometric logo - overlapping shapes with tinted blue theme */}
            <div className="absolute top-0 left-0 w-8 h-8 bg-[hsl(var(--dropbox-blue))/80%] rounded-sm transform rotate-45"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[hsl(var(--dropbox-blue))/90%] rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-12"></div>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold text-[hsl(var(--dropbox-blue))]">
              {displayedText}
            </p>
            {!showCapabilities && (
              <Button
                variant="outline"
                className="mt-4 text-[hsl(var(--dropbox-blue))] border-[hsl(var(--dropbox-blue))/30%] hover:bg-[hsl(var(--dropbox-blue))/10%]"
                onClick={() => setShowCapabilities(true)}
              >
                <WandSparkles className="mr-2 h-4 w-4" />
                View Mill's Capabilities
              </Button>
            )}
          </div>
        </div>
        
        {showCapabilities && <MillCapabilities />}
      </div>
    </div>
  );
};
