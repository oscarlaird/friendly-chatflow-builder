
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkflowStepProps {
  stepNumber: number;
  functionName: string;
  description: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  requiresBrowser?: boolean;
  isLast?: boolean;
}

// Helper function to format function name
const formatFunctionName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const WorkflowStep = ({
  stepNumber,
  functionName,
  description,
  input,
  output,
  requiresBrowser = false,
  isLast = false,
}: WorkflowStepProps) => {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  
  const hasInput = input && Object.keys(input).length > 0;
  const hasOutput = output && Object.keys(output).length > 0;
  
  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-4 top-14 bottom-0 w-0.5 bg-border z-0"></div>
      )}
      <Card className="relative z-10 mb-3">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
              {stepNumber}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <h3 className="font-medium text-lg">
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
