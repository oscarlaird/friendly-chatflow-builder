
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Minus } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface DisplayTableProps {
  data: Record<string, any>[];
  title?: string;
  onRemove?: () => void;
  className?: string;
  maxRows?: number;
  isInput?: boolean;
  onChange?: (value: any) => void;
}

/**
 * Format a value for display, handling objects, arrays, and other types
 */
const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    try {
      // For arrays and objects, stringify with indentation
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return String(value);
    }
  }
  
  return String(value);
};

/**
 * Component to display tabular data with a header row and optional title
 */
export const DisplayTable: React.FC<DisplayTableProps> = ({
  data,
  title,
  onRemove,
  className,
  maxRows = 10,
  isInput = false,
  onChange,
}) => {
  const [showFullTable, setShowFullTable] = useState(false);
  const [displayData, setDisplayData] = useState<Record<string, any>[]>([]);
  
  useEffect(() => {
    // If data has more rows than maxRows and we're not showing the full table,
    // only display the first maxRows rows
    if (data.length > maxRows && !showFullTable) {
      setDisplayData(data.slice(0, maxRows));
    } else {
      setDisplayData(data);
    }
  }, [data, maxRows, showFullTable]);
  
  if (!data || !data.length) {
    return null;
  }
  
  // For empty data arrays or data with empty objects, don't render
  if (data.length === 0 || Object.keys(data[0]).length === 0) {
    return null;
  }
  
  const hasMoreRows = data.length > maxRows;
  const columns = Object.keys(data[0]);

  return (
    <div className={cn("overflow-hidden max-h-80 max-w-full border rounded-md", className)}>
      {/* Title bar with optional title and remove button */}
      <div className="flex items-center justify-between p-2 bg-muted border-b">
        <div className="flex items-center space-x-2">
          {onRemove && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRemove}
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
          {title && <h3 className="text-sm font-medium">{title}</h3>}
        </div>
        
        {/* Show more/less toggle button */}
        {hasMoreRows && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullTable(!showFullTable)}
            className="h-6 text-xs"
          >
            {showFullTable ? 'Show Less' : `Show All (${data.length})`}
          </Button>
        )}
      </div>
      
      {/* Table with horizontal scrolling */}
      <ScrollArea className="max-h-[calc(80vh-40px)]">
        <div className="overflow-x-auto max-w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="whitespace-nowrap">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column}`} className="align-top">
                      <pre className="whitespace-pre-wrap overflow-auto text-xs max-h-40">
                        {formatValue(row[column])}
                      </pre>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};
