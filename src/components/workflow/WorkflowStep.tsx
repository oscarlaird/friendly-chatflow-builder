
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, ExternalLink, ListOrdered, FileQuestion, Component, SquareCheck, Check, X } from "lucide-react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BrowserEvent } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { getStepIcon } from "./utils/iconUtils";
import { formatFunctionName } from "./utils/stringUtils";
import { useParams } from "react-router-dom";

interface WorkflowStepProps {
  step: any;
  browserEvents?: BrowserEvent[];
  autoOpen?: boolean;
  hasChildren?: boolean;
  isUserInputStep?: boolean;
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
  }

export const WorkflowStep = ({ 
  step, 
  browserEvents = [], 
  autoOpen = false,
  hasChildren = false,
  isUserInputStep = false,
  userInputs,
  setUserInputs,
}: WorkflowStepProps) => {
  // Use the store

  useEffect(() => {
    console.log('RENDER - WorkflowStep component rendered');
    if (isUserInputStep && userInputs) {
      console.log('UserInputs available:', userInputs);
    }
  }, [isUserInputStep, userInputs]);

  const [isInputOpen, setIsInputOpen] = useState(autoOpen);
  const [isOutputOpen, setIsOutputOpen] = useState(autoOpen);
  const [isBrowserEventsOpen, setIsBrowserEventsOpen] = useState(autoOpen);
  const [isControlValueOpen, setIsControlValueOpen] = useState(autoOpen);
  const [isUserInputsOpen, setIsUserInputsOpen] = useState(autoOpen);
  
  const stepType = step.type;
  const isActive = step.active || false;
  const isDisabled = step.disabled || false;
  
  const hasInput = step.input && Object.keys(step.input).length > 0 && !isUserInputStep;
  const hasOutput = step.output && Object.keys(step.output).length > 0 && !isUserInputStep;
  const hasBrowserEvents = browserEvents.length > 0;
  const hasControlValue = stepType === 'for' && step.control_value !== undefined;
  const hasIfControlValue = stepType === 'if' && typeof step.control_value === 'boolean';
  const hasBrowserAgentData = step.browser_agent_data && Object.keys(step.browser_agent_data).length > 0;
  const hasUserInputs = isUserInputStep && userInputs && Object.keys(userInputs).length > 0;
  
  // Determine if step has progress info
  const hasProgress = stepType === 'for' && 
    typeof step.n_progress === 'number' && 
    typeof step.n_total === 'number' &&
    step.n_total > 0;
  
  // Calculate progress percentage
  const progressValue = hasProgress 
    ? Math.min(100, (step.n_progress / step.n_total) * 100) 
    : 0;
  
  // Update card styling based on whether it's active and running
  const cardStyle = cn(
    "p-3",
    isActive && !isDisabled && "border-primary shadow-sm bg-primary/5",
    isActive && step.type === 'function' && "animate-border-pulse",
    isDisabled && "opacity-60 bg-muted/20",
    hasChildren && (
      stepType === 'for' 
        ? "rounded-t-md border-purple-300" 
        : stepType === 'if' 
          ? "rounded-t-md border-blue-300" 
          : ""
    )
  );
  
  const getStepTitle = () => {
    switch (stepType) {
      case 'function':
        return formatFunctionName(step.function_name);
      case 'for':
      case 'if':
        return step.control_description || (stepType === 'for' ? 'Repeat Steps' : 'Check Condition');
      case 'done':
        return 'Workflow Complete';
      default:
        return 'Step';
    }
  };
  
  const getStepDescription = () => {
    switch (stepType) {
      case 'function':
        return step.function_description;
      case 'for':
      case 'if':
        return null; // We'll use control_description as the main title now
      case 'done':
        return 'All steps have been completed';
      default:
        return '';
    }
  };
  
  // Extract domain from URL for favicon
  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=16`;
    } catch (e) {
      return null;
    }
  };
  
  // Browser event item component for function steps
  const BrowserEventItem = ({ event }: { event: BrowserEvent }) => {
    const browserState = event?.data?.browser_state;
    const currentGoal = event?.data?.current_goal;
    const faviconUrl = browserState?.url ? getFaviconUrl(browserState.url) : null;

    return (
      <div className="flex items-center gap-2 text-xs py-1 px-2 border-b border-muted/40 last:border-0">
        {faviconUrl ? (
          <img src={faviconUrl} alt="site favicon" className="w-4 h-4 flex-shrink-0" />
        ) : (
          <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        )}
        <span className="truncate">{currentGoal || 'Browser action'}</span>
      </div>
    );
  };
  
  // Browser agent data display component
  const BrowserAgentDataDisplay = () => {
    if (!hasBrowserAgentData) return null;
    
    const { browser_state, memory_log, current_goal } = step.browser_agent_data;
    const faviconUrl = browser_state?.url ? getFaviconUrl(browser_state.url) : null;
    
    return (
      <div className="mt-3 border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 p-2 border-b">
          {faviconUrl ? (
            <img src={faviconUrl} alt="site favicon" className="w-5 h-5 flex-shrink-0" />
          ) : (
            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {browser_state?.title || browser_state?.url || 'Unknown Page'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {browser_state?.url || ''}
            </div>
          </div>
          {current_goal && (
            <Badge variant="outline" className="ml-auto text-xs">
              {current_goal}
            </Badge>
          )}
        </div>
        {memory_log && (
          <div className="p-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 text-muted-foreground">
            <p className="whitespace-pre-wrap">{memory_log}</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className={cardStyle}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full font-medium text-sm border",
          isActive && !isDisabled 
            ? "bg-primary text-primary-foreground border-primary" 
            : isDisabled 
              ? "bg-muted text-muted-foreground border-muted" 
              : "bg-primary/10 text-primary border-primary/20"
        )}>
          {step.step_number}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              {getStepIcon(stepType)}
              <h3 className={cn(
                "font-medium",
                isActive && !isDisabled && "text-primary",
                isDisabled && "text-muted-foreground"
              )}>
                {getStepTitle()}
              </h3>
            </div>
            
            {stepType === 'function' && step.browser_required && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 text-xs font-normal bg-violet-500 text-white border-violet-600"
              >
                <ExternalLink className="h-3 w-3" />
                Browser
              </Badge>
            )}
            
            {isActive && !isDisabled && (
              <Badge className="bg-primary text-primary-foreground">
                Active
              </Badge>
            )}
            
            {hasIfControlValue && (
              <Badge 
                variant="outline" 
                className={cn(
                  "flex items-center gap-1 text-xs font-normal border",
                  step.control_value 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : "bg-red-100 text-red-800 border-red-200"
                )}
              >
                {step.control_value ? (
                  <><Check className="h-3 w-3" /> True</>
                ) : (
                  <><X className="h-3 w-3" /> False</>
                )}
              </Badge>
            )}
            
            {hasChildren && ['for', 'if'].includes(stepType) && (
              <Badge variant="outline" className="text-xs font-normal">
                {step.child_count} {step.child_count === 1 ? 'step' : 'steps'}
              </Badge>
            )}
          </div>
          
          {getStepDescription() && (
            <p className={cn(
              "text-sm",
              isDisabled ? "text-muted-foreground/70" : "text-muted-foreground"
            )}>
              {getStepDescription()}
            </p>
          )}

          {hasProgress && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{step.n_progress} of {step.n_total}</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          )}
          
          {/* Display browser agent data if available */}
          {hasBrowserAgentData && <BrowserAgentDataDisplay />}
          
          <div className="space-y-1.5 mt-2">
            {hasInput && (
              <Collapsible open={isInputOpen} onOpenChange={setIsInputOpen}>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {isInputOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  Input
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5">
                  <KeyValueDisplay data={step.input} compact={true} />
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {hasControlValue && (
              <Collapsible open={isControlValueOpen} onOpenChange={setIsControlValueOpen}>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {isControlValueOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  Loop Value
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5">
                  <KeyValueDisplay data={{ value: step.control_value }} compact={true} />
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {hasBrowserEvents && stepType === 'function' && (
              <Collapsible open={isBrowserEventsOpen} onOpenChange={setIsBrowserEventsOpen}>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {isBrowserEventsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  Browser Events
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5">
                  <div className="border rounded-sm text-xs overflow-hidden">
                    <ScrollArea className="max-h-32">
                      {browserEvents
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((event, index) => (
                          <BrowserEventItem key={index} event={event} />
                        ))}
                    </ScrollArea>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {hasOutput && (
              <Collapsible open={isOutputOpen} onOpenChange={setIsOutputOpen}>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {isOutputOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  Output
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5">
                  <KeyValueDisplay 
                    data={step.output} 
                    compact={true}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}

            {hasUserInputs && (
              <Collapsible open={isUserInputsOpen} onOpenChange={setIsUserInputsOpen}>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {isUserInputsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  Input Values
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5">
                  <KeyValueDisplay 
                    data={userInputs} 
                    setUserInputs={setUserInputs}
                    compact={true}
                    isEditable={true}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
