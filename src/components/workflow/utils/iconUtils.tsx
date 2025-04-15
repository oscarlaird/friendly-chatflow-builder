
import { Component, FileQuestion, ListOrdered, SquareCheck } from "lucide-react";

// Returns the appropriate icon component for a step type
export const getStepIcon = (type: string) => {
  switch (type) {
    case 'function':
      return Component;
    case 'for':
      return ListOrdered;
    case 'if':
      return FileQuestion;
    case 'done':
      return SquareCheck;
    default:
      return Component;
  }
}; 
