
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useScreenshots } from '@/hooks/useScreenshots';
import { ScreenshotViewer } from '../screenshots/ScreenshotViewer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function RunningScreenshots() {
  const { user } = useAuth();
  const [runningRuns, setRunningRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const { latestScreenshot, requestScreenshot } = useScreenshots(selectedRoomId);
  const navigate = useNavigate();

  // Fetch currently running workflows
  useEffect(() => {
    if (!user) return;

    const fetchRunningRuns = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            chat_id,
            created_at,
            code_run_state,
            chats (
              title
            )
          `)
          .eq('uid', user.id)
          .eq('type', 'code_run')
          .eq('code_run_state', 'running')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        
        setRunningRuns(data || []);
        
        // If we have running runs and no selected room, select the first one
        if (data && data.length > 0 && !selectedRoomId) {
          setSelectedRoomId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching running runs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRunningRuns();
    
    // Set up periodic refresh
    const intervalId = setInterval(fetchRunningRuns, 5000);
    
    return () => clearInterval(intervalId);
  }, [user, selectedRoomId]);
  
  // Request screenshots for the selected room
  useEffect(() => {
    if (!selectedRoomId) return;
    
    // Initial request
    requestScreenshot(selectedRoomId);
    
    // Set up interval for continuous requests
    const intervalId = setInterval(() => {
      requestScreenshot(selectedRoomId);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [selectedRoomId, requestScreenshot]);

  // If no running runs, don't display anything
  if (runningRuns.length === 0 && !loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Running Workflows</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {runningRuns.map(run => (
              <div key={run.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{run.chats?.title || 'Untitled Workflow'}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/workflow/${run.chat_id}`)}
                  >
                    View Details
                  </Button>
                </div>
                {selectedRoomId === run.id && (
                  <ScreenshotViewer
                    screenshots={[]}
                    latestScreenshot={latestScreenshot}
                    isRunning={true}
                    title={run.chats?.title || 'Untitled Workflow'}
                    onRequestScreenshot={() => requestScreenshot(run.id)}
                    autoRequest={true}
                    compact={true}
                  />
                )}
                {selectedRoomId !== run.id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full py-8"
                    onClick={() => setSelectedRoomId(run.id)}
                  >
                    Click to view live screenshots
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
