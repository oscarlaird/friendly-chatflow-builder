import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Workflows from './pages/Workflows';
import WorkflowEditor from './pages/WorkflowEditor';
import Settings from './pages/Settings';
import AuthPage from './pages/auth';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/AuthCallback';
import AgentSidePanel from './pages/AgentSidePanel';
import Index from './pages/Index';
import Landing from './pages/Landing';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Create a client
const queryClient = new QueryClient();

// AppRoutes component to handle route protection and redirects
const AppRoutes = () => {
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Only run this effect on initial page load
  useEffect(() => {
    // Set flag to false after initial load
    setIsInitialLoad(false);
  }, []);

  return (
    <Routes>
      {/* Dashboard and app routes */}
      <Route path="/app" element={<Dashboard />} />
      <Route path="/workflows" element={<Workflows />} />
      <Route path="/workflow/:id" element={<WorkflowEditor />} />
      <Route path="/settings" element={<Settings />} />
      
      {/* Auth routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth-callback" element={<AuthCallback />} />
      
      {/* Other routes */}
      <Route path="/agent_sidepanel" element={<AgentSidePanel />} />
      <Route path="/old-home" element={<Index />} />
      
      {/* Landing page only for home path, not for deep links */}
      <Route path="/" element={<Landing />} />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
