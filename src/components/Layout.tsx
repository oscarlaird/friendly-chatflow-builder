
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserProfile } from '@/components/ui/user-profile';
import { ExtensionStatus } from '@/components/ui/extension-status';
import { ConnectedApps } from '@/components/ui/ConnectedApps';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FeedbackButton } from './FeedbackButton';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen">
        {/* Top bar */}
        <div className="flex items-center p-4 border-b">
          <h1 className="text-lg font-bold">Mill</h1>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-3">
            <ConnectedApps />
            <ExtensionStatus />
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto relative">
          {children}
          <FeedbackButton />
        </main>
      </div>
    </TooltipProvider>
  );
}
