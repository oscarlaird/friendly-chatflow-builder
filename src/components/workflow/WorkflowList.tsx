
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chat } from '@/types';
import { Card } from '@/components/ui/card';
import { GitBranch, Clock, Calendar, Trash2, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChats } from '@/hooks/useChats';
import { format } from 'date-fns';

interface WorkflowListProps {
  workflows: Chat[];
}

export const WorkflowList = ({ workflows }: WorkflowListProps) => {
  const navigate = useNavigate();
  const { deleteChat, updateChatTitle } = useChats();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Sort workflows by creation date (newest first)
  const sortedWorkflows = [...workflows].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleOpenWorkflow = (id: string) => {
    navigate(`/workflow/${id}`);
  };

  const handleEditWorkflow = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveTitle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateChatTitle(id, editTitle);
    setEditingId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteWorkflow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteChat(id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedWorkflows.map((workflow) => (
        <Card 
          key={workflow.id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleOpenWorkflow(workflow.id)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              {editingId === workflow.id ? (
                <div className="flex items-center" onClick={e => e.stopPropagation()}>
                  <Input 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)}
                    className="h-8"
                    autoFocus
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 ml-1"
                    onClick={e => handleSaveTitle(workflow.id, e)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <h3 className="font-medium truncate">{workflow.title}</h3>
              )}
            </div>
            {editingId !== workflow.id && (
              <div className="flex items-center">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  onClick={e => handleEditWorkflow(workflow.id, workflow.title, e)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"
                  onClick={e => handleDeleteWorkflow(workflow.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {workflow.steps && Array.isArray(workflow.steps) ? (
              <div className="text-xs text-muted-foreground mb-2">
                {workflow.steps.length} steps
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mb-2">
                No steps defined
              </div>
            )}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground mt-4">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              Created {format(new Date(workflow.created_at), 'PPP')}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};
