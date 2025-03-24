
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Instagram, Linkedin, FileSpreadsheet, BrainCircuit } from 'lucide-react';

export const IntroMessage = () => {
  return (
    <div className="flex justify-start mb-4">
      <Card className="max-w-[80%] p-4">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://www.google.com/favicon.ico" alt="Google" />
            <AvatarFallback>G</AvatarFallback>
          </Avatar>
          <p className="text-base font-medium">I am Marco, your ai underling</p>
        </div>
        
        <p className="text-sm italic mb-2">*You can teach me to do your job*</p>
        
        <p className="text-sm font-medium mb-1">I excel at:</p>
        <ul className="text-sm mb-2 space-y-2">
          <li className="flex items-center gap-2">
            <div className="flex space-x-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src="https://www.salesforce.com/favicon.ico" alt="Salesforce" />
                <AvatarFallback><span className="text-xs">SF</span></AvatarFallback>
              </Avatar>
              <Linkedin size={16} className="text-blue-500" />
              <Instagram size={16} className="text-pink-500" />
            </div>
            <span>using websites</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="flex space-x-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src="https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x16.png" alt="Google Sheets" />
                <AvatarFallback><span className="text-xs">GS</span></AvatarFallback>
              </Avatar>
              <Avatar className="h-5 w-5">
                <AvatarImage src="https://c.s-microsoft.com/favicon.ico?v2" alt="Excel" />
                <AvatarFallback><span className="text-xs">EX</span></AvatarFallback>
              </Avatar>
              <FileSpreadsheet size={16} className="text-green-500" />
            </div>
            <span>working with spreadsheets</span>
          </li>
          <li className="flex items-center gap-2">
            <BrainCircuit size={16} className="text-purple-500" />
            <span>thinking (I'm smarter than you think!)</span>
          </li>
        </ul>
        
        <p className="text-sm font-medium mb-1">What do you want me to do?</p>
        <p className="text-sm italic">*Try to be detailed*</p>
        
        <p className="text-xs text-muted-foreground mt-2">
          Afterwards I'll ask some follow up questions and allow you to share your screen to demonstrate your task.
        </p>
      </Card>
    </div>
  );
};
