
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

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Current plan is Trial, with 2500/10000 credits used
  const creditsUsed = 2500;
  const totalCredits = 10000;
  const currentPlan = "Trial";
  
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/workflows", label: "Workflows", icon: FolderCog },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  
  // Use useEffect to navigate instead of doing it directly in the render function
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
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
                  <span className="font-medium">{currentPlan}</span>
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
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
