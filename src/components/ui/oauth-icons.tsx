
import { SiGooglesheets, SiGmail, SiMicrosoftoutlook365 } from '@icons-pack/react-simple-icons';

// Define the mapping of provider keys to icon components
export const OAuthIcons = {
  google_sheets: SiGooglesheets,
  gmail: SiGmail,
  outlook: SiMicrosoftoutlook365,
};

// Define the accepted provider types
export type OAuthProviderType = keyof typeof OAuthIcons;

interface OAuthIconProps {
  provider: OAuthProviderType;
  className?: string;
  size?: number;  
  isConnected?: boolean;
}

export function OAuthIcon({ provider, className, size = 16, isConnected = false }: OAuthIconProps) {
  const Icon = OAuthIcons[provider];
  if (!Icon) return null;

  // Color mapping for connected states
  const connectedColors: Record<string, string> = {
    google_sheets: '#34A853',
    gmail: '#EA4335',
    outlook: '#0078D4',
  };

  return (
    <Icon 
      className={className}
      size={size} 
      color={isConnected ? connectedColors[provider] : '#94a3b8'} 
    />
  );
}
