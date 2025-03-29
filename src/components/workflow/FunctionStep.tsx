
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { CollapsibleSection } from "./CollapsibleSection";
import { getStepIcon, formatFunctionName } from "./utils/stepUtils";
import { cn } from "@/lib/utils";
import { BrowserEvent } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrowserEventItem } from "./BrowserEventItem";

interface FunctionStepProps {
  step: any;
  browserEvents?: BrowserEvent[];
  autoOpen?: boolean;
}

export const FunctionStep = ({
  step,
  browserEvents = [],
  autoOpen = false
}: FunctionStepProps) => {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [isBrowserEventsOpen, setIsBrowserEventsOpen] = useState(false);
  
  const stepType = step.type;
  const isActive = step.active || false;
  const isDisabled = step.disabled || false;
  
  const hasInput = step.input && Object.keys(step.input).length > 0;
  const hasOutput = step.output && Object.keys(step.output).length > 0;
  const hasBrowserEvents = browserEvents.length > 0;
  
  const getStepTitle = () => {
    if (stepType === 'function') {
      return formatFunctionName(step.function_name);
    } else if (stepType === 'done') {
      return 'Workflow Complete';
    }
    return 'Step';
  };
  
  const getStepDescription = () => {
    if (stepType === 'function') {
      return step.function_description;
    } else if (stepType === 'done') {
      return 'All steps have been completed';
    }
    return '';
  };

  return (
    <Card 
      className={cn(
        "relative mb-2 p-3",
        isActive && !isDisabled && "border-primary shadow-sm bg-primary/5",
        isDisabled && "opacity-60 bg-muted/20"
      )}
    >
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
            
            {stepType === 'done' && (
              <Badge className="bg-green-600 text-white">
                Active
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
          
          <div className="pt-1 space-y-1.5">
            {hasInput && (
              <CollapsibleSection 
                title="Input" 
                isOpen={isInputOpen} 
                onOpenChange={setIsInputOpen}
              >
                <KeyValueDisplay data={step.input} compact={true} />
              </CollapsibleSection>
            )}
            
            {hasBrowserEvents && stepType === 'function' && (
              <CollapsibleSection 
                title="Browser Events" 
                isOpen={isBrowserEventsOpen} 
                onOpenChange={setIsBrowserEventsOpen}
              >
                <div className="border rounded-sm text-xs overflow-hidden">
                  <ScrollArea className="max-h-32">
                    {browserEvents
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((event, index) => (
                        <BrowserEventItem key={index} event={event} />
                      ))}
                  </ScrollArea>
                </div>
              </CollapsibleSection>
            )}
            
            {hasOutput && (
              <CollapsibleSection 
                title="Output" 
                isOpen={isOutputOpen} 
                onOpenChange={setIsOutputOpen}
              >
                <KeyValueDisplay data={step.output} compact={true} />
              </CollapsibleSection>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
