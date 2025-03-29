
import { Component, ListOrdered, FileQuestion, SquareCheck, Check, X } from "lucide-react";

// Get the appropriate icon for the step type
export const getStepIcon = (type: string) => {
  switch (type) {
    case 'function':
      return <Component className="h-4 w-4" />;
    case 'for':
      return <ListOrdered className="h-4 w-4" />;
    case 'if':
      return <FileQuestion className="h-4 w-4" />;
    case 'done':
      return <SquareCheck className="h-4 w-4" />;
    default:
      return <Component className="h-4 w-4" />;
  }
};

// Format function name for display
export const formatFunctionName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
