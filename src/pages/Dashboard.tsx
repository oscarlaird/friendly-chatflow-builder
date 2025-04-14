
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout';
import { Home, FolderCog, Settings, ArrowUpRight, Clock, CircleDot, CircleCheck, CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useChats } from '@/hooks/useChats';

// Mock data for the dashboard
const MOCK_DATA = {
  totalWorkflows: 0,
  totalRuns: 0,
  creditsUsed: 2500,
  totalCredits: 10000,
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
  const { chats } = useChats();
  const [data, setData] = useState(MOCK_DATA);
  
  useEffect(() => {
    setData(prev => ({
      ...prev,
      totalWorkflows: chats.length
    }));
  }, [chats]);

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
              {data.recentRuns.length > 0 ? (
                <div className="space-y-4">
                  {data.recentRuns.map((run) => (
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
