import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Icons } from '@/components/ui/icons';

// StreamingMessage component for when we want the typing effect
const StreamingMessage = ({ content, delay, onComplete, shouldStream = true }: { 
  content: string;
  delay: number;
  onComplete?: () => void;
  shouldStream?: boolean;
}) => {
  const [displayedContent, setDisplayedContent] = useState(shouldStream ? '' : content);
  const [isComplete, setIsComplete] = useState(!shouldStream);

  useEffect(() => {
    if (!shouldStream) return;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= content.length) {
        setDisplayedContent(content.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [content, onComplete, shouldStream]);

  return (
    <div className={`transition-opacity duration-500 ${isComplete ? 'opacity-100' : 'opacity-90'}`}>
      {displayedContent}
    </div>
  );
};

const IntroMessageOne = ({ showIcons, shouldStream }: { showIcons: boolean, shouldStream: boolean }) => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-primary mb-4">
    <div className="space-y-4">
      <StreamingMessage 
        content="Hi there! I can interact with websites and SaaS tools" 
        delay={0}
        shouldStream={shouldStream}
      />
      <div className={`grid grid-cols-7 gap-4 items-center transition-opacity duration-500 ${showIcons ? 'opacity-100' : 'opacity-0'}`}>
        <Icons.google className="h-6 w-6 text-[#4285F4]" />
        <Icons.salesforce className="h-6 w-6 text-[#00A1E0]" />
        <Icons.linkedin className="h-6 w-6 text-[#0A66C2]" />
        <Icons.bloomberg className="h-6 w-6 text-[#000000]" />
        <Icons.hackernews className="h-6 w-6 text-[#FF6600]" />
        <Icons.yahoo className="h-6 w-6 text-[#720E9E]" />
        <img src="https://gmail.com/favicon.ico" alt="Gmail" className="h-6 w-6" />
      </div>
    </div>
  </Card>
);

const IntroMessageTwo = ({ shouldStream }: { shouldStream: boolean }) => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-green-500 mb-4">
    <StreamingMessage 
      content="I can integrate directly with these tools" 
      delay={1500}
      shouldStream={shouldStream}
    />
    <div className="flex gap-6 mt-4 items-center">
      <div className="flex items-center gap-2">
        <img src="https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico" alt="Google Sheets" className="h-6 w-6" />
        <span className="text-sm font-medium">Google Sheets</span>
      </div>
      <div className="flex items-center gap-2">
        <img src="https://gmail.com/favicon.ico" alt="Gmail" className="h-6 w-6" />
        <span className="text-sm font-medium">Gmail</span>
      </div>
    </div>
  </Card>
);

const IntroMessageThree = ({ shouldStream }: { shouldStream: boolean }) => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-blue-500">
    <StreamingMessage 
      content="I can build workflows which you can run, I will open a new browser window and work within that window to finish your task." 
      delay={3000}
      shouldStream={shouldStream}
    />
    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
      <ExternalLink className="h-4 w-4" />
      <span>I'll handle your tasks in a dedicated browser window</span>
    </div>
  </Card>
);

export const IntroMessage = ({ hasExistingMessages = false }) => {
  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);
  const [showIcons, setShowIcons] = useState(false);

  useEffect(() => {
    // If there are existing messages, show everything immediately
    if (hasExistingMessages) {
      setShowSecond(true);
      setShowThird(true);
      setShowIcons(true);
      return;
    }

    // Otherwise, use the animated timing
    const timer1 = setTimeout(() => setShowSecond(true), 2000);
    const timer2 = setTimeout(() => setShowThird(true), 4000);
    const timer3 = setTimeout(() => setShowIcons(true), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [hasExistingMessages]);

  return (
    <div className="flex flex-col items-start space-y-2 animate-fade-in">
      <IntroMessageOne showIcons={showIcons} shouldStream={!hasExistingMessages} />
      {(showSecond || hasExistingMessages) && <IntroMessageTwo shouldStream={!hasExistingMessages} />}
      {(showThird || hasExistingMessages) && <IntroMessageThree shouldStream={!hasExistingMessages} />}
    </div>
  );
};
