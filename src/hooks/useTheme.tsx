
import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, setTheme } = useNextTheme();
  
  return {
    theme: theme as 'light' | 'dark' | 'system',
    setTheme
  };
}
