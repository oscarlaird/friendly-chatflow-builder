
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ZoomIn } from "lucide-react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BrowserEvent } from "@/types";
import { Progress } from "@/components/ui/progress";
import { getStepIcon } from "./utils/iconUtils";
import { formatFunctionName } from "./utils/stringUtils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { truncateText } from "./utils/stringUtils";
import { ExternalLink } from "lucide-react";

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

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
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
  
  // Update card styling to support uniform width and height
  const cardStyle = cn(
    "p-3 w-full h-[100px] flex flex-col", 
    uniformWidth ? "w-full" : (compact ? "max-w-[320px]" : "max-w-[28rem]"),
    isActive && !isDisabled && "border-blue-500 shadow-sm bg-blue-50/30 dark:bg-blue-900/10",
    isActive && step.type === 'function' && "animate-border-pulse",
    isDisabled && "opacity-60 bg-muted/20",
    hasChildren && (
      stepType === 'for' 
        ? "rounded-md border-blue-300" 
        : stepType === 'if' 
          ? "rounded-md border-purple-300" 
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
        return step.function_description ? truncateText(step.function_description, 60) : null;
      case 'for':
      case 'if':
        return null;
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
  
  // Render inputs, outputs, and browser events in the modal
  const renderModalContent = () => {
    return (
      <div className="space-y-6 max-h-[70vh] overflow-auto">
        {/* Input section */}
        {hasInput && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
                Input
              </span>
            </h3>
            <div className="p-4 rounded-md border bg-muted/10">
              {Array.isArray(step.input) ? (
                <Table>
                  <TableHeader>
                    {Object.keys(step.input[0] || {}).map(key => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {step.input.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        {Object.entries(row).map(([key, value]) => (
                          <TableCell key={`${idx}-${key}`}>{String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <KeyValueDisplay data={step.input} compact={false} />
              )}
            </div>
          </div>
        )}
        
        {/* Step visualization */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center">
            <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-2 py-1 rounded text-xs font-medium">
              Step
            </span>
          </h3>
          <div className="p-4 rounded-md border bg-muted/10 flex justify-center">
            <div className="max-w-sm">
              <Card className={cn(
                "p-3 shadow-md border-blue-500 bg-blue-50/30 dark:bg-blue-900/20"
              )}>
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-blue-500 text-white border-blue-500">
                    {step.step_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {getStepIcon(stepType)}
                      <h3 className="font-medium text-sm text-blue-700 dark:text-blue-300">
                        {getStepTitle()}
                      </h3>
                    </div>
                    {getStepDescription() && (
                      <p className="text-xs text-muted-foreground">
                        {getStepDescription()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Output section */}
        {hasOutput && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
                Output
              </span>
            </h3>
            <div className="p-4 rounded-md border bg-muted/10">
              {Array.isArray(step.output) ? (
                <Table>
                  <TableHeader>
                    {Object.keys(step.output[0] || {}).map(key => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {step.output.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        {Object.entries(row).map(([key, value]) => (
                          <TableCell key={`${idx}-${key}`}>{String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <KeyValueDisplay data={step.output} compact={false} />
              )}
            </div>
          </div>
        )}
        
        {/* User inputs section */}
        {hasUserInputs && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-2 py-1 rounded text-xs font-medium">
                User Inputs
              </span>
            </h3>
            <div className="p-4 rounded-md border bg-muted/10">
              <KeyValueDisplay 
                data={userInputs || {}} 
                setUserInputs={setUserInputs}
                compact={false}
                isEditable={true}
              />
            </div>
          </div>
        )}
        
        {/* Browser events section */}
        {hasBrowserEvents && stepType === 'function' && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 px-2 py-1 rounded text-xs font-medium">
                Browser Events ({browserEvents.length})
              </span>
            </h3>
            <div className="p-4 rounded-md border bg-muted/10">
              {browserEvents.map((event, index) => {
                const browserState = event?.data?.browser_state;
                const currentGoal = event?.data?.current_goal;
                const faviconUrl = browserState?.url ? getFaviconUrl(browserState.url) : null;
                
                return (
                  <div key={index} className="flex items-center gap-2 py-2 border-b last:border-0">
                    {faviconUrl ? (
                      <img src={faviconUrl} alt="site favicon" className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="text-sm">{currentGoal || 'Browser action'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <>
      <Card className={cardStyle}>
        <div className="flex items-start gap-2 h-full">
          <div className={cn(
            "flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full font-medium text-xs border",
            isActive && !isDisabled 
              ? "bg-blue-500 text-white border-blue-500" 
              : isDisabled 
                ? "bg-muted text-muted-foreground border-muted" 
                : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
          )}>
            {step.step_number}
          </div>
          
          <div className="flex-1 min-w-0 space-y-1 overflow-hidden flex flex-col justify-between h-full">
            <div>
              <div className="flex flex-wrap gap-1 items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  {getStepIcon(stepType)}
                  <h3 className={cn(
                    "font-medium text-sm truncate max-w-[180px]",
                    isActive && !isDisabled && "text-blue-700 dark:text-blue-300",
                    isDisabled && "text-muted-foreground"
                  )}>
                    {getStepTitle()}
                  </h3>
                </div>
                
                <div className="flex gap-1">
                  {stepType === 'function' && step.browser_required && (
                    <Badge 
                      variant="outline" 
                      className="flex items-center gap-0.5 text-[9px] py-0 px-2 h-5 font-normal bg-violet-500 text-white border-violet-600"
                    >
                      <ExternalLink className="h-2.5 w-2.5 mr-0.5" />
                      Browser
                    </Badge>
                  )}
                  
                  {isActive && !isDisabled && (
                    <Badge className="bg-blue-500 text-white text-[9px] py-0 px-2 h-5">
                      Active
                    </Badge>
                  )}
                  
                  {hasIfControlValue && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "flex items-center gap-0.5 text-[9px] py-0 px-2 h-5 font-normal border",
                        step.control_value 
                          ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                          : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                      )}
                    >
                      {step.control_value ? "True" : "False"}
                    </Badge>
                  )}
                </div>
              </div>
              
              {getStepDescription() && (
                <p className={cn(
                  "text-xs line-clamp-1 mt-1",
                  isDisabled ? "text-muted-foreground/70" : "text-muted-foreground"
                )}>
                  {getStepDescription()}
                </p>
              )}
            </div>

            {hasProgress && (
              <div className="mt-1 space-y-0.5">
                <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                  <span>Progress</span>
                  <span>{step.n_progress} of {step.n_total}</span>
                </div>
                <Progress value={progressValue} className="h-1.5" />
              </div>
            )}
            
            {/* Show view details button if the step has input, output, or browser events */}
            {(hasInput || hasOutput || hasBrowserEvents || hasUserInputs) && (
              <div className="flex justify-end mt-auto">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                  onClick={() => setDetailsModalOpen(true)}
                >
                  <ZoomIn className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* Modal for viewing step details */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getStepIcon(stepType)}
              <span>
                {getStepTitle()} {step.step_number ? `(Step ${step.step_number})` : ''}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {renderModalContent()}
          
          <div className="flex justify-end border-t pt-4 mt-4">
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
