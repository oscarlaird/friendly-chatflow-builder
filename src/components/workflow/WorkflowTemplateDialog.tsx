
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChats } from '@/hooks/useChats';

interface WorkflowTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowTemplateDialog({ open, onOpenChange }: WorkflowTemplateDialogProps) {
  const [title, setTitle] = useState('');
  const { createChat } = useChats();
  const navigate = useNavigate();

  const handleCreate = async () => {
    const newTitle = title.trim() || 'New Workflow';
    const newChat = await createChat(newTitle);
    
    if (newChat) {
      // Close the dialog
      onOpenChange(false);
      
      // Reset the title input
      setTitle('');
      
      // Navigate directly to the new workflow editor
      navigate(`/workflow/${newChat.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Give your workflow a name to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="title"
              placeholder="Workflow Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-4"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
