import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Chrome, ExternalLink, Globe2, 
  BookOpenCheck,
} from 'lucide-react';
import { Icons } from '@/components/ui/icons';

const StreamingMessage = ({ content, delay, onComplete, skipAnimation }: { 
  content: string;
  delay: number;
  onComplete?: () => void;
  skipAnimation?: boolean;
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (skipAnimation) {
      setDisplayedContent(content);
      setIsComplete(true);
      onComplete?.();
      return;
    }

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
  }, [content, onComplete, skipAnimation]);

  return (
    <div className={`transition-opacity duration-500 ${isComplete ? 'opacity-100' : 'opacity-90'}`}>
      {displayedContent}
    </div>
  );
};

const IntroMessageOne = ({ showIcons, skipAnimation }: { showIcons: boolean, skipAnimation: boolean }) => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-primary mb-4">
    <div className="space-y-4">
      <StreamingMessage 
        content="Hi there! I can interact with websites and SaaS tools" 
        delay={0}
        skipAnimation={skipAnimation}
      />
      <div className={`grid grid-cols-4 sm:grid-cols-7 gap-4 items-center transition-opacity duration-500 ${showIcons ? 'opacity-100' : 'opacity-0'}`}>
        <Icons.google size={24} />
        <Icons.salesforce size={24} />
        <Icons.linkedin size={24} />
        <Icons.bloomberg size={24} />
        <Icons.hackernews size={24} />
        <Icons.yahoo size={24} />
        {/* Gmail icon */}
        <Icons.mail size={24} />
      </div>
    </div>
  </Card>
);

const IntroMessageTwo = ({ skipAnimation }: { skipAnimation: boolean }) => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-green-500 mb-4">
    <StreamingMessage 
      content="I can integrate directly with these tools" 
      delay={1500}
      skipAnimation={skipAnimation}
    />
    <div className="flex gap-6 mt-4 items-center">
      <div className="flex items-center gap-2">
        <Icons.fileSpreadsheet size={24} />
        <span className="text-sm font-medium">Google Sheets</span>
      </div>
      <div className="flex items-center gap-2">
        <Icons.mail size={24} />
        <span className="text-sm font-medium">Gmail</span>
      </div>
    </div>
  </Card>
);

const IntroMessageThree = ({ skipAnimation }: { skipAnimation: boolean }) => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-blue-500">
    <StreamingMessage 
      content="I can build workflows which you can run, I will open a new browser window and work within that window to finish your task." 
      delay={3000}
      skipAnimation={skipAnimation}
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
      <IntroMessageOne showIcons={showIcons} skipAnimation={hasExistingMessages} />
      {showSecond && <IntroMessageTwo skipAnimation={hasExistingMessages} />}
      {showThird && <IntroMessageThree skipAnimation={hasExistingMessages} />}
    </div>
  );
};
