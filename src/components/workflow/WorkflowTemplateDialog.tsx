
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
    const newTitle = title.trim() || 'Workflow';  // Simplified default title
    const newChat = await createChat(newTitle);
    
    if (newChat) {
      onOpenChange(false);
      setTitle('');
      navigate(`/workflow/${newChat.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Create New Workflow</DialogTitle>
          <DialogDescription className="text-sm">
            Give your workflow a name to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="title"
            placeholder="Workflow Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm"
            autoFocus
          />
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
