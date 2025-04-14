
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  FileSpreadsheet, 
  BrainCircuit,
  Chrome,
  Github,
  Twitter,
  Facebook,
  Linkedin,
  Slack,
  Trello,
  Figma,
  Code,
  ClipboardList,
  Briefcase
} from 'lucide-react';

export const IntroMessage = () => {
  return (
    <div className="flex flex-col gap-4 items-center mb-8 w-full max-w-3xl mx-auto">
      {/* First Message - Introduction */}
      <Card className="w-full p-6 shadow-md border-l-4 border-l-primary bg-gradient-to-br from-card to-background">
        <div className="flex items-center gap-4 mb-5">
          <div className="h-12 w-12 rounded-full ring-2 ring-primary flex items-center justify-center bg-primary/10">
            <div className="relative w-8 h-8">
              {/* Geometric logo - overlapping shapes */}
              <div className="absolute top-0 left-0 w-5 h-5 bg-primary/80 rounded-sm transform rotate-45"></div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary/90 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-12"></div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-primary">I am Macro</h2>
            <p className="text-muted-foreground">your AI assistant</p>
          </div>
        </div>
      </Card>

      {/* Second Message - Purpose */}
      <Card className="w-[90%] p-6 shadow-md bg-card/50">
        <p className="text-xl mb-5 text-center font-medium">You can teach me to do your job</p>
        
        <div className="space-y-6">
          <p className="text-lg font-medium mb-3">I excel at:</p>
          <ul className="grid gap-4">
            <li className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <span className="text-lg flex-1">Using websites</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Chrome className="h-5 w-5" />
                <Github className="h-5 w-5" />
                <Twitter className="h-5 w-5" />
                <Facebook className="h-5 w-5" />
                <Linkedin className="h-5 w-5" />
              </div>
            </li>
            <li className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <span className="text-lg flex-1">Working with spreadsheets</span>
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            </li>
            <li className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <span className="text-lg flex-1">Using professional tools</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Slack className="h-5 w-5" />
                <Trello className="h-5 w-5" />
                <Briefcase className="h-5 w-5" />
                <Figma className="h-5 w-5" />
                <Code className="h-5 w-5" />
                <ClipboardList className="h-5 w-5" />
              </div>
            </li>
            <li className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <span className="text-lg flex-1">Thinking (I'm smarter than you think!)</span>
              <BrainCircuit className="h-5 w-5 text-muted-foreground" />
            </li>
          </ul>
        </div>
      </Card>

      {/* Third Message - Call to Action */}
      <Card className="w-[80%] p-6 text-center shadow-md bg-primary/5">
        <p className="text-lg font-medium mb-2">What do you want me to do? (Try to be detailed)</p>
        <p className="text-sm text-primary mt-4">
          Afterwards I'll ask some follow up questions and allow you to share your screen to demonstrate your task.
        </p>
      </Card>
    </div>
  );
};
