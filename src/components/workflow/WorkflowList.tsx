import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Clock, FileText, MoreVertical, Star, Trash, Copy, Edit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { OAuthIcon, OAuthProviderType } from '@/components/ui/oauth-icons';
import { Input } from '@/components/ui/input';

export function WorkflowList({ className = '' }: { className?: string }) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workflowApps, setWorkflowApps] = useState<{[key: string]: string[]}>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWorkflows();
      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('favoriteWorkflows');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, [user]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('uid', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Store the workflows
      setWorkflows(data || []);
      
      // Now fetch all required apps for these workflows in one batch
      if (data && data.length > 0) {
        const appsMap: {[key: string]: string[]} = {};
        
        // Extract apps directly from the workflow data
        data.forEach(workflow => {
          // Check if workflow has apps field and it's an array
          if (workflow.apps && Array.isArray(workflow.apps)) {
            appsMap[workflow.id] = workflow.apps;
          } else {
            appsMap[workflow.id] = []; // Empty array if no apps
          }
        });
        
        setWorkflowApps(appsMap);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (workflowId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const newFavorites = favorites.includes(workflowId)
      ? favorites.filter(id => id !== workflowId)
      : [...favorites, workflowId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteWorkflows', JSON.stringify(newFavorites));
    
    toast.success(
      favorites.includes(workflowId) 
        ? 'Removed from favorites' 
        : 'Added to favorites'
    );
  };

  const deleteWorkflow = async (workflowId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', workflowId);
      
      if (error) throw error;
      
      // Remove from local state
      setWorkflows(workflows.filter(w => w.id !== workflowId));
      
      // Remove from favorites if it's there
      if (favorites.includes(workflowId)) {
        const newFavorites = favorites.filter(id => id !== workflowId);
        setFavorites(newFavorites);
        localStorage.setItem('favoriteWorkflows', JSON.stringify(newFavorites));
      }
      
      toast.success('Workflow deleted');
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const duplicateWorkflow = async (workflow: any, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      // Create a copy of the workflow
      const newTitle = `${workflow.title || 'Untitled Workflow'} (Copy)`;
      
      const { data, error } = await supabase
        .from('chats')
        .insert({
          title: newTitle,
          uid: user?.id,
          steps: workflow.steps || [],
          apps: workflow.apps || []
        })
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        // Add the new workflow to the list
        setWorkflows([data[0], ...workflows]);
        toast.success('Workflow duplicated');
      }
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      toast.error('Failed to duplicate workflow');
    }
  };

  const handleRenameWorkflow = (workflowId: string, currentTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingWorkflowId(workflowId);
    setEditTitle(currentTitle);
  };

  const saveWorkflowTitle = async (workflowId: string, event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    
    if (editTitle.trim() === '') {
      toast.error('Workflow name cannot be empty');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ title: editTitle })
        .eq('id', workflowId);
      
      if (error) throw error;
      
      // Update local state
      setWorkflows(workflows.map(w => 
        w.id === workflowId ? { ...w, title: editTitle } : w
      ));
      
      setEditingWorkflowId(null);
      toast.success('Workflow renamed');
    } catch (error) {
      console.error('Error renaming workflow:', error);
      toast.error('Failed to rename workflow');
    }
  };

  const handleKeyDown = (workflowId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveWorkflowTitle(workflowId, e);
    } else if (e.key === 'Escape') {
      setEditingWorkflowId(null);
    }
  };

  const handleWorkflowClick = (workflowId: string) => {
    if (editingWorkflowId === workflowId) {
      return; // Prevent navigation when editing
    }
    navigate(`/workflow/${workflowId}`);
  };

  if (loading) {
    return (
      <div className={className}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="workflow-card overflow-hidden hover:shadow-md transition-shadow h-[160px] flex flex-col justify-between">
            <CardHeader className="pb-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardFooter className="pt-2">
              <Skeleton className="h-4 w-1/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No workflows yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {workflows.map((workflow) => {
        // Get required apps for this workflow from our state
        const requiredApps = workflowApps[workflow.id] || [];
        const isFavorite = favorites.includes(workflow.id);
        const isEditing = editingWorkflowId === workflow.id;
        
        return (
          <Card 
            key={workflow.id} 
            className="workflow-card overflow-hidden hover:shadow-md transition-shadow h-[160px] flex flex-col justify-between relative"
            onClick={() => handleWorkflowClick(workflow.id)}
          >
            {/* Favorite indicator */}
            {isFavorite && (
              <div className="absolute top-2 right-2 text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
              </div>
            )}
            
            <CardHeader className="pb-2 flex-1">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-1">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 pr-8">
                  {isEditing ? (
                    <div onClick={(e) => e.stopPropagation()} className="mt-1">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(workflow.id, e)}
                        autoFocus
                        className="h-8"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          onClick={(e) => saveWorkflowTitle(workflow.id, e)}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWorkflowId(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-lg truncate">{workflow.title || 'Untitled Workflow'}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}</span>
                      </CardDescription>
                    </>
                  )}
                </div>
                
                {/* Three-dot menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 w-8 p-0 absolute top-2 right-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleRenameWorkflow(workflow.id, workflow.title || 'Untitled Workflow', e)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Rename workflow
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => toggleFavorite(workflow.id, e)}>
                      <Star className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => duplicateWorkflow(workflow, e)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate workflow
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={(e) => deleteWorkflow(workflow.id, e)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete workflow
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            {requiredApps && requiredApps.length > 0 && (
              <CardFooter className="pt-2 border-t mt-auto">
                <div className="flex gap-2 flex-wrap">
                  {requiredApps.map((app: string) => (
                    <OAuthIcon 
                      key={app} 
                      provider={app as OAuthProviderType} 
                      size={16} 
                    />
                  ))}
                </div>
              </CardFooter>
            )}
            {(!requiredApps || requiredApps.length === 0) && (
              <CardFooter className="pt-2 border-t mt-auto">
                <span className="text-xs text-muted-foreground">No integrations</span>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
}
