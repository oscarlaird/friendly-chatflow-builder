import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrowserEvent } from "@/types";
import { getStepIcon } from "./utils/iconUtils";
import { formatFunctionName } from "./utils/stringUtils";
import { truncateText } from "./utils/stringUtils";
import { Badge } from "@/components/ui/badge";
import { StepFlowModal } from "./StepFlowModal";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { supabase } from "@/integrations/supabase/client";

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
  chatId?: string;
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
  chatId,
}: WorkflowStepProps) => {
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  
  const stepType = step.type;
  const isActive = step.active || false;
  const isDisabled = step.disabled || false;
  const hasInput = step.input && Object.keys(step.input).length > 0;
  const hasOutput = step.output && Object.keys(step.output).length > 0;

  // Handle input changes and save to database
  const handleInputChange = async (newUserInputs: Record<string, any>) => {
    if (!chatId || !setUserInputs) return;

    try {
      // Update local state
      setUserInputs(newUserInputs);
      
      // Save to database
      const { error } = await supabase
        .from('chats')
        .update({ user_inputs: newUserInputs })
        .eq('id', chatId);

      if (error) {
        console.error('Error saving user inputs:', error);
      }
    } catch (error) {
      console.error('Error updating user inputs:', error);
    }
  };
  
  // Get appropriate background color for control block
  const getControlBlockStyle = (type: string) => {
    switch (type) {
      case 'for':
        return 'border-purple-300 dark:border-purple-800';
      case 'if':
        return 'border-blue-300 dark:border-blue-800';
      default:
        return '';
    }
  };
  
  // Get step title based on type
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
        return 'Start Inputs';
    }
  };
  
  // Card styling based on step state
  const cardStyle = cn(
    "p-3 w-full",
    uniformWidth && "max-w-[28rem]",
    isActive && !isDisabled && "border-[hsl(var(--dropbox-blue))] shadow-sm bg-[hsl(var(--dropbox-light-blue))/30]",
    isActive && step.type === 'function' && "animate-border-pulse",
    isDisabled && "opacity-60 bg-muted/20",
    hasChildren && "rounded-t-md",
    hasChildren && getControlBlockStyle(stepType)
  );

  return (
    <>
      <Card className={cardStyle}>
        <div className="flex flex-col gap-3">
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
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  {getStepIcon(stepType)}
                  <h4 className={cn(
                    "font-semibold text-sm",
                    isActive && !isDisabled && "text-[hsl(var(--dropbox-blue))]",
                    isDisabled && "text-muted-foreground"
                  )}>
                    {getStepTitle()}
                  </h4>
                </div>
                
                {!isUserInputStep && (hasInput || hasOutput) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsFlowModalOpen(true)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="sr-only">View Flow</span>
                  </Button>
                )}
                
                {stepType === 'function' && step.browser_required && (
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1 text-xs font-normal bg-violet-500 text-white border-violet-600"
                  >
                    Browser
                  </Badge>
                )}
                
                {isActive && !isDisabled && (
                  <Badge className="bg-[hsl(var(--dropbox-blue))] text-white">
                    Active
                  </Badge>
                )}
              </div>
              
              {step.function_description && (
                <p className={cn(
                  "text-xs mt-1 text-muted-foreground line-clamp-2",
                  isDisabled && "text-muted-foreground/70"
                )}>
                  {truncateText(step.function_description, 100)}
                </p>
              )}
            </div>
          </div>

          {/* Show editable KeyValueDisplay for user input steps */}
          {isUserInputStep && step.output && (
            <div className="mt-2">
              <KeyValueDisplay
                data={step.output}
                isEditable={true}
                setUserInputs={handleInputChange}
                compact={true}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Modal for non-input steps */}
      {!isUserInputStep && (
        <StepFlowModal
          isOpen={isFlowModalOpen}
          onClose={() => setIsFlowModalOpen(false)}
          step={step}
          title={getStepTitle()}
        />
      )}
    </>
  );
};
