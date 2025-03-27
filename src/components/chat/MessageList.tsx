import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrowserEvent, CoderunEvent, DataState, Message } from '@/types';
import { Card } from '@/components/ui/card';
import { IntroMessage } from './IntroMessage';
import ReactMarkdown from 'react-markdown';
import { WorkflowDisplay } from '../workflow/WorkflowDisplay';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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
        <div ref={contentRef} className="whitespace-pre-wrap overflow-auto max-w-full">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

const CodeRunStateIndicator = ({ state }: { state?: 'running' | 'paused' | 'stopped' }) => {
  if (!state) return null;
  
  const getStateIcon = () => {
    switch (state) {
      case 'running':
        return <Play className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
      case 'stopped':
        return <Square className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStateColor = () => {
    switch (state) {
      case 'running':
        return "bg-green-500 hover:bg-green-600";
      case 'paused':
        return "bg-yellow-500 hover:bg-yellow-600";
      case 'stopped':
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Badge className={`${getStateColor()} flex items-center gap-1`}>
      {getStateIcon()}
      <span className="capitalize">{state}</span>
    </Badge>
  );
};

const CodeRunControls = ({ message }: { message: Message }) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const state = message.code_run_state;

  if (!state || state === 'stopped') return null;

  const updateCodeRunState = async (newState: 'running' | 'paused' | 'stopped') => {
    if (!user || isUpdating) return;

    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('messages')
        .update({ code_run_state: newState })
        .eq('id', message.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: `Workflow ${newState}`,
        description: newState === 'stopped' ? 'The workflow has been stopped.' : 
                    newState === 'paused' ? 'The workflow has been paused.' : 
                    'The workflow has resumed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating workflow state',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {state === 'running' ? (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => updateCodeRunState('paused')}
            disabled={isUpdating}
          >
            <Pause className="h-3.5 w-3.5 mr-1" />
            Pause
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => updateCodeRunState('stopped')}
            disabled={isUpdating}
          >
            <Square className="h-3.5 w-3.5 mr-1" />
            Stop
          </Button>
        </>
      ) : state === 'paused' ? (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => updateCodeRunState('running')}
            disabled={isUpdating}
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            Resume
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => updateCodeRunState('stopped')}
            disabled={isUpdating}
          >
            <Square className="h-3.5 w-3.5 mr-1" />
            Stop
          </Button>
        </>
      ) : null}
    </div>
  );
};

const CodeRunMessageBubble = ({ message, browserEvents }: { 
  message: Message; 
  browserEvents: Record<string, BrowserEvent>;
}) => {
  // Content ref and highlight states
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
  
  // Get browser events associated with this message
  const messageBrowserEvents = Object.values(browserEvents).filter(
    event => event.message_id === message.id
  );
  
  return (
    <div className="flex justify-center mb-4 w-full">
      <Card className={`max-w-[80%] w-full p-4 transition-colors duration-300 ${highlight ? 'ring-2 ring-accent' : ''}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Code Run</h3>
          <CodeRunStateIndicator state={message.code_run_state} />
        </div>
        
        <div ref={contentRef} className="whitespace-pre-wrap mb-4 overflow-x-auto max-w-full">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        {/* Display workflow steps with browser events */}
        {message.steps && message.steps.length > 0 && (
          <div className="w-full overflow-hidden">
            <WorkflowDisplay 
              steps={message.steps.map(step => {
                // Find browser events that match this function
                if (step.function_name) {
                  const functionEvents = messageBrowserEvents.filter(
                    event => event.function_name === step.function_name
                  );
                  if (functionEvents.length > 0) {
                    return {
                      ...step,
                      browserEvents: functionEvents,
                      active: true
                    };
                  }
                }
                return step;
              })}
              compact={true}
              autoActivateSteps={true}
            />
          </div>
        )}
        
        {/* Add code run controls if the message is a running or paused code run */}
        {message.code_run_state && message.code_run_state !== 'stopped' && (
          <CodeRunControls message={message} />
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
        <div ref={contentRef} className="whitespace-pre-wrap mb-2 overflow-auto max-w-full">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {message.screenrecording_url && (
          <div className="mt-2 border-t pt-2">
            <p className="text-sm font-medium mb-1">Screen Recording:</p>
            <p className="text-xs text-muted-foreground truncate">{message.screenrecording_url}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export const MessageList = ({ dataState, loading }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, browserEvents } = dataState;
  
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
            <div className="w-full max-w-full overflow-hidden">
              {messageList.map(renderMessage)}
            </div>
          )}
          <div ref={scrollRef} />
        </>
      )}
    </ScrollArea>
  );
};
