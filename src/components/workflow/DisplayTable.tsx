
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

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
    return <div className={cn("text-muted-foreground italic", className)}>No data</div>;
  }

  // Extract columns from the first row
  const columns = Object.keys(data[0]);

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    const updatedData = [...localData];
    
    // Try to convert to number if the original value was a number
    const originalValue = data[rowIndex][column];
    const newValue = typeof originalValue === 'number' ? parseFloat(value) : value;
    
    updatedData[rowIndex] = { ...updatedData[rowIndex], [column]: newValue };
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
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {localData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column}`} className="align-top">
                  {isInput ? (
                    <Input 
                      value={typeof row[column] === 'object' ? JSON.stringify(row[column]) : String(row[column])}
                      onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    typeof row[column] === 'object' ? 
                      JSON.stringify(row[column]) : 
                      String(row[column])
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
