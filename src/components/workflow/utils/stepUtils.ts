
import { BrowserEvent } from "@/types";

// Utility functions for workflow steps
export const getStepIconAndColor = (type: string, subtype?: string) => {
  if (type === 'control') {
    if (subtype === 'if') {
      return { iconClass: 'i-lucide-git-branch-plus', colorClass: 'text-orange-500' };
    }
    if (subtype === 'for') {
      return { iconClass: 'i-lucide-repeat', colorClass: 'text-purple-500' };
    }
    if (subtype === 'while') {
      return { iconClass: 'i-lucide-repeat-circle', colorClass: 'text-indigo-500' };
    }
    if (subtype === 'try') {
      return { iconClass: 'i-lucide-shield', colorClass: 'text-cyan-500' };
    }
    return { iconClass: 'i-lucide-code', colorClass: 'text-gray-500' };
  }
  
  if (type === 'function') {
    return { iconClass: 'i-lucide-function-square', colorClass: 'text-blue-500' };
  }
  
  return { iconClass: 'i-lucide-square', colorClass: 'text-gray-500' };
};

export const formatStepTitle = (step: any) => {
  if (step.type === 'control') {
    if (step.control_type === 'if') {
      return `If: ${step.control_description || 'Condition'}`;
    }
    if (step.control_type === 'for') {
      return `For: ${step.control_description || 'Loop'}`;
    }
    if (step.control_type === 'while') {
      return `While: ${step.control_description || 'Loop'}`;
    }
    if (step.control_type === 'try') {
      return `Try: ${step.control_description || 'Block'}`;
    }
    return step.control_description || 'Control Structure';
  }
  
  if (step.type === 'function') {
    return step.description || step.function_name || 'Function';
  }
  
  return step.description || 'Step';
};

export const formatBrowserEventTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return 'Invalid time';
  }
};

export const isBrowserEventEmpty = (event: BrowserEvent) => {
  if (!event.data) return true;
  
  // Check if there's meaningful data in the browser event
  const hasCurrentGoal = event.data.current_goal && typeof event.data.current_goal === 'string' && event.data.current_goal.trim() !== '';
  const hasBrowserState = event.data.browser_state && Object.keys(event.data.browser_state).length > 0;
  
  return !hasCurrentGoal && !hasBrowserState;
};
