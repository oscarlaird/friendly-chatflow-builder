
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { OAuthIcon } from '@/components/ui/oauth-icons';
import { 
  Globe2, 
  BookOpenCheck,
  Chrome,
  ExternalLink,
  LayoutPanelLeft
} from 'lucide-react';

const StreamingMessage = ({ content, delay }: { content: string, delay: number }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= content.length) {
        setDisplayedContent(content.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 30); // Adjust speed of typing

    return () => clearInterval(interval);
  }, [content]);

  return (
    <div className={`transition-opacity duration-500 ${isComplete ? 'opacity-100' : 'opacity-90'}`}>
      {displayedContent}
    </div>
  );
};

const IntroMessageOne = () => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-primary mb-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-full bg-primary/10">
        <Globe2 className="h-6 w-6 text-primary" />
      </div>
      <StreamingMessage 
        content="I can interact with websites and SaaS tools" 
        delay={0} 
      />
    </div>
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 mt-4 items-center">
      <Chrome className="h-6 w-6 text-blue-500" aria-label="Chrome" />
      <Icons.salesforce className="h-6 w-6 text-[#00A1E0]" aria-label="Salesforce" />
      <Icons.linkedin className="h-6 w-6 text-[#0A66C2]" aria-label="LinkedIn" />
      <Icons.google className="h-6 w-6 text-[#4285F4]" aria-label="Google" />
      <Icons.yahoo className="h-6 w-6 text-[#6001D2]" aria-label="Yahoo" />
      <Icons.bloomberg className="h-6 w-6 text-black" aria-label="Bloomberg" />
      <Icons.hackernews className="h-6 w-6 text-[#FF6600]" aria-label="Hacker News" />
    </div>
  </Card>
);

const IntroMessageTwo = () => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-green-500 mb-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-full bg-green-500/10">
        <BookOpenCheck className="h-6 w-6 text-green-500" />
      </div>
      <StreamingMessage 
        content="I can integrate directly with these tools" 
        delay={1500}
      />
    </div>
    <div className="flex gap-6 mt-4 items-center">
      <div className="flex items-center gap-2">
        <OAuthIcon provider="google_sheets" size={24} />
        <span className="text-sm font-medium">Google Sheets</span>
      </div>
      <div className="flex items-center gap-2">
        <OAuthIcon provider="gmail" size={24} />
        <span className="text-sm font-medium">Gmail</span>
      </div>
    </div>
  </Card>
);

const IntroMessageThree = () => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-blue-500">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-full bg-blue-500/10">
        <LayoutPanelLeft className="h-6 w-6 text-blue-500" />
      </div>
      <StreamingMessage 
        content="I can build and run workflows in a new browser window" 
        delay={3000}
      />
    </div>
    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
      <ExternalLink className="h-4 w-4" />
      <span>I'll handle your tasks in a dedicated browser window</span>
    </div>
  </Card>
);

export const IntroMessage = () => {
  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowSecond(true), 2000);
    const timer2 = setTimeout(() => setShowThird(true), 4000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="flex flex-col items-start space-y-2 animate-fade-in">
      <IntroMessageOne />
      {showSecond && <IntroMessageTwo />}
      {showThird && <IntroMessageThree />}
    </div>
  );
};
