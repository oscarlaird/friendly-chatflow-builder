
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function WorkflowList({ className = '' }: { className?: string }) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      setWorkflows(data || []);
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
            <CardFooter className="pt-2 flex justify-between items-center">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-20 rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No workflows yet</p>
        <Button onClick={() => navigate('/workflows')}>Create your first workflow</Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {workflows.map((workflow) => (
        <Card 
          key={workflow.id} 
          className="overflow-hidden hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-xl truncate">{workflow.title || 'Untitled Workflow'}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}</span>
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {workflow.message_count || 0} messages
            </span>
            <Button 
              variant="ghost" 
              className="gap-1"
              onClick={() => navigate(`/workflow/${workflow.id}`)}
            >
              Open <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
