
import { ReactNode } from 'react';
import { DisplayTable } from './DisplayTable';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisplayValueProps {
  value: any;
  className?: string;
}

export const DisplayValue = ({ value, className }: DisplayValueProps): ReactNode => {
  // Handle different data types appropriately
  if (value === null || value === undefined) {
    return <span className={cn("text-muted-foreground italic", className)}>None</span>;
  }
  
  // Array of objects - likely a table
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
    return <DisplayTable data={value} className={className} />;
  }
  
  // Array of primitives
  if (Array.isArray(value)) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {value.map((item, index) => (
          <div key={index} className="pl-2 border-l-2 border-muted">
            <DisplayValue value={item} />
          </div>
        ))}
      </div>
    );
  }
  
  // Boolean values
  if (typeof value === 'boolean') {
    return value ? 
      <Check className={cn("h-4 w-4 text-green-500", className)} /> : 
      <X className={cn("h-4 w-4 text-red-500", className)} />;
  }
  
  // Object values (not arrays)
  if (typeof value === 'object') {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="grid grid-cols-[30%_70%] items-start gap-2">
            <span className="font-medium text-sm text-muted-foreground">{key}:</span>
            <DisplayValue value={val} />
          </div>
        ))}
      </div>
    );
  }
  
  // Default case: strings, numbers, etc.
  return <span className={className}>{String(value)}</span>;
};
