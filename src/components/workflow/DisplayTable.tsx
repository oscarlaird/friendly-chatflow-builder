
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Minus } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '@/components/ui/input';

interface DisplayTableProps {
  data: Record<string, any>[];
  title?: string;
  onRemove?: () => void;
  className?: string;
  maxRows?: number;
  isEditable?: boolean;
  onChange?: (value: any) => void;
  originalData?: Record<string, any>[];
  showResetButton?: boolean;
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
  isEditable = false,
  onChange,
  originalData,
  showResetButton = false,
}) => {
  const [showFullTable, setShowFullTable] = useState(false);
  const [displayData, setDisplayData] = useState<Record<string, any>[]>([]);
  const [editableData, setEditableData] = useState<Record<string, any>[]>([]);
  
  useEffect(() => {
    // If data has more rows than maxRows and we're not showing the full table,
    // only display the first maxRows rows
    if (data.length > maxRows && !showFullTable) {
      setDisplayData(data.slice(0, maxRows));
    } else {
      setDisplayData(data);
    }
    
    // Initialize editable data
    setEditableData(JSON.parse(JSON.stringify(data)));
  }, [data, maxRows, showFullTable]);
  
  // Handle cell value change in editable mode
  const handleCellValueChange = (rowIndex: number, column: string, value: string) => {
    const newData = [...editableData];
    
    try {
      // Try to parse as JSON if it looks like an object or array
      if ((value.startsWith('{') && value.endsWith('}')) || 
          (value.startsWith('[') && value.endsWith(']'))) {
        newData[rowIndex][column] = JSON.parse(value);
      } else if (value === 'true') {
        newData[rowIndex][column] = true;
      } else if (value === 'false') {
        newData[rowIndex][column] = false;
      } else if (!isNaN(Number(value)) && value.trim() !== '') {
        newData[rowIndex][column] = Number(value);
      } else {
        newData[rowIndex][column] = value;
      }
    } catch (e) {
      // If parsing fails, just use the string value
      newData[rowIndex][column] = value;
    }
    
    setEditableData(newData);
    
    // Notify parent of the change
    if (onChange) {
      onChange(newData);
    }
  };
  
  if (!data || !data.length) {
    return null;
  }
  
  // For empty data arrays or data with empty objects, don't render
  if (data.length === 0 || Object.keys(data[0]).length === 0) {
    return null;
  }
  
  const hasMoreRows = data.length > maxRows;
  const columns = Object.keys(data[0]);
  
  // Use the editable data when in editable mode, otherwise use the display data
  const tableData = isEditable ? editableData : displayData;

  return (
    <div className={cn("overflow-hidden max-h-80 max-w-full border rounded-md", className)}>
      {/* Title bar with optional title and remove button */}
      <div className="flex items-center justify-between p-1.5 bg-muted border-b">
        <div className="flex items-center space-x-1">
          {onRemove && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRemove}
              className="h-5 w-5 text-muted-foreground hover:text-destructive"
            >
              <Minus className="h-3 w-3" />
            </Button>
          )}
          {title && <h3 className="text-xs font-medium">{title}</h3>}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Show more/less toggle button */}
          {hasMoreRows && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullTable(!showFullTable)}
              className="h-5 text-xs"
            >
              {showFullTable ? 'Show Less' : `Show All (${data.length})`}
            </Button>
          )}
        </div>
      </div>
      
      {/* Table with horizontal scrolling */}
      <ScrollArea className="max-h-[calc(80vh-40px)]">
        <div className="overflow-x-auto max-w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="whitespace-nowrap text-xs p-2">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column}`} className="align-top p-1.5">
                      {isEditable ? (
                        <Input
                          value={formatValue(row[column])}
                          onChange={(e) => handleCellValueChange(rowIndex, column, e.target.value)}
                          className="w-full font-mono text-xs"
                          size={15}
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap overflow-auto text-xs max-h-40">
                          {formatValue(row[column])}
                        </pre>
                      )}
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
