
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: any;
  title: string;
}

export const StepFlowModal = ({ isOpen, onClose, step, title }: StepFlowModalProps) => {
  const hasInput = step.input && Object.keys(step.input).length > 0;
  const hasOutput = step.output && Object.keys(step.output).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {hasInput && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Inputs</h3>
                <div className="border rounded-md p-3 bg-muted/30">
                  <KeyValueDisplay data={step.input} compact={false} />
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <div className="flex items-center justify-center rounded-full bg-[hsl(var(--dropbox-light-blue))] p-1">
                <ArrowDown className="h-4 w-4 text-[hsl(var(--dropbox-blue))]" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Block Description</h3>
              <div className={cn(
                "border rounded-md p-3",
                "bg-[hsl(var(--dropbox-light-blue))] dark:bg-slate-900/50"
              )}>
                <p className="text-sm">{step.function_description || 'No description available'}</p>
              </div>
            </div>
            
            {hasOutput && (
              <>
                <div className="flex justify-center">
                  <div className="flex items-center justify-center rounded-full bg-[hsl(var(--dropbox-light-blue))] p-1">
                    <ArrowDown className="h-4 w-4 text-[hsl(var(--dropbox-blue))]" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Outputs</h3>
                  <div className="border rounded-md p-3 bg-muted/30">
                    <KeyValueDisplay data={step.output} compact={false} />
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
