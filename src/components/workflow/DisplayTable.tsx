
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";

// Helper function to format column names (remove underscores and capitalize)
const formatColumnName = (column: string): string => {
  return column
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface DisplayTableProps {
  data: Record<string, any>[];
  className?: string;
  isInput?: boolean;
  onChange?: (data: Record<string, any>[]) => void;
}

export const DisplayTable = ({ data, className, isInput = false, onChange }: DisplayTableProps) => {
  const [localData, setLocalData] = useState<Record<string, any>[]>(data || []);

  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className={cn("text-muted-foreground italic", className)}>
        {isInput ? (
          <div className="flex flex-col gap-2">
            <div>No data. Add a row to get started.</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={handleAddRow}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Row
            </Button>
          </div>
        ) : (
          "No data"
        )}
      </div>
    );
  }

  // Extract columns from the first row
  const columns = Object.keys(data[0]);

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    const updatedData = [...localData];
    
    // Try to convert to number if the original value was a number
    const originalValue = data[rowIndex]?.[column];
    const newValue = typeof originalValue === 'number' ? parseFloat(value) : value;
    
    updatedData[rowIndex] = { ...updatedData[rowIndex], [column]: newValue };
    setLocalData(updatedData);
    
    if (onChange) {
      onChange(updatedData);
    }
  };

  const handleAddRow = () => {
    // Create a new empty row with the same structure as existing rows
    const newRow = columns.reduce((obj, col) => {
      obj[col] = '';
      return obj;
    }, {} as Record<string, any>);
    
    const updatedData = [...localData, newRow];
    setLocalData(updatedData);
    
    if (onChange) {
      onChange(updatedData);
    }
  };

  const handleRemoveRow = (rowIndex: number) => {
    const updatedData = localData.filter((_, idx) => idx !== rowIndex);
    setLocalData(updatedData);
    
    if (onChange) {
      onChange(updatedData);
    }
  };

  return (
    <div className={cn("overflow-auto max-h-80 border rounded-md", className)}>
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column} className="whitespace-nowrap font-medium">
                {formatColumnName(column)}
              </TableHead>
            ))}
            {isInput && <TableHead className="w-12"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {localData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column}`} className="align-top">
                  {isInput ? (
                    <Input 
                      value={typeof row[column] === 'object' ? JSON.stringify(row[column]) : String(row[column] ?? '')}
                      onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    typeof row[column] === 'object' ? 
                      JSON.stringify(row[column]) : 
                      String(row[column] ?? '')
                  )}
                </TableCell>
              ))}
              {isInput && (
                <TableCell className="w-12 p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRow(rowIndex)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isInput && (
        <div className="p-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={handleAddRow}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Row
          </Button>
        </div>
      )}
    </div>
  );
};
