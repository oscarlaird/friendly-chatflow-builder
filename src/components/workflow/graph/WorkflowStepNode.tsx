
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { KeyValueDisplay } from '../KeyValueDisplay';

interface WorkflowStepNodeProps {
  data: any;
  isConnectable: boolean;
}

export const WorkflowStepNode = memo(({ data, isConnectable }: WorkflowStepNodeProps) => {
  const Icon = data.icon || (() => null);
  const type = data.type || 'unknown';
  
  // Get background color based on step type
  const getNodeColor = () => {
    switch (type) {
      case 'function':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'user_input':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'if':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'for':
        return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800';
    }
  };

  // Generate a summary of the step
  const getStepSummary = () => {
    switch (type) {
      case 'function':
        return data.function_name || 'Function call';
      case 'user_input':
        return 'User input form';
      case 'if':
        return `If ${data.condition}`;
      case 'for':
        return `Loop over ${data.items}`;
      default:
        return data.description || 'Step';
    }
  };
  
  // Get input fields for user input step
  const renderUserInputs = () => {
    if (type !== 'user_input' || !data.userInputs) return null;
    
    return (
      <div className="mt-2 text-xs">
        <KeyValueDisplay
          data={data.userInputs}
          onUpdate={(key, value) => {
            if (data.setUserInputs) {
              const updatedInputs = { ...data.userInputs, [key]: value };
              data.setUserInputs(updatedInputs);
            }
          }}
          compact={true}
        />
      </div>
    );
  };

  return (
    <div className={cn(
      'rounded-md border shadow-sm p-3 transition-colors',
      getNodeColor()
    )}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-muted-foreground/50"
      />
      
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 flex items-center justify-center rounded-full bg-background border">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="font-medium text-sm truncate max-w-[180px]">
          {data.label || `Step ${data.step_number}`}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        {getStepSummary()}
      </div>
      
      {renderUserInputs()}
      
      {data.browserEvents && data.browserEvents.length > 0 && (
        <Collapsible className="mt-2">
          <CollapsibleTrigger className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
            {data.browserEvents.length} browser events
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="text-xs mt-1 max-h-24 overflow-y-auto">
              {data.browserEvents.map((event: any, index: number) => (
                <div key={index} className="text-muted-foreground mb-1">
                  {event.type}: {event.selector || event.url || ''}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-muted-foreground/50"
      />
    </div>
  );
});

WorkflowStepNode.displayName = 'WorkflowStepNode';
