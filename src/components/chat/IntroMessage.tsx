
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const IntroMessage = () => {
  return (
    <div className="flex justify-start mb-4">
      <Card className="max-w-[80%] p-4 flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://www.google.com/favicon.ico" alt="Google" />
          <AvatarFallback>G</AvatarFallback>
        </Avatar>
        <p className="text-sm">I am a workflow helper</p>
      </Card>
    </div>
  );
};
