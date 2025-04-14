
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Workflows from './pages/Workflows';
import WorkflowEditor from './pages/WorkflowEditor';
import AuthPage from './pages/auth';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import AgentSidePanel from './pages/AgentSidePanel';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/workflows" replace />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflow/:id" element={<WorkflowEditor />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/agent_sidepanel" element={<AgentSidePanel />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
