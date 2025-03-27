import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrowserEvent, CoderunEvent, DataState, Message } from '@/types';
import { Card } from '@/components/ui/card';
import { IntroMessage } from './IntroMessage';
import ReactMarkdown from 'react-markdown';
import { Globe } from 'lucide-react';
import { WorkflowDisplay } from '../workflow/WorkflowDisplay';

interface MessageListProps {
  dataState: DataState;
  loading: boolean;
}

const TextMessageBubble = ({ message }: { message: Message }) => {
  // Add a ref to track content changes for highlighting
  const contentRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);
  
  // Highlight content when it changes
  useEffect(() => {
    if (contentRef.current) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message.content]);
  
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 transition-colors duration-300 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        } ${highlight ? 'ring-2 ring-accent' : ''}`}
      >
        <div ref={contentRef} className="whitespace-pre-wrap">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

const BrowserEventItem = ({ event }: { event: BrowserEvent }) => {
  // Extract domain from URL for favicon
  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=16`;
    } catch (e) {
      return null;
    }
  };

  const browserState = event?.data?.browser_state;
  const currentGoal = event?.data?.current_goal;
  const faviconUrl = browserState?.url ? getFaviconUrl(browserState.url) : null;

  return (
    <div className="flex items-center gap-2 text-xs py-1 px-2 border-b border-muted/40 last:border-0">
      {faviconUrl ? (
        <img src={faviconUrl} alt="site favicon" className="w-4 h-4 flex-shrink-0" />
      ) : (
        <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      )}
      <span className="truncate">{currentGoal || 'Browser action'}</span>
    </div>
  );
};

const CodeRunMessageBubble = ({ message, coderunEvents, browserEvents }: { 
  message: Message; 
  coderunEvents: Record<string, CoderunEvent>;
  browserEvents: Record<string, BrowserEvent>;
}) => {
  // Add a ref to track content changes for highlighting
  const contentRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);
  
  // Highlight content when it changes
  useEffect(() => {
    if (contentRef.current) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message.content]);
  
  return (
    <div className="flex justify-center mb-4">
      <Card className={`max-w-[80%] p-4 transition-colors duration-300 ${highlight ? 'ring-2 ring-accent' : ''}`}>
        <div ref={contentRef} className="whitespace-pre-wrap mb-4">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        {/* Display workflow steps, input and output using the new WorkflowDisplay component */}
        {message.steps && message.steps.length > 0 && (
          <div className="mb-4">
            <WorkflowDisplay steps={message.steps} compact={true} />
          </div>
        )}
        
        {message.coderunEvents && message.coderunEvents.length > 0 && (
          <div className="mt-2 border-t pt-2">
            <p className="text-sm font-medium mb-1">Code Run Events:</p>
            {message.coderunEvents.map(eventId => {
              const event = coderunEvents[eventId];
              return (
                <div key={eventId} className="pl-2 border-l-2 border-muted-foreground/30 mb-2">
                  <p className="text-xs text-muted-foreground">
                    {event?.description || 'Code execution'} 
                    {event?.progress_title && ` - ${event.progress_title}`}
                  </p>
                  
                  {event?.browserEvents && event.browserEvents.length > 0 && (
                    <div className="mt-1">
                      <div className="border rounded-sm text-xs overflow-hidden max-h-36">
                        {event.browserEvents.map(beId => {
                          const browserEvent = browserEvents[beId];
                          return browserEvent ? (
                            <BrowserEventItem key={beId} event={browserEvent} />
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

const ScreenRecordingBubble = ({ message }: { message: Message }) => {
  // Add a ref to track content changes for highlighting
  const contentRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);
  
  // Highlight content when it changes
  useEffect(() => {
    if (contentRef.current) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message.content]);
  
  return (
    <div className="flex justify-start mb-4">
      <Card className={`max-w-[80%] p-4 transition-colors duration-300 ${highlight ? 'ring-2 ring-accent' : ''}`}>
        <div ref={contentRef} className="whitespace-pre-wrap mb-2">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {message.screenrecording_url && (
          <div className="mt-2 border-t pt-2">
            <p className="text-sm font-medium mb-1">Screen Recording:</p>
            <p className="text-xs text-muted-foreground">{message.screenrecording_url}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export const MessageList = ({ dataState, loading }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, coderunEvents, browserEvents } = dataState;
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [Object.keys(messages).length, messages]);

  const messageList = Object.values(messages).sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'text_message':
        return <TextMessageBubble key={message.id} message={message} />;
      case 'code_run':
        return (
          <CodeRunMessageBubble 
            key={message.id}
            message={message}
            coderunEvents={coderunEvents}
            browserEvents={browserEvents}
          />
        );
      case 'screen_recording':
        return <ScreenRecordingBubble key={message.id} message={message} />;
      default:
        return <TextMessageBubble key={message.id} message={message} />;
    }
  };

  return (
    <ScrollArea className="h-full w-full px-4 py-6">
      {loading ? (
        <div className="flex items-center justify-center h-20">
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      ) : (
        <>
          <IntroMessage />
          {messageList.length === 0 ? (
            <div className="flex justify-center mt-6">
              <p className="text-muted-foreground text-sm">Send a message to start the conversation</p>
            </div>
          ) : (
            messageList.map(renderMessage)
          )}
          <div ref={scrollRef} />
        </>
      )}
    </ScrollArea>
  );
};
