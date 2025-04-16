import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Home, Settings, FolderCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const [usage, setUsage] = useState({ credits: 0, totalCredits: 10000, workflows: 0, runs: 0 });
  
  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;
      
      try {
        // Fetch total workflows
        const { data: workflows } = await supabase
          .from('chats')
          .select('count')
          .eq('uid', user.id);
          
        // Fetch total runs
        const { data: runs } = await supabase
          .from('messages')
          .select('count')
          .eq('uid', user.id);
          
        // Set usage data
        setUsage(prev => ({
          ...prev,
          workflows: workflows?.[0]?.count || 0,
          runs: runs?.[0]?.count || 0
        }));
      } catch (error) {
        console.error('Error fetching usage:', error);
      }
    };
    
    fetchUsage();
  }, [user]);
  
  if (!user) return null;
  
  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U';
  const userEmail = user.email || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={userEmail} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || userEmail}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Usage Stats */}
        <div className="p-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Credits Used</p>
              <p className="font-medium">{usage.credits}/{usage.totalCredits}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Workflows</p>
              <p className="font-medium">{usage.workflows}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Runs</p>
              <p className="font-medium">{usage.runs}</p>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            <span>Usage</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/workflows">
            <FolderCog className="mr-2 h-4 w-4" />
            <span>Workflows</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
