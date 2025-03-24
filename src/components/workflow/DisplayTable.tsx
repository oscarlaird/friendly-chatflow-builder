
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DisplayTableProps {
  data: Record<string, any>[];
  className?: string;
}

export const DisplayTable = ({ data, className }: DisplayTableProps) => {
  if (!data || data.length === 0) {
    return <div className={cn("text-muted-foreground italic", className)}>No data</div>;
  }

  // Extract columns from the first row
  const columns = Object.keys(data[0]);

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
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column}`} className="align-top">
                  {typeof row[column] === 'object' ? 
                    JSON.stringify(row[column]) : 
                    String(row[column])
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
