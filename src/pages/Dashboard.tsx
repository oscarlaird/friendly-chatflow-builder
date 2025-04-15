
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useChats } from '@/hooks/useChats';
import { ArrowUpRight } from 'lucide-react';
import { RecentRuns } from '@/components/dashboard/RecentRuns';
import { RunningScreenshots } from '@/components/dashboard/RunningScreenshots';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
      try {
        // Fetch total workflows count
        const { count: workflowsCount, error: workflowsError } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('uid', user.id);

        if (workflowsError) throw workflowsError;

        // Fetch total runs count (code_run messages)
        const { count: runsCount, error: runsError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('uid', user.id)
          .eq('type', 'code_run');

        if (runsError) throw runsError;

        // Fetch total credits used from model costs
        const { data: costsData, error: costsError } = await supabase
          .from('chats')
          .select('model_cost')
          .eq('uid', user.id);

        if (costsError) throw costsError;

        const totalModelCost = costsData.reduce((sum, chat) => sum + (chat.model_cost || 0), 0);
        const creditsUsed = Math.round(totalModelCost * 20); // 1$ = 20 credits

        setData({
          totalWorkflows: workflowsCount || 0,
          totalRuns: runsCount || 0,
          creditsUsed,
          totalCredits: 2000
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchUserStats();
  }, [user]);

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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalWorkflows}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalRuns}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credits Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.creditsUsed} / {data.totalCredits}
              </div>
              <Progress 
                className="h-2 mt-2" 
                value={(data.creditsUsed / data.totalCredits) * 100} 
              />
            </CardContent>
          </Card>
        </div>

        <RunningScreenshots />
        
        <RecentRuns />
      </div>
    </Layout>
  );
}
