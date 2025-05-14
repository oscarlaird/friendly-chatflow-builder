import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisplayValueProps {
  value: any;
  className?: string;
  isEditable?: boolean;
  onValueChange?: (newValue: any) => void;
  compact?: boolean;
}

// Helper functions
const isArrayOfPrimitives = (arr: any[]): boolean => {
  return arr.every(item => typeof item !== 'object' || item === null);
};

const formatKeyName = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// PURE component - no internal state!
export const DisplayValue = ({
  value,
  className,
  isEditable = false,
  onValueChange,
  compact = false
}: DisplayValueProps): ReactNode => {
  // Handle primitive input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };
  
  // Type conversion helper
  const convertValue = (inputValue: string, originalType: string): any => {
    if (originalType === 'number') {
      const num = parseFloat(inputValue);
      return isNaN(num) ? inputValue : num;
    }
    return inputValue;
  };
  
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return isEditable ? 
      <Input 
        className={cn("h-8 text-sm", className)} 
        value="" 
        
        onChange={handleInputChange} 
        placeholder="Enter value" 
      /> : 
      <span className={cn("text-muted-foreground italic text-sm", className)}>None</span>;
  }
  
  // Primitive values
  if (typeof value !== 'object' || value === null) {
    if (isEditable) {
      // Boolean values use a select
      if (typeof value === 'boolean') {
        return (
          <Select 
            value={value ? "true" : "false"}
            onValueChange={(val) => onValueChange && onValueChange(val === "true")}
          >
            <SelectTrigger className={cn("h-8 text-sm", className)}>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      } 
      // Multiline strings use a textarea
      else if (typeof value === 'string' ) {
        return (
          <Textarea 
            className={cn("text-sm", className)} 
            value={value}
            rows={3}
            onChange={handleInputChange}
          />
        );
      } 
      // Numbers and strings use a simple input
      else {
        return (
          <Input 
            className={cn("h-8 text-sm", className)} 
            value={String(value)} 
            onChange={(e) => {
              if (onValueChange) {
                // Convert type for numbers
                if (typeof value === 'number') {
                  const num = parseFloat(e.target.value);
                  onValueChange(isNaN(num) ? e.target.value : num);
                } else {
                  onValueChange(e.target.value);
                }
              }
            }}
          />
        );
      }
    } 
    // Display-only for primitives
    else {
      if (typeof value === 'boolean') {
        return value ? 
          <Check className="h-4 w-4 text-green-500" /> : 
          <X className="h-4 w-4 text-red-500" />;
      }
      return <span className={cn("text-sm", className)}>{String(value)}</span>;
    }
  }
  
  // For array of primitives
  if (Array.isArray(value) && isArrayOfPrimitives(value)) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            {isEditable && (
              <button 
                onClick={() => {
                  if (onValueChange) {
                    const newArray = [...value];
                    newArray.splice(index, 1);
                    onValueChange(newArray);
                  }
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="flex-1 pl-1 border-l border-muted">
              <DisplayValue 
                value={item} 
                isEditable={isEditable}
                onValueChange={isEditable ? 
                  (newVal) => {
                    if (onValueChange) {
                      const newArray = [...value];
                      newArray[index] = newVal;
                      onValueChange(newArray);
                    }
                  } : undefined
                }
              />
            </div>
          </div>
        ))}
        {isEditable && (
          <button
            className="text-xs text-muted-foreground hover:text-primary mt-1 flex items-center"
            onClick={() => {
              if (onValueChange) {
                // Add default value based on array type
                const defaultValue = value.length > 0 ?
                  (typeof value[0] === 'string' ? '' : 
                   typeof value[0] === 'number' ? 0 :
                   typeof value[0] === 'boolean' ? false : null) : '';
                
                onValueChange([...value, defaultValue]);
              }
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Add item
          </button>
        )}
      </div>
    );
  }
  
  // For nested objects with key-value pairs
  if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value);
    
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {entries.map(([key, val]) => (
          <div key={key} className="grid grid-cols-[30%_70%] items-start gap-1">
            <span className="font-medium text-xs text-muted-foreground">{formatKeyName(key)}:</span>
            <DisplayValue 
              value={val} 
              isEditable={isEditable}
              onValueChange={isEditable ? 
                (newVal) => {
                  if (onValueChange) {
                    const newObj = { ...value, [key]: newVal };
                    onValueChange(newObj);
                  }
                } : undefined
              }
            />
          </div>
        ))}
      </div>
    );
  }
  
  // For arrays of objects, handle it differently (tables)
  // We don't render tables here, the parent KeyValueDisplay handles that case
  if (Array.isArray(value) && value.length > 0 && !isArrayOfPrimitives(value)) {
    return <span className="text-sm italic">Complex data (see table)</span>;
  }
  
  // Fallback for any other types
  return <span className={cn("text-sm", className)}>{formatValue(value)}</span>;
};