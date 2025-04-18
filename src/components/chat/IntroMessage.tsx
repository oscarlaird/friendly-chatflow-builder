import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Chrome, ExternalLink, LayoutPanelLeft, Globe2, 
  BookOpenCheck,
} from 'lucide-react';

const StreamingMessage = ({ content, delay, onComplete }: { 
  content: string;
  delay: number;
  onComplete?: () => void;
}) => {
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
        onComplete?.();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [content, onComplete]);

  return (
    <div className={`transition-opacity duration-500 ${isComplete ? 'opacity-100' : 'opacity-90'}`}>
      {displayedContent}
    </div>
  );
};

const IntroMessageOne = ({ showIcons }: { showIcons: boolean }) => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-primary mb-4">
    <div className="space-y-4">
      <StreamingMessage 
        content="Hi there! I can interact with websites and SaaS tools" 
        delay={0} 
      />
      <div className={`grid grid-cols-4 sm:grid-cols-7 gap-4 items-center transition-opacity duration-500 ${showIcons ? 'opacity-100' : 'opacity-0'}`}>
        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-6 w-6" />
        <img src="https://www.salesforce.com/favicon.ico" alt="Salesforce" className="h-6 w-6" />
        <img src="https://www.linkedin.com/favicon.ico" alt="LinkedIn" className="h-6 w-6" />
        <img src="https://www.bloomberg.com/favicon.ico" alt="Bloomberg" className="h-6 w-6" />
        <img src="https://news.ycombinator.com/favicon.ico" alt="Hacker News" className="h-6 w-6" />
        <img src="https://www.yahoo.com/favicon.ico" alt="Yahoo" className="h-6 w-6" />
        <img src="https://gmail.com/favicon.ico" alt="Gmail" className="h-6 w-6" />
      </div>
    </div>
  </Card>
);

const IntroMessageTwo = () => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-green-500 mb-4">
    <StreamingMessage 
      content="I can integrate directly with these tools" 
      delay={1500}
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

const IntroMessageThree = () => (
  <Card className="max-w-[85%] p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-blue-500">
    <StreamingMessage 
      content="I can build workflows which you can run, I will open a new browser window and work within that window to finish your task." 
      delay={3000}
    />
    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
      <ExternalLink className="h-4 w-4" />
      <span>I'll handle your tasks in a dedicated browser window</span>
    </div>
  </Card>
);

export const IntroMessage = () => {
  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);
  const [showIcons, setShowIcons] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowSecond(true), 2000);
    const timer2 = setTimeout(() => setShowThird(true), 4000);
    const timer3 = setTimeout(() => setShowIcons(true), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="flex flex-col items-start space-y-2 animate-fade-in">
      <IntroMessageOne showIcons={showIcons} />
      {showSecond && <IntroMessageTwo />}
      {showThird && <IntroMessageThree />}
    </div>
  );
};
