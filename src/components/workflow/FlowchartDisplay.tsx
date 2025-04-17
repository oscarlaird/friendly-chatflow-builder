
import { useState, useEffect } from "react";
import { WorkflowStep } from "./WorkflowStep";
import { BrowserEvent } from "@/types";
import { nestSteps, StepNode } from "./utils/nestingUtils";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface FlowchartDisplayProps {
  steps: any[];
  browserEvents?: Record<string, BrowserEvent[]>;
  className?: string;
  compact?: boolean;
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
  autoActivateSteps?: boolean;
}

export const FlowchartDisplay = ({ 
  steps, 
  browserEvents = {}, 
  className, 
  compact = false, 
  userInputs,
  setUserInputs,
  autoActivateSteps = false,
}: FlowchartDisplayProps) => {
  // Track previous steps for animation comparison
  const [prevStepsMap, setPrevStepsMap] = useState<Map<string, any>>(new Map());
  // Track changed steps to highlight them
  const [changedStepIds, setChangedStepIds] = useState<Set<string>>(new Set());
  // Add state for animated steps display
  const [visibleSteps, setVisibleSteps] = useState<any[]>(steps);
  
  // Create nested steps structure
  const nestedSteps = nestSteps(visibleSteps);

  // Reset visible steps when actual steps change
  useEffect(() => {
    setVisibleSteps(steps);
  }, [steps]);
  
  // Compare current steps with previous steps to detect changes
  useEffect(() => {
    const newStepsMap = new Map();
    const newChangedStepIds = new Set<string>();
    
    // Create a map of current steps by ID or step_number
    steps.forEach(step => {
      const stepId = step.id || `step-${step.step_number}`;
      newStepsMap.set(stepId, step);
      
      // Check if step exists in previous steps but has changed
      if (prevStepsMap.has(stepId)) {
        const prevStep = prevStepsMap.get(stepId);
        // Compare relevant properties to detect changes
        if (JSON.stringify(prevStep) !== JSON.stringify(step)) {
          newChangedStepIds.add(stepId);
        }
      }
    });
    
    // Update the previous steps map for next comparison
    setPrevStepsMap(newStepsMap);
    setChangedStepIds(newChangedStepIds);
    
    // Clear highlight effect after 2 seconds
    const timer = setTimeout(() => {
      setChangedStepIds(new Set());
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [steps]);
  
  // Get browser events for a specific step
  const getBrowserEventsForStep = (step: any) => {
    if (step.type !== 'function' || !step.function_name) return [];
    return browserEvents[step.function_name] || [];
  };
  
  // Get appropriate background color for a control block
  const getControlBlockStyle = (type: string) => {
    switch (type) {
      case 'for':
        return 'bg-[hsl(var(--dropbox-light-blue))] border-purple-300 dark:border-purple-800';
      case 'if':
        return 'bg-[hsl(var(--dropbox-light-blue))] border-blue-300 dark:border-blue-800';
      default:
        return 'bg-[hsl(var(--dropbox-light-blue))] dark:bg-gray-900/40';
    }
  };
  
  // Check if a step has changed
  const hasStepChanged = (step: any) => {
    const stepId = step.id || `step-${step.step_number}`;
    return changedStepIds.has(stepId);
  };
  
  // Render connection arrows between steps
  const renderArrow = (direction: 'down' | 'right') => {
    if (direction === 'down') {
      return (
        <div className="flex justify-center py-1">
          <div className="w-0.5 h-4 bg-[hsl(var(--dropbox-blue))/40] relative">
            <ArrowDown className="h-4 w-4 text-[hsl(var(--dropbox-blue))] absolute -bottom-2 -left-[7px]" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center px-1">
          <div className="h-0.5 w-4 bg-[hsl(var(--dropbox-blue))/40] relative">
            <ArrowRight className="h-4 w-4 text-[hsl(var(--dropbox-blue))] absolute -right-2 -top-[7px]" />
          </div>
        </div>
      );
    }
  };
  
  // Recursive component to render step nodes
  const renderStepNode = (node: StepNode, index: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const isUserInputStep = node.step.type === 'user_input';
    const stepId = node.step.id || `step-${node.step.step_number}`;
    const isChanged = hasStepChanged(node.step);
    
    // Animation variants
    const variants = {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
    };
    
    if (!hasChildren) {
      // For leaf nodes (no children), render a simple step
      return (
        <motion.div 
          key={`node-${stepId}`}
          className="workflow-node mb-2"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.3 }}
          layout
        >
          <motion.div
            animate={isChanged ? { 
              boxShadow: ['0 0 0px rgba(59, 130, 246, 0)', '0 0 15px rgba(59, 130, 246, 0.7)', '0 0 0px rgba(59, 130, 246, 0)'],
              backgroundColor: ['transparent', 'rgba(59, 130, 246, 0.1)', 'transparent']
            } : {}}
            transition={{ duration: 2, times: [0, 0.5, 1] }}
            className="flowchart-node"
          >
            <WorkflowStep
              step={node.step}
              browserEvents={getBrowserEventsForStep(node.step)}
              autoOpen={node.step.active === true || autoActivateSteps}
              hasChildren={false}
              isUserInputStep={isUserInputStep}
              userInputs={isUserInputStep ? userInputs : undefined}
              setUserInputs={isUserInputStep ? setUserInputs : undefined}
            />
          </motion.div>
          {index < visibleSteps.length - 1 && renderArrow('down')}
        </motion.div>
      );
    }
    
    // For parent nodes with children, render a container with the step and its children
    const blockStyle = getControlBlockStyle(node.step.type);
    
    return (
      <motion.div 
        key={`node-${stepId}`}
        className="workflow-node mb-2"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.3 }}
        layout
      >
        <motion.div 
          className={cn(
            blockStyle, 
            "rounded-md overflow-hidden border shadow-sm"
          )}
          animate={isChanged ? { 
            boxShadow: ['0 0 0px rgba(59, 130, 246, 0)', '0 0 15px rgba(59, 130, 246, 0.7)', '0 0 0px rgba(59, 130, 246, 0)'],
            backgroundColor: ['transparent', 'rgba(59, 130, 246, 0.1)', 'transparent']
          } : {}}
          transition={{ duration: 2, times: [0, 0.5, 1] }}
        >
          <WorkflowStep
            step={node.step}
            browserEvents={getBrowserEventsForStep(node.step)}
            autoOpen={node.step.active === true || autoActivateSteps}
            hasChildren={true}
            isUserInputStep={isUserInputStep}
            userInputs={isUserInputStep ? userInputs : undefined}
            setUserInputs={isUserInputStep ? setUserInputs : undefined}
          />
          
          {/* Render children in a container with improved visual structure */}
          <div className="p-3">
            <div className="pl-6 border-l-2 border-[hsl(var(--dropbox-blue))/30]">
              <AnimatePresence>
                {node.children.map((childNode, childIdx) => (
                  <div key={`child-${childNode.step.id || childNode.step.step_number}`} className="relative">
                    {childIdx > 0 && renderArrow('down')}
                    {renderStepNode(childNode, childIdx)}
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        {index < visibleSteps.length - 1 && renderArrow('down')}
      </motion.div>
    );
  };
  
  return (
    <div className={`${className || ''} w-full max-w-full overflow-hidden`}>      
      {/* Display workflow steps using the nested structure */}
      {nestedSteps?.length > 0 ? (
        <div className="space-y-1">
          <AnimatePresence>
            {nestedSteps.map((node, idx) => renderStepNode(node, idx))}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
};

FlowchartDisplay.displayName = "FlowchartDisplay";
