
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Jira,
  Vscode,
  Notion
} from 'lucide-react';

export const IntroMessage = () => {
  return (
    <div className="flex justify-start mb-4 w-full">
      <Card className="max-w-[85%] p-5 shadow-md border-l-4 border-l-primary">
        <div className="flex items-center gap-3 mb-5">
          <Avatar className="h-12 w-12 bg-primary/10 ring-2 ring-primary/20">
            <AvatarFallback className="text-primary font-semibold">M</AvatarFallback>
          </Avatar>
          <p className="text-xl font-semibold text-primary">I am Marco, your ai underling</p>
        </div>
        
        <p className="text-lg mb-5">You can teach me to do your job</p>
        
        <div className="mb-5">
          <p className="text-lg font-medium mb-3">I excel at:</p>
          <ul className="list-disc pl-6 space-y-4">
            <li className="flex items-center gap-3">
              <span className="text-lg">Using websites</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://www.salesforce.com/favicon.ico" alt="Salesforce" />
                  <AvatarFallback>SF</AvatarFallback>
                </Avatar>
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://static.licdn.com/sc/h/akt4ae504epesldzj74dzred8" alt="LinkedIn" />
                  <AvatarFallback>LI</AvatarFallback>
                </Avatar>
                <Twitter size={22} />
                <Facebook size={22} />
                <Chrome size={22} />
                <Github size={22} />
              </div>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-lg">Working with spreadsheets</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x16.png" alt="Google Sheets" />
                  <AvatarFallback>GS</AvatarFallback>
                </Avatar>
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://c.s-microsoft.com/favicon.ico?v2" alt="Excel" />
                  <AvatarFallback>EX</AvatarFallback>
                </Avatar>
                <FileSpreadsheet size={22} />
              </div>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-lg">Using professional tools</span>
              <div className="flex items-center gap-2">
                <Slack size={22} />
                <Trello size={22} />
                <Jira size={22} />
                <Figma size={22} />
                <Vscode size={22} />
                <Notion size={22} />
              </div>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-lg">Thinking (I'm smarter than you think!)</span>
              <BrainCircuit size={22} />
            </li>
          </ul>
        </div>
        
        <div className="mb-4">
          <p className="text-lg font-medium mb-2">What do you want me to do?</p>
          <p className="text-lg">Try to be detailed</p>
        </div>
        
        <p className="text-lg mt-4 text-primary">
          Afterwards I'll ask some follow up questions and allow you to share your screen to demonstrate your task.
        </p>
      </Card>
    </div>
  );
};
