
import { useState, useEffect, useRef } from "react";
import { WorkflowStep } from "./WorkflowStep";
import { BrowserEvent } from "@/types";
import { nestSteps, StepNode } from "./utils/nestingUtils";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface WorkflowDisplayProps {
  steps: any[];
  browserEvents?: Record<string, BrowserEvent[]>;
  className?: string;
  compact?: boolean;
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
  autoActivateSteps?: boolean;
}

export const WorkflowDisplay = ({ 
  steps, 
  browserEvents = {}, 
  className, 
  compact = false, 
  userInputs,
  setUserInputs,
  autoActivateSteps = false,
}: WorkflowDisplayProps) => {
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
        return 'bg-purple-100/30 dark:bg-purple-900/30';
      case 'if':
        return 'bg-blue-100/30 dark:bg-blue-900/30';
      default:
        return 'bg-gray-50 dark:bg-gray-900/40';
    }
  };
  
  // Check if a step has changed
  const hasStepChanged = (step: any) => {
    const stepId = step.id || `step-${step.step_number}`;
    return changedStepIds.has(stepId);
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
            "rounded-md overflow-hidden border border-gray-200 dark:border-gray-800"
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
          
          <div className="p-3">
            <AnimatePresence>
              {node.children.map((childNode, childIdx) => renderStepNode(childNode, childIdx))}
            </AnimatePresence>
          </div>
        </motion.div>
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

WorkflowDisplay.displayName = "WorkflowDisplay";
