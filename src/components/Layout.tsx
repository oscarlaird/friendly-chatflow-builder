import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserProfile } from '@/components/ui/user-profile';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Home, FolderCog, Settings, LogOut, Menu, X } from 'lucide-react';
import { ExtensionStatus } from '@/components/ui/extension-status';
import { ConnectedApps } from '@/components/ui/ConnectedApps';
import { TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { FeedbackButton } from './FeedbackButton'; // New import

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [codeRuns, setCodeRuns] = useState(0);
  
  // Current plan is $100 = 2000 credits
  const totalCredits = 2000;
  
  useEffect(() => {
    if (user) {
      // Fetch total model cost and convert to credits (1$ = 20 credits)
      const fetchCreditsAndRuns = async () => {
        // Get total model cost
        const { data: costData, error: costError } = await supabase
          .from('chats')
          .select('model_cost')
          .eq('uid', user.id);
          
        if (costError) {
          console.error('Error fetching model costs:', costError);
          return;
        }
        
        const totalCost = costData.reduce((sum, chat) => sum + (chat.model_cost || 0), 0);
        const credits = Math.round(totalCost * 20); // Convert dollars to credits
        setCreditsUsed(credits);
        
        // Get total code runs
        const { data: runsData, error: runsError } = await supabase
          .from('messages')
          .select('type')
          .eq('uid', user.id)
          .eq('type', 'code_run');
          
        if (runsError) {
          console.error('Error fetching code runs:', runsError);
          return;
        }
        
        setCodeRuns(runsData.length);
      };
      
      fetchCreditsAndRuns();
    }
  }, [user]);
  
  // Current plan name
  const currentPlan = "$100 Plan";
  
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/workflows", label: "Workflows", icon: FolderCog },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile menu overlay */}
        {!sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setSidebarOpen(true)}
          />
        )}
        
        {/* Sidebar */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="text-lg font-bold">Macro AI</h1>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href === "/workflows" && location.pathname.includes("/workflow/"));
                
                return (
                  <Link key={item.href} to={item.href}>
                    <Button 
                      variant={isActive ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{currentPlan}</span>
                    <span className="text-xs text-muted-foreground">{codeRuns} total runs</span>
                  </div>
                  <span className="text-muted-foreground">{creditsUsed} / {totalCredits} credits</span>
                </div>
                <Progress value={(creditsUsed / totalCredits) * 100} />
              </div>
              
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center p-4 border-b">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-2 md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="flex-1" />
            
            <div className="flex items-center space-x-3">
              <ConnectedApps />
              <ExtensionStatus />
              <UserProfile />
            </div>
          </div>
          
          {/* Main content */}
          <main className="flex-1 overflow-auto relative">
            {children}
            <FeedbackButton />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
