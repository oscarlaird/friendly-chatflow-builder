
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chat } from '@/types';
import { Card } from '@/components/ui/card';
import { GitBranch, Clock, Trash2, Edit, Check, X, MoreHorizontal, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChats } from '@/hooks/useChats';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleRunWorkflow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // For now, just navigate to the workflow
    navigate(`/workflow/${id}`);
  };

  const handleEditWorkflow = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveTitle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await updateChatTitle(id, editTitle);
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteWorkflow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this workflow?")) {
      await deleteChat(id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedWorkflows.map((workflow) => (
        <Card 
          key={workflow.id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => handleOpenWorkflow(workflow.id)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-2 rounded-md bg-primary/10">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              {editingId === workflow.id ? (
                <div className="flex items-center flex-1" onClick={e => e.stopPropagation()}>
                  <Input 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)}
                    className="h-8 flex-1"
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
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8"
                  onClick={e => handleRunWorkflow(workflow.id, e)}
                >
                  <Play className="h-4 w-4 text-green-500" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={e => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={e => {
                        e.stopPropagation();
                        handleEditWorkflow(workflow.id, workflow.title, e);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit name
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={e => handleDeleteWorkflow(workflow.id, e)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
