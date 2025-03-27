
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight, ExternalLink, Globe } from "lucide-react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BrowserEvent } from "@/types";

interface WorkflowStepProps {
  stepNumber: number;
  functionName: string;
  description: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  requiresBrowser?: boolean;
  isLast?: boolean;
  active?: boolean;
  autoOpen?: boolean;
  browserEvents?: BrowserEvent[];
}

// Helper function to format function name
const formatFunctionName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Browser event item component
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

export const WorkflowStep = ({
  stepNumber,
  functionName,
  description,
  input,
  output,
  requiresBrowser = false,
  isLast = false,
  active = false,
  autoOpen = false,
  browserEvents = [],
}: WorkflowStepProps) => {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [isBrowserEventsOpen, setIsBrowserEventsOpen] = useState(false);
  
  const hasInput = input && Object.keys(input).length > 0;
  const hasOutput = output && Object.keys(output).length > 0;
  const hasBrowserEvents = browserEvents && browserEvents.length > 0;
  
  // Auto-open sections based on active status and autoOpen prop
  useEffect(() => {
    if (active && autoOpen) {
      setIsInputOpen(true);
      setIsOutputOpen(true);
      setIsBrowserEventsOpen(true);
    } else if (active) {
      // If just active but not autoOpen, only open browser events
      setIsBrowserEventsOpen(true);
    }
  }, [active, autoOpen]);
  
  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-4 top-14 bottom-0 w-0.5 bg-border z-0"></div>
      )}
      <Card className={cn(
        "relative z-10 mb-3",
        active && "border-primary shadow-md"
      )}>
        <CardContent className={cn(
          "p-4",
          active && "bg-primary/5"
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full font-medium border",
              active 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-primary/10 text-primary border-primary/20"
            )}>
              {stepNumber}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <h3 className={cn(
                  "font-medium text-lg",
                  active && "text-primary"
                )}>
                  {formatFunctionName(functionName)}
                </h3>
                
                {requiresBrowser && (
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1 text-xs font-normal bg-violet-500 text-white border-violet-600 hover:bg-violet-600"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Browser Required
                  </Badge>
                )}
                
                {active && (
                  <Badge className="bg-primary text-primary-foreground">
                    Active
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground">{description}</p>
              
              <div className="pt-2 space-y-2">
                {hasInput && (
                  <Collapsible open={isInputOpen} onOpenChange={setIsInputOpen}>
                    <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {isInputOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      Example Input
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <KeyValueDisplay data={input} />
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {hasOutput && (
                  <Collapsible open={isOutputOpen} onOpenChange={setIsOutputOpen}>
                    <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {isOutputOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      Example Output
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <KeyValueDisplay data={output} />
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {hasBrowserEvents && (
                  <Collapsible open={isBrowserEventsOpen} onOpenChange={setIsBrowserEventsOpen}>
                    <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {isBrowserEventsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      Browser Events
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="border rounded-sm text-xs overflow-hidden max-h-36">
                        {browserEvents.map((event, index) => (
                          <BrowserEventItem key={index} event={event} />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
