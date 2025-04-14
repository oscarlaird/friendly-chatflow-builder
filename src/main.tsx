
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import App from './App.tsx'
import './index.css'
import { TooltipProvider } from '@/components/ui/tooltip'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class">
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </ThemeProvider>
);
