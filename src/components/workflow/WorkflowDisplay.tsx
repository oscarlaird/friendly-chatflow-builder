import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkflowDisplayProps {
  id?: string;
  messageId?: string; // Support both id and messageId for backward compatibility
  onClose: () => void;
}

export const WorkflowDisplay: React.FC<WorkflowDisplayProps> = ({ id, messageId, onClose }) => {
  // Use messageId if provided, otherwise fall back to id
  const displayId = messageId || id;
  
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2" 
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Workflow Run Details</h2>
        <p>Workflow ID: {displayId}</p>
        {/* Add workflow visualization and details here */}
      </div>
    </div>
  );
}
