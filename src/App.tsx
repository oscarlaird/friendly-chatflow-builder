
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
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/workflow/:id" element={<WorkflowEditor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/agent_sidepanel" element={<AgentSidePanel />} />
            <Route path="/old-home" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
