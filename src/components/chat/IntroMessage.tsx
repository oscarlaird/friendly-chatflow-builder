
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Instagram, Linkedin, FileSpreadsheet, BrainCircuit } from 'lucide-react';

export const IntroMessage = () => {
  return (
    <div className="flex justify-start mb-4 w-full">
      <Card className="max-w-[85%] p-5 shadow-md border-l-4 border-l-primary">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 bg-primary/10 ring-2 ring-primary/20">
            <AvatarFallback className="text-primary font-semibold">M</AvatarFallback>
          </Avatar>
          <p className="text-lg font-semibold text-primary">I am Marco, your ai underling</p>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">You can teach me to do your job</p>
        
        <div className="space-y-4 mb-4">
          <p className="text-sm font-medium">I excel at:</p>
          <ul className="text-sm space-y-3 pl-2">
            <li className="flex items-center gap-3">
              <div className="flex space-x-1 items-center bg-blue-50 p-1.5 rounded-md">
                <Avatar className="h-5 w-5">
                  <AvatarImage src="https://www.salesforce.com/favicon.ico" alt="Salesforce" />
                  <AvatarFallback><span className="text-xs">SF</span></AvatarFallback>
                </Avatar>
                <Linkedin size={16} className="text-blue-600" />
                <Instagram size={16} className="text-pink-600" />
              </div>
              <span className="font-medium">Using websites</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="flex space-x-1 items-center bg-green-50 p-1.5 rounded-md">
                <Avatar className="h-5 w-5">
                  <AvatarImage src="https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x16.png" alt="Google Sheets" />
                  <AvatarFallback><span className="text-xs">GS</span></AvatarFallback>
                </Avatar>
                <Avatar className="h-5 w-5">
                  <AvatarImage src="https://c.s-microsoft.com/favicon.ico?v2" alt="Excel" />
                  <AvatarFallback><span className="text-xs">EX</span></AvatarFallback>
                </Avatar>
                <FileSpreadsheet size={16} className="text-green-600" />
              </div>
              <span className="font-medium">Working with spreadsheets</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-purple-50 p-1.5 rounded-md">
                <BrainCircuit size={18} className="text-purple-600" />
              </div>
              <span className="font-medium">Thinking (I'm smarter than you think!)</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium mb-1">What do you want me to do?</p>
          <p className="text-sm text-muted-foreground">Try to be detailed</p>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Afterwards I'll ask some follow up questions and allow you to share your screen to demonstrate your task.
        </p>
      </Card>
    </div>
  );
};
