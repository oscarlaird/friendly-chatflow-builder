
import { ExternalLink } from "lucide-react";
import { BrowserEvent } from "@/types";

interface BrowserEventItemProps {
  event: BrowserEvent;
}

export const BrowserEventItem = ({ event }: BrowserEventItemProps) => {
  // Extract domain from URL for favicon
  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=16`;
    } catch (e) {
      return null;
    }
  };

  const browserState = event?.data?.browser_state;
  const currentGoal = event?.data?.current_goal;
  const faviconUrl = browserState?.url ? getFaviconUrl(browserState.url) : null;

  return (
    <div className="flex items-center gap-2 text-xs py-1 px-2 border-b border-muted/40 last:border-0">
      {faviconUrl ? (
        <img src={faviconUrl} alt="site favicon" className="w-4 h-4 flex-shrink-0" />
      ) : (
        <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      )}
      <span className="truncate">{currentGoal || 'Browser action'}</span>
    </div>
  );
};
