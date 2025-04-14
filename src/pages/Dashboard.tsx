
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout';
import { Home, FolderCog, Settings, ArrowUpRight, Clock, CircleDot, CircleCheck, CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useChats } from '@/hooks/useChats';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Mock data for the dashboard
const MOCK_DATA = {
  recentRuns: [
    { id: 1, name: 'Social Media Analysis', status: 'completed', date: '2025-04-10T14:30:00Z' },
    { id: 2, name: 'Customer Research', status: 'failed', date: '2025-04-09T10:15:00Z' },
    { id: 3, name: 'Data Extraction', status: 'in_progress', date: '2025-04-14T09:45:00Z' },
    { id: 4, name: 'Lead Generation', status: 'completed', date: '2025-04-08T16:20:00Z' },
    { id: 5, name: 'Email Campaign', status: 'completed', date: '2025-04-07T11:30:00Z' },
  ]
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <CircleCheck className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <CircleX className="h-4 w-4 text-red-500" />;
    case 'in_progress':
      return <CircleDot className="h-4 w-4 text-blue-500 animate-pulse" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState({
    totalWorkflows: 0,
    totalRuns: 0,
    creditsUsed: 0,
    totalCredits: 2000
  });

  useEffect(() => {
    if (!user) return;

    const fetchUserStats = async () => {
      // Fetch total workflows for the user
      const { count: workflowsCount, error: workflowsError } = await supabase
        .from('chats')
        .select('id', { count: 'exact' })
        .eq('uid', user.id);

      if (workflowsError) {
        console.error('Error fetching workflows:', workflowsError);
        return;
      }

      // Fetch total runs (code_run messages) for the user
      const { count: runsCount, error: runsError } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('uid', user.id)
        .eq('type', 'code_run');

      if (runsError) {
        console.error('Error fetching runs:', runsError);
        return;
      }

      // Fetch total credits used from model costs
      const { data: costsData, error: costsError } = await supabase
        .from('chats')
        .select('model_cost')
        .eq('uid', user.id);

      if (costsError) {
        console.error('Error fetching model costs:', costsError);
        return;
      }

      const totalModelCost = costsData.reduce((sum, chat) => sum + (chat.model_cost || 0), 0);
      const creditsUsed = Math.round(totalModelCost * 20); // 1$ = 20 credits

      setData({
        totalWorkflows: workflowsCount || 0,
        totalRuns: runsCount || 0,
        creditsUsed,
        totalCredits: 2000
      });
    };

    fetchUserStats();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={() => navigate('/workflows')}>
            View All Workflows
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalWorkflows}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalRuns}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Credits Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.creditsUsed} / {data.totalCredits}</div>
              <Progress 
                className="h-2 mt-2" 
                value={(data.creditsUsed / data.totalCredits) * 100} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Card>
            <CardHeader>
              <CardTitle>Recent Runs</CardTitle>
              <CardDescription>Your 5 most recent workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              {data.totalRuns > 0 ? (
                <div className="space-y-4">
                  {MOCK_DATA.recentRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <StatusIcon status={run.status} />
                        <div>
                          <div className="font-medium">{run.name}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(run.date)}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/workflow/${run.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent runs found. Start by creating a workflow!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
