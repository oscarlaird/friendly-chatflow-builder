
/**
 * Utility functions for transforming flat step arrays into nested structures
 */

interface StepNode {
  step: any;
  children: StepNode[];
}

/**
 * Transforms a flat array of steps into a nested structure based on control flow structure
 * 
 * @param flatSteps The flat array of steps to transform
 * @returns A nested structure of steps
 */
export const nestSteps = (flatSteps: any[]): StepNode[] => {
  if (!flatSteps || flatSteps.length === 0) {
    return [];
  }

  // Make a copy of the steps to avoid modifying the original
  const steps = JSON.parse(JSON.stringify(flatSteps));
  
  // Sort steps by step_number to ensure correct order
  steps.sort((a: any, b: any) => a.step_number - b.step_number);
  
  // Root level nodes
  const result: StepNode[] = [];
  let i = 0;
  
  while (i < steps.length) {
    const step = steps[i];
    i++;
    
    // Create a node for this step
    const node: StepNode = {
      step,
      children: []
    };
    
    // If this step has children (control steps like if/for)
    if ((step.type === 'for' || step.type === 'if') && step.child_count > 0) {
      // Process the next child_count steps as children
      let childrenProcessed = 0;
      let currentIndex = i;
      
      while (childrenProcessed < step.child_count && currentIndex < steps.length) {
        // Process the next step and all its descendants
        const childResult = processStepAndDescendants(steps, currentIndex, step.child_count - childrenProcessed);
        
        if (childResult.node) {
          node.children.push(childResult.node);
        }
        
        childrenProcessed += childResult.processedCount;
        currentIndex = childResult.nextIndex;
      }
      
      // Update the index to skip all processed children
      i = currentIndex;
    }
    
    result.push(node);
  }
  
  return result;
};

/**
 * Process a step and all its descendants recursively
 * 
 * @param steps The flat array of steps
 * @param startIndex The index of the current step
 * @param remainingChildren The number of remaining children to process at this level
 * @returns An object containing the processed node, number of steps processed, and next index
 */
function processStepAndDescendants(
  steps: any[], 
  startIndex: number, 
  remainingChildren: number
): { node: StepNode | null; processedCount: number; nextIndex: number } {
  if (startIndex >= steps.length || remainingChildren <= 0) {
    return { node: null, processedCount: 0, nextIndex: startIndex };
  }
  
  const step = steps[startIndex];
  
  // Create a node for this step
  const node: StepNode = {
    step,
    children: []
  };
  
  let nextIndex = startIndex + 1;
  let processedCount = 1;
  
  // If this step has children (control steps like if/for)
  if ((step.type === 'for' || step.type === 'if') && step.child_count > 0) {
    // Process the next child_count steps as children
    let childrenProcessed = 0;
    let currentIndex = nextIndex;
    
    while (childrenProcessed < step.child_count && currentIndex < steps.length) {
      // Process the next step and all its descendants
      const childResult = processStepAndDescendants(steps, currentIndex, step.child_count - childrenProcessed);
      
      if (childResult.node) {
        node.children.push(childResult.node);
      }
      
      childrenProcessed += childResult.processedCount;
      currentIndex = childResult.nextIndex;
    }
    
    // Update the next index
    nextIndex = currentIndex;
    processedCount += childrenProcessed;
  }
  
  return { node, processedCount, nextIndex };
}

// Export the StepNode interface
export type { StepNode };
