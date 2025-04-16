
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OAuthIcon, OAuthProviderType } from '@/components/ui/oauth-icons';

export function WorkflowList({ className = '' }: { className?: string }) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workflowApps, setWorkflowApps] = useState<{[key: string]: string[]}>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWorkflows();
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

  if (loading) {
    return (
      <div className={className}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
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
        
        return (
          <Card 
            key={workflow.id} 
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/workflow/${workflow.id}`)}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl truncate">{workflow.title || 'Untitled Workflow'}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}</span>
              </CardDescription>
            </CardHeader>
            {requiredApps && requiredApps.length > 0 && (
              <CardFooter className="pt-2 flex gap-2">
                {requiredApps.map((app: string) => (
                  <OAuthIcon 
                    key={app} 
                    provider={app as OAuthProviderType} 
                    size={16} 
                  />
                ))}
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
}
