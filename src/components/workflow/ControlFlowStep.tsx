
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { CollapsibleSection } from "./CollapsibleSection";
import { getStepIcon } from "./utils/stepUtils";
import { cn } from "@/lib/utils";
import { BrowserEvent } from "@/types";
import { Progress } from "@/components/ui/progress";
import { WorkflowStep } from "./WorkflowStep";

interface ControlFlowStepProps {
  step: any;
  browserEvents?: BrowserEvent[];
  autoOpen?: boolean;
  childSteps?: any[];
  flatDisplay?: boolean;
}

export const ControlFlowStep = ({
  step,
  browserEvents = [],
  autoOpen = false,
  childSteps = [],
  flatDisplay = false
}: ControlFlowStepProps) => {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  
  const stepType = step.type;
  const isActive = step.active || false;
  const isDisabled = step.disabled || false;
  
  const hasInput = step.input && Object.keys(step.input).length > 0;
  const hasOutput = step.output && Object.keys(step.output).length > 0;
  const hasControlValue = stepType === 'for' && step.control_value !== undefined;
  const hasIfControlValue = stepType === 'if' && typeof step.control_value === 'boolean';
  const hasChildSteps = childSteps && childSteps.length > 0;
  
  // Determine if step has progress info
  const hasProgress = stepType === 'for' && 
    typeof step.n_progress === 'number' && 
    typeof step.n_total === 'number' &&
    step.n_total > 0;
  
  // Calculate progress percentage
  const progressValue = hasProgress 
    ? Math.min(100, (step.n_progress / step.n_total) * 100) 
    : 0;
  
  const getStepTitle = () => {
    if (stepType === 'for' || stepType === 'if') {
      return step.control_description || (stepType === 'for' ? 'Repeat Steps' : 'Check Condition');
    }
    return 'Step';
  };

  return (
    <Card 
      className={cn(
        "relative mb-2 p-3",
        isActive && !isDisabled && "border-primary shadow-sm bg-primary/5",
        isDisabled && "opacity-60 bg-muted/20",
        stepType === 'for' ? "border-amber-500/30 bg-amber-50 dark:bg-amber-950/20" : 
                            "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full font-medium text-sm border",
          stepType === 'for' ? "bg-amber-500 text-white border-amber-600" : 
                              "bg-blue-500 text-white border-blue-600"
        )}>
          {step.step_number}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              {getStepIcon(stepType)}
              <h3 className="font-medium">
                {getStepTitle()}
              </h3>
            </div>
            
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
          </div>
          
          {/* Progress bar for "for" type steps */}
          {hasProgress && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{step.n_progress} of {step.n_total}</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          )}
          
          {/* Control value for "for" steps shown by default */}
          {hasControlValue && (
            <div className="pt-1.5 border-t border-border/40 mt-2">
              <div className="text-xs text-muted-foreground font-medium mb-1">Current Item:</div>
              <KeyValueDisplay data={step.control_value} compact={true} />
            </div>
          )}
          
          {/* Label for child steps */}
          {hasChildSteps && (
            <div className="pt-2 mt-2 border-t border-border/40">
              <div className="text-xs font-medium mb-2">
                {stepType === 'for' ? 'For Each Item:' : 
                  stepType === 'if' ? (step.control_value ? 'If True:' : 'If False:') : 
                  'Steps:'}
              </div>
            </div>
          )}
          
          {/* Collapsible sections for additional details */}
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
      
      {/* Display child steps flat (when flatDisplay is true) */}
      {hasChildSteps && flatDisplay && (
        <div className="mt-2">
          {childSteps.map((childStep) => (
            <WorkflowStep
              key={`${childStep.type}-${childStep.step_number}`}
              step={childStep}
              browserEvents={browserEvents.filter(event => 
                childStep.type === 'function' && 
                event.function_name === childStep.function_name
              )}
              autoOpen={autoOpen}
              childSteps={childStep.childSteps || []}
              flatDisplay={true}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
