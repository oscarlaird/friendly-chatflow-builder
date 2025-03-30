
/**
 * Utility functions for transforming flat step arrays into nested structures
 */

interface StepNode {
  step: any;
  children: StepNode[];
}

/**
 * Transforms a flat array of steps into a nested structure based on nesting_level and child_count
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
  
  // Root level is always 0
  return buildNestingLevel(steps, 0, 0, steps.length);
};

/**
 * Recursively builds a nested structure for steps at a specific nesting level
 * within a specified range of the flat steps array
 * 
 * @param steps The flat array of steps
 * @param nestingLevel The current nesting level to process
 * @param startIdx The starting index in the flat array
 * @param endIdx The ending index in the flat array (exclusive)
 * @returns An array of StepNodes for the current nesting level
 */
const buildNestingLevel = (
  steps: any[], 
  nestingLevel: number, 
  startIdx: number, 
  endIdx: number
): StepNode[] => {
  const result: StepNode[] = [];
  
  let i = startIdx;
  while (i < endIdx) {
    const step = steps[i];
    
    // If step's nesting level doesn't match current level, skip
    if (step.nesting_level !== nestingLevel) {
      i++;
      continue;
    }
    
    // Create a node for this step
    const node: StepNode = {
      step,
      children: []
    };
    
    // If this step has children (control steps like if/for)
    if ((step.type === 'for' || step.type === 'if') && step.child_count > 0) {
      // Find range of child steps
      const childNestingLevel = nestingLevel + 1;
      let childEndIdx = i + 1;
      let remainingChildren = step.child_count;
      
      // Find the end index for all direct children
      while (childEndIdx < endIdx && remainingChildren > 0) {
        if (steps[childEndIdx].nesting_level === childNestingLevel) {
          remainingChildren--;
        }
        childEndIdx++;
      }
      
      // Recursively build the children
      node.children = buildNestingLevel(steps, childNestingLevel, i + 1, childEndIdx);
    }
    
    result.push(node);
    i++;
  }
  
  return result;
};

// Export the StepNode interface
export type { StepNode };
