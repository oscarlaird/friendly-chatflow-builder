import { ExternalLink, Check, X, ChevronRight, ChevronDown, Component, FileQuestion, ListOrdered, SquareCheck } from "lucide-react";

// Returns the appropriate icon component for a step type
export const getStepIcon = (type: string) => {
  switch (type) {
    case 'function':
      return <Component className="h-4 w-4 text-blue-500" />;
    case 'for':
      return <ListOrdered className="h-4 w-4 text-purple-500" />;
    case 'if':
      return <FileQuestion className="h-4 w-4 text-blue-500" />;
    case 'done':
      return <SquareCheck className="h-4 w-4 text-green-500" />;
    default:
      return <Component className="h-4 w-4 text-gray-500" />;
  }
}; 