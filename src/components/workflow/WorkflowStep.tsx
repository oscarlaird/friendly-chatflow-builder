import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, ExternalLink, ListOrdered, FileQuestion, Component, SquareCheck, Check, X, Maximize2, ArrowLeft } from "lucide-react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BrowserEvent } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { getStepIcon } from "./utils/iconUtils";
import { formatFunctionName } from "./utils/stringUtils";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { truncateText } from "./utils/stringUtils";

interface WorkflowStepProps {
  step: any;
  browserEvents?: BrowserEvent[];
  autoOpen?: boolean;
  hasChildren?: boolean;
  isUserInputStep?: boolean;
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
  compact?: boolean;
  uniformWidth?: boolean;
}

export const WorkflowStep = ({ 
  step, 
  browserEvents = [], 
  autoOpen = false,
  hasChildren = false,
  isUserInputStep = false,
  userInputs,
  setUserInputs,
  compact = false,
  uniformWidth = false,
}: WorkflowStepProps) => {
  useEffect(() => {
    if (isUserInputStep && userInputs) {
      console.log('UserInputs available:', userInputs);
    }
  }, [isUserInputStep, userInputs]);

  const [isInputOpen, setIsInputOpen] = useState(autoOpen);
  const [isOutputOpen, setIsOutputOpen] = useState(autoOpen);
  const [isBrowserEventsOpen, setIsBrowserEventsOpen] = useState(autoOpen);
  const [isControlValueOpen, setIsControlValueOpen] = useState(autoOpen);
  const [isUserInputsOpen, setIsUserInputsOpen] = useState(autoOpen);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState<Record<string, any>>({});
  
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
    "p-3 w-full max-w-[28rem]", // Fixed width for uniform cards
    isActive && !isDisabled && "border-[hsl(var(--dropbox-blue))] shadow-sm bg-[hsl(var(--dropbox-light-blue))/30]",
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
        return step.function_description ? truncateText(step.function_description, 100) : null;
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
  
  // Open modal to show data in full screen
  const openDataModal = (title: string, data: Record<string, any>) => {
    setModalTitle(title);
    setModalData(data);
    setDataModalOpen(true);
  };
  
  // Truncate long text values in data objects
  const truncateDataValues = (data: Record<string, any>, maxLength = 50): Record<string, any> => {
    if (!data || typeof data !== 'object') return data;
    
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.length > maxLength) {
        result[key] = truncateText(value, maxLength);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => 
          typeof item === 'object' ? truncateDataValues(item, maxLength) : 
            (typeof item === 'string' && item.length > maxLength ? truncateText(item, maxLength) : item)
        );
      } else if (value !== null && typeof value === 'object') {
        result[key] = truncateDataValues(value, maxLength);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  };
  
  // Render table data in the modal
  const renderTableData = (data: Record<string, any>) => {
    // Check if it's an array of objects
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      // Get all unique keys from all objects in the array
      const allKeys = Array.from(
        new Set(
          data.flatMap(item => Object.keys(item))
        )
      );
      
      return (
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {allKeys.map(key => (
                  <TableHead key={key}>{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  {allKeys.map(key => (
                    <TableCell key={`${idx}-${key}`}>
                      {typeof row[key] === 'object' 
                        ? JSON.stringify(row[key])
                        : String(row[key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    
    // For regular objects or non-tabular data
    return <KeyValueDisplay data={data} compact={false} />;
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
        <span className="truncate">{currentGoal ? truncateText(currentGoal, 60) : 'Browser action'}</span>
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
              {browser_state?.title ? truncateText(browser_state.title, 40) : (browser_state?.url ? truncateText(browser_state.url, 40) : 'Unknown Page')}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {browser_state?.url ? truncateText(browser_state.url, 60) : ''}
            </div>
          </div>
          {current_goal && (
            <Badge variant="outline" className="ml-auto text-xs">
              {truncateText(current_goal, 30)}
            </Badge>
          )}
        </div>
        {memory_log && (
          <div className="p-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 text-muted-foreground">
            <p className="whitespace-pre-wrap line-clamp-2 text-xs">{memory_log}</p>
            {memory_log.length > 100 && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-xs"
                onClick={() => openDataModal('Memory Log', { content: memory_log })}
              >
                Show more
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <>
      <Card className={cardStyle}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full font-medium text-sm border",
            isActive && !isDisabled 
              ? "bg-[hsl(var(--dropbox-blue))] text-white border-[hsl(var(--dropbox-blue))]" 
              : isDisabled 
                ? "bg-muted text-muted-foreground border-muted" 
                : "bg-[hsl(var(--dropbox-light-blue))] text-[hsl(var(--dropbox-blue))] border-[hsl(var(--dropbox-blue))/20]"
          )}>
            {step.step_number}
          </div>
          
          <div className="flex-1 space-y-2 overflow-hidden">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                {getStepIcon(stepType)}
                <h3 className={cn(
                  "font-medium truncate max-w-[180px]",
                  isActive && !isDisabled && "text-[hsl(var(--dropbox-blue))]",
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
                <Badge className="bg-[hsl(var(--dropbox-blue))] text-white">
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
                "text-sm line-clamp-2",
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
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {isInputOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      Input
                    </CollapsibleTrigger>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => openDataModal(`Input for ${getStepTitle()}`, step.input)}
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span className="sr-only">View Full Screen</span>
                    </Button>
                  </div>
                  <CollapsibleContent className="pt-1.5">
                    <div className="max-h-60 overflow-hidden relative">
                      <KeyValueDisplay data={truncateDataValues(step.input, 50)} compact={true} />
                      {Object.keys(step.input).length > 3 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-10 pointer-events-none"></div>
                      )}
                    </div>
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
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {isOutputOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      Output
                    </CollapsibleTrigger>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => openDataModal(`Output from ${getStepTitle()}`, step.output)}
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span className="sr-only">View Full Screen</span>
                    </Button>
                  </div>
                  <CollapsibleContent className="pt-1.5">
                    <div className="max-h-60 overflow-hidden relative">
                      <KeyValueDisplay data={truncateDataValues(step.output, 50)} compact={true} />
                      {Object.keys(step.output).length > 3 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-10 pointer-events-none"></div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {hasUserInputs && (
                <Collapsible open={isUserInputsOpen} onOpenChange={setIsUserInputsOpen}>
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {isUserInputsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      Input Values
                    </CollapsibleTrigger>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => openDataModal(`Input Values`, userInputs || {})}
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span className="sr-only">View Full Screen</span>
                    </Button>
                  </div>
                  <CollapsibleContent className="pt-1.5">
                    <div className="max-h-60 overflow-hidden relative">
                      <KeyValueDisplay 
                        data={truncateDataValues(userInputs || {}, 50)} 
                        setUserInputs={setUserInputs}
                        compact={true}
                        isEditable={true}
                      />
                      {userInputs && Object.keys(userInputs).length > 3 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-10 pointer-events-none"></div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Modal for viewing data in full screen */}
      <Dialog open={dataModalOpen} onOpenChange={setDataModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-4">
              {renderTableData(modalData)}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
