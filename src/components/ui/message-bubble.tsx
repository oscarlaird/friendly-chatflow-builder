
import * as React from "react";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  role: 'user' | 'assistant';
  children: React.ReactNode;
}

export const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ className, role, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-4",
          role === 'user' 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted mr-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";
