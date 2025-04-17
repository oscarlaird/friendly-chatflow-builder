
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Eye, ChevronRight, ExternalLink, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BrowserEvent } from "@/types";
import { getStepIcon } from "./utils/iconUtils";
import { formatFunctionName, truncateText } from "./utils/stringUtils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WorkflowStepProps {
  step: any;
  browserEvents?: BrowserEvent[];
  autoOpen?: boolean;
  hasChildren?: boolean;
  isUserInputStep?: boolean;
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
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
  uniformWidth = false,
}: WorkflowStepProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const stepType = step.type;
  const isActive = step.active || false;
  const isDisabled = step.disabled || false;
  
  const hasInput = step.input && Object.keys(step.input).length > 0 && !isUserInputStep;
  const hasOutput = step.output && Object.keys(step.output).length > 0 && !isUserInputStep;
  const hasBrowserEvents = browserEvents.length > 0;
  const hasControlValue = stepType === 'for' && step.control_value !== undefined;
  const hasIfControlValue = stepType === 'if' && typeof step.control_value === 'boolean';
  
  const hasProgress = stepType === 'for' && 
    typeof step.n_progress === 'number' && 
    typeof step.n_total === 'number' &&
    step.n_total > 0;
  
  const progressValue = hasProgress 
    ? Math.min(100, (step.n_progress / step.n_total) * 100) 
    : 0;

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
        return 'All steps completed';
      default:
        return '';
    }
  };

  // Render table data in the modal
  const renderTableData = (data: Record<string, any>) => {
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const allKeys = Array.from(new Set(data.flatMap(item => Object.keys(item))));
      
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
    
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="grid grid-cols-[120px_1fr] gap-4">
            <div className="font-medium text-sm">{key}:</div>
            <div className="text-sm">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className={cn(
        "p-3 w-full",
        isActive && !isDisabled && "border-[hsl(var(--dropbox-blue))] shadow-sm bg-[hsl(var(--dropbox-light-blue))/30]",
        isActive && step.type === 'function' && "animate-border-pulse",
        isDisabled && "opacity-60 bg-muted/20",
        uniformWidth && "max-w-[28rem]"
      )}>
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getStepIcon(stepType)}
                <h3 className={cn(
                  "font-medium truncate",
                  isActive && !isDisabled && "text-[hsl(var(--dropbox-blue))]",
                  isDisabled && "text-muted-foreground"
                )}>
                  {getStepTitle()}
                </h3>
              </div>
              
              {(hasInput || hasOutput) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setDetailsOpen(true)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>

            {stepType === 'function' && step.browser_required && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 text-xs font-normal bg-violet-500 text-white border-violet-600 mt-1"
              >
                <ExternalLink className="h-3 w-3" />
                Browser
              </Badge>
            )}
            
            {hasIfControlValue && (
              <Badge 
                variant="outline" 
                className={cn(
                  "flex items-center gap-1 text-xs font-normal border mt-1",
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
            
            {getStepDescription() && (
              <p className={cn(
                "text-xs mt-1 text-muted-foreground line-clamp-2",
                isDisabled && "text-muted-foreground/70"
              )}>
                {getStepDescription()}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{getStepTitle()}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6 overflow-auto">
            {hasInput && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Input</h3>
                {renderTableData(step.input)}
              </div>
            )}
            {hasOutput && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Output</h3>
                {renderTableData(step.output)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
