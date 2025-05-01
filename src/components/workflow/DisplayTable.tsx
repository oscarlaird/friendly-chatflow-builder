import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SerializedTable } from "@/types/call_payload";

interface DisplayTableProps {
  table: SerializedTable;
  className?: string;
  maxRows?: number;
  isEditable?: boolean;
  onTableChange?: (newData: Record<string, any>[]) => void;
}

// Helper function to format cell values
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// PURE component - only state is for UI (showing full table)
export const DisplayTable = ({
  table,
  className,
  maxRows = 10,
  isEditable = false,
  onTableChange
}: DisplayTableProps) => {
  // UI-only state, not data state
  const [showFullTable, setShowFullTable] = useState(false);
  
  // Calculate what data to show based on maxRows
  const tableData = table.value.items;
  const visibleData = !showFullTable && tableData.length > maxRows 
    ? tableData.slice(0, maxRows)
    : tableData;
  
  // Handle cell value changes
  const handleCellChange = (rowIndex: number, column: string, inputValue: string) => {
    if (!onTableChange) return;
    
    // Create a new copy of the data
    const newData = JSON.parse(JSON.stringify(tableData));
    
    try {
      // Type conversion for values
      if (inputValue === 'true') {
        newData[rowIndex][column] = true;
      } else if (inputValue === 'false') {
        newData[rowIndex][column] = false;
      } else if (!isNaN(Number(inputValue)) && inputValue.trim() !== '') {
        newData[rowIndex][column] = Number(inputValue);
      } else if ((inputValue.startsWith('{') && inputValue.endsWith('}')) || 
                (inputValue.startsWith('[') && inputValue.endsWith(']'))) {
        newData[rowIndex][column] = JSON.parse(inputValue);
      } else {
        newData[rowIndex][column] = inputValue;
      }
    } catch (e) {
      // If parsing fails, use the raw string
      newData[rowIndex][column] = inputValue;
    }
    
    // Notify parent of change
    onTableChange(newData);
  };
  
  // Function to add a new row
  const addRow = () => {
    // Create an empty row with the same structure as existing rows
    const emptyRow = Object.keys(tableData[0] || {}).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    
    onTableChange([...tableData, emptyRow]);
  };
  
  // Function to remove a row
  const removeRow = (indexToRemove: number) => {
    onTableChange(tableData.filter((_, index) => index !== indexToRemove));
  };
  
  // Guard clauses for empty data
  if (!table || !table.value || !table.value.items || table.value.items.length === 0) return null;
  if (Object.keys(table.value.items[0]).length === 0) return null;
  
  const columns = Object.keys(table.value.items[0]);
  const hasMoreRows = table.value.items.length > maxRows;
  
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <Table className="w-full border text-sm">
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead key={column} className="font-medium text-xs px-2 py-1.5">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map(column => (
                <TableCell key={`${rowIndex}-${column}`} className="px-2 py-1">
                  {isEditable ? (
                    // Editable cell
                    <Input
                      className="h-7 text-xs w-full"
                      value={
                        typeof row[column] === 'object' && row[column] !== null
                          ? JSON.stringify(row[column])
                          : String(row[column] ?? '')
                      }
                      onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                    />
                  ) : (
                    // Display cell
                    typeof row[column] === 'boolean' ? (
                      row[column] ? 
                        <Check className="h-4 w-4 text-green-500" /> : 
                        <X className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm break-words max-w-[300px]">
                        {formatCellValue(row[column])}
                      </div>
                    )
                  )}
                </TableCell>
              ))}
              {isEditable && (
                <TableCell className="action-cell">
                  <button 
                    className="delete-row-btn" 
                    onClick={() => removeRow(rowIndex)}
                    aria-label="Delete row"
                  >
                    <X size={18} />
                  </button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {hasMoreRows && (
        <Button
          variant="link"
          className="text-xs mt-1 h-6 p-0"
          onClick={() => setShowFullTable(!showFullTable)}
        >
          {showFullTable ? "Show less" : `Show all (${table.value.items.length} rows)`}
        </Button>
      )}
      
      {isEditable && (
        <Button
          variant="link"
          className="text-xs mt-1 h-6 p-0"
          onClick={addRow}
          aria-label="Add row"
        >
          <Plus size={18} />
          <span>Add Row</span>
        </Button>
      )}
    </div>
  );
};