
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types';
import { CircleCheck, CircleDot, CircleX, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const RUNS_PER_PAGE = 20;

const StatusIcon = ({ state }: { state?: string }) => {
  switch (state) {
    case 'finished':
      return <CircleCheck className="h-4 w-4 text-green-500" />;
    case 'running':
      return <CircleDot className="h-4 w-4 text-blue-500 animate-pulse" />;
    case 'failed':
    case 'aborted':
    case 'window_closed':
      return <CircleX className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

// Create a type for the run data from Supabase that doesn't include coderunEvents
type RunData = Omit<Message, 'coderunEvents'> & {
  chat_title?: string;
  chats?: { title: string };
};

export const RecentRuns = () => {
  const [expanded, setExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRuns, setTotalRuns] = useState(0);
  const [runs, setRuns] = useState<RunData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchRuns(currentPage);
    }
  }, [currentPage, user]);

  const fetchRuns = async (page: number) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First get total count
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('uid', user.id)
        .eq('type', 'code_run');
      
      if (count !== null) {
        setTotalRuns(count);
      }

      // Then fetch the page of runs
      const { data: runsData, error } = await supabase
        .from('messages')
        .select(`
          *,
          chats (
            title
          )
        `)
        .eq('uid', user.id)
        .eq('type', 'code_run')
        .order('created_at', { ascending: false })
        .range((page - 1) * RUNS_PER_PAGE, page * RUNS_PER_PAGE - 1);

      if (error) throw error;

      // Cast the data from supabase to our RunData type
      const formattedRuns = runsData.map(run => ({
        ...run,
        chat_title: run.chats?.title,
        coderunEvents: [] // Add the required coderunEvents property
      })) as RunData[];

      setRuns(formattedRuns);
    } catch (error) {
      console.error('Error fetching runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRuns / RUNS_PER_PAGE);

  const getStateColor = (state?: string) => {
    switch (state) {
      case 'finished':
        return 'text-green-500';
      case 'running':
        return 'text-blue-500';
      case 'failed':
      case 'aborted':
      case 'window_closed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Runs</CardTitle>
            <CardDescription>Your workflow execution history</CardDescription>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <p className="text-sm text-muted-foreground">Loading runs...</p>
              </div>
            ) : runs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No runs found. Start by creating a workflow!
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {runs.slice(0, expanded ? undefined : 5).map((run) => (
                    <div 
                      key={run.id} 
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon state={run.code_run_state} />
                        <div>
                          <div className="font-medium">{run.chat_title || 'Untitled Workflow'}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                          </div>
                          <div className={`text-xs ${getStateColor(run.code_run_state)}`}>
                            {run.code_run_state ? run.code_run_state.replace(/_/g, ' ') : 'Unknown state'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/workflow/${run.chat_id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>

                {expanded && totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronUp className="h-4 w-4 rotate-90" />
                            <span className="ml-1">Previous</span>
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-sm px-4">
                            Page {currentPage} of {totalPages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <span className="mr-1">Next</span>
                            <ChevronUp className="h-4 w-4 -rotate-90" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
