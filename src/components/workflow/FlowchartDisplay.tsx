import { useState, useEffect } from "react";
import { WorkflowStep } from "./WorkflowStep";
import { BrowserEvent } from "@/types";
import { nestSteps, StepNode } from "./utils/nestingUtils";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface FlowchartDisplayProps {
  steps: any[];
  browserEvents?: Record<string, BrowserEvent[]>;
  className?: string;
  compact?: boolean;
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
  autoActivateSteps?: boolean;
  chatId?: string;
}

export const FlowchartDisplay = ({ 
  steps, 
  browserEvents = {}, 
  className, 
  compact = false, 
  userInputs,
  setUserInputs,
  autoActivateSteps = false,
  chatId,
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
          if (step.type !== "user_input") {
            newChangedStepIds.add(stepId);
          }
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
  
  // Check if a step has changed
  const hasStepChanged = (step: any) => {
    const stepId = step.id || `step-${step.step_number}`;
    return changedStepIds.has(stepId);
  };
  
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
  
  // Render connection arrows between steps
  const renderArrow = (isLast: boolean, currentStep?: any) => {
    // Check if this is the last step or if it's a 'done' type step
    if (isLast || (currentStep && currentStep.type === 'done')) return null;
    
    return (
      <div className="flex justify-center w-full py-3">
        <div className="flex items-center justify-center rounded-full bg-[hsl(var(--dropbox-light-blue))] p-1">
          <ArrowDown className="h-4 w-4 text-[hsl(var(--dropbox-blue))]" />
        </div>
      </div>
    );
  };
  
  // Recursive component to render step nodes
  const renderStepNode = (node: StepNode, index: number, isNested = false) => {
    const hasChildren = node.children && node.children.length > 0;
    const stepId = node.step.id || `step-${node.step.step_number}`;
    const isUserInputStep = node.step.type === 'user_input';
    
    const variants = {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
    };
    
    if (!hasChildren) {
      return (
        <motion.div 
          key={`node-${stepId}`}
          className="flex flex-col items-center w-full"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.3 }}
          layout
        >
          <div className="w-[320px]">
            <WorkflowStep
              steps={steps}
              step={node.step}
              browserEvents={getBrowserEventsForStep(node.step)}
              autoOpen={node.step.active === true || autoActivateSteps}
              hasChildren={false}
              isUserInputStep={isUserInputStep}
              userInputs={isUserInputStep ? userInputs : undefined}
              setUserInputs={isUserInputStep ? setUserInputs : undefined}
              compact={compact}
              uniformWidth={true}
              chatId={chatId}
              hasChanged={hasStepChanged(node.step)}
            />
          </div>
          {!isNested && index < visibleSteps.length - 1 && renderArrow(false, node.step)}
        </motion.div>
      );
    }
    
    const blockStyle = getControlBlockStyle(node.step.type);
    
    return (
      <motion.div 
        key={`node-${stepId}`}
        className="flex flex-col items-center w-full"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.3 }}
        layout
      >
        <div className="w-[320px]">
          <WorkflowStep
            steps={steps}
            step={node.step}
            browserEvents={getBrowserEventsForStep(node.step)}
            autoOpen={node.step.active === true || autoActivateSteps}
            hasChildren={true}
            isUserInputStep={isUserInputStep}
            userInputs={isUserInputStep ? userInputs : undefined}
            setUserInputs={isUserInputStep ? setUserInputs : undefined}
            compact={compact}
            uniformWidth={true}
            hasChanged={hasStepChanged(node.step)}
          />
        </div>
        
        {renderArrow(false, node.step)}
        
        <div className={cn(
          "w-[360px] px-5 py-4 rounded-lg border border-[hsl(var(--border))]",
          blockStyle
        )}>
          <AnimatePresence>
            {node.children.map((childNode, childIdx) => (
              <div key={`child-${childNode.step.id || childNode.step.step_number}`} 
                   className="flex flex-col items-center w-full">
                {renderStepNode(childNode, childIdx, true)}
                {childIdx < node.children.length - 1 && renderArrow(childIdx === node.children.length - 1, childNode.step)}
              </div>
            ))}
          </AnimatePresence>
        </div>
        
        {!isNested && index < visibleSteps.length - 1 && renderArrow(index === visibleSteps.length - 1, node.step)}
      </motion.div>
    );
  };
  
  return (
    <ScrollArea className={cn(
      "w-full h-full",
      "bg-white", // Ensure white background
      "bg-[radial-gradient(#e6e6e6_1px,transparent_1px)]", // Dotted background
      "bg-[size:16px_16px]", // Control dot size and spacing
      className
    )}>
      <div className="flex flex-col items-center w-full max-w-full p-4">
        {nestedSteps?.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <AnimatePresence>
              {nestedSteps.map((node, idx) => renderStepNode(node, idx))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

FlowchartDisplay.displayName = "FlowchartDisplay";
