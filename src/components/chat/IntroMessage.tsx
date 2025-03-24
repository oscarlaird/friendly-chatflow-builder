
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileSpreadsheet, 
  BrainCircuit,
  Chrome,
  Github,
  Twitter,
  Facebook
} from 'lucide-react';

export const IntroMessage = () => {
  return (
    <div className="flex justify-start mb-4 w-full">
      <Card className="max-w-[85%] p-5 shadow-md border-l-4 border-l-primary">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 bg-primary/10 ring-2 ring-primary/20">
            <AvatarFallback className="text-primary font-semibold">M</AvatarFallback>
          </Avatar>
          <p className="text-xl font-semibold text-primary">I am Marco, your ai underling</p>
        </div>
        
        <p className="text-base mb-4">You can teach me to do your job</p>
        
        <div className="mb-5">
          <p className="text-base font-medium mb-3">I excel at:</p>
          <ul className="list-disc pl-6 space-y-4">
            <li className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://www.salesforce.com/favicon.ico" alt="Salesforce" />
                  <AvatarFallback>SF</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://static.licdn.com/sc/h/akt4ae504epesldzj74dzred8" alt="LinkedIn" />
                  <AvatarFallback>LI</AvatarFallback>
                </Avatar>
                <Twitter size={20} />
                <Facebook size={20} />
                <Chrome size={20} />
                <Github size={20} />
              </div>
              <span className="font-medium">Using websites</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x16.png" alt="Google Sheets" />
                  <AvatarFallback>GS</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://c.s-microsoft.com/favicon.ico?v2" alt="Excel" />
                  <AvatarFallback>EX</AvatarFallback>
                </Avatar>
                <FileSpreadsheet size={20} />
              </div>
              <span className="font-medium">Working with spreadsheets</span>
            </li>
            <li className="flex items-center gap-2">
              <BrainCircuit size={20} />
              <span className="font-medium">Thinking (I'm smarter than you think!)</span>
            </li>
          </ul>
        </div>
        
        <div className="mb-4">
          <p className="text-base font-medium mb-1">What do you want me to do?</p>
          <p className="text-base">Try to be detailed</p>
        </div>
        
        <p className="text-base mt-4 text-primary/80">
          Afterwards I'll ask some follow up questions and allow you to share your screen to demonstrate your task.
        </p>
      </Card>
    </div>
  );
};
