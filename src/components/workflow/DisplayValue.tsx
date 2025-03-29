
import { ReactNode, useState, useEffect } from 'react';
import { DisplayTable } from './DisplayTable';
import { Check, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

// Helper function to format key names
const formatKeyName = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to check if an array contains only primitive values
const isArrayOfPrimitives = (arr: any[]): boolean => {
  return arr.every(item => typeof item !== 'object' || item === null);
};

// Helper function to convert an array of primitives to a table-compatible format
const convertArrayToTableData = (arr: any[]): Record<string, any>[] => {
  return arr.map(item => ({ value: item }));
};

interface DisplayValueProps {
  value: any;
  className?: string;
  isEditable?: boolean;
  onChange?: (value: any) => void;
  path?: string;
  originalValue?: any;
  compact?: boolean;
}

export const DisplayValue = ({ 
  value, 
  className, 
  isEditable = false, 
  onChange, 
  path = '', 
  originalValue,
  compact = false
}: DisplayValueProps): ReactNode => {
  const [localValue, setLocalValue] = useState<any>(value);
  
  // Update local value when the prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleValueChange = (newValue: any) => {
    setLocalValue(newValue);
    if (onChange) onChange(newValue);
  };

  const handleObjectValueChange = (key: string, newValue: any) => {
    if (typeof localValue === 'object' && localValue !== null) {
      const updatedValue = { ...localValue, [key]: newValue };
      setLocalValue(updatedValue);
      if (onChange) onChange(updatedValue);
    }
  };

  const handleArrayItemChange = (index: number, newValue: any) => {
    if (Array.isArray(localValue)) {
      const updatedArray = [...localValue];
      updatedArray[index] = newValue;
      setLocalValue(updatedArray);
      if (onChange) onChange(updatedArray);
    }
  };

  // Handle null/undefined values
  if (localValue === null || localValue === undefined) {
    return isEditable ? 
      <Input 
        className={cn("h-8 text-sm", className)} 
        value="" 
        onChange={(e) => handleValueChange(e.target.value)} 
        placeholder="Enter value" 
        size={20}
      /> : 
      <span className={cn("text-muted-foreground italic text-sm", className)}>None</span>;
  }
  
  // Array of objects - likely a table - don't convert, display as-is
  if (Array.isArray(localValue) && localValue.length > 0 && !isArrayOfPrimitives(localValue)) {
    return (
      <DisplayTable 
        data={localValue} 
        className={className} 
        isEditable={isEditable}
        onChange={isEditable ? handleValueChange : undefined}
        originalData={originalValue}
      />
    );
  }
  
  // Array of primitives - convert to a single-column table if appropriate
  if (Array.isArray(localValue) && localValue.length > 0 && isArrayOfPrimitives(localValue)) {
    // For small arrays of simple values, use the default array display
    const shouldUseTable = localValue.length > 3;
    
    if (shouldUseTable) {
      const tableData = convertArrayToTableData(localValue);
      return (
        <DisplayTable 
          data={tableData} 
          className={className} 
          isEditable={isEditable}
          onChange={isEditable ? (newData) => {
            // Convert back from table format to array
            handleValueChange(newData.map((item: any) => item.value));
          } : undefined}
          originalData={originalValue ? convertArrayToTableData(originalValue) : undefined}
        />
      );
    }
    
    // For smaller arrays, use the simpler display
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {localValue.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            {isEditable && (
              <button 
                onClick={() => {
                  const newArray = [...localValue];
                  newArray.splice(index, 1);
                  handleValueChange(newArray);
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
                onChange={(newValue) => handleArrayItemChange(index, newValue)}
                path={`${path}[${index}]`}
                originalValue={originalValue?.[index]}
                compact={compact}
              />
            </div>
          </div>
        ))}
        {isEditable && (
          <button
            className="text-xs text-muted-foreground hover:text-primary mt-1"
            onClick={() => {
              const newArray = [...localValue];
              newArray.push(typeof localValue[0] === 'string' ? '' : 
                           typeof localValue[0] === 'number' ? 0 :
                           typeof localValue[0] === 'boolean' ? false : null);
              handleValueChange(newArray);
            }}
          >
            + Add item
          </button>
        )}
      </div>
    );
  }
  
  // Boolean values
  if (typeof localValue === 'boolean') {
    return isEditable ? (
      <Checkbox 
        checked={localValue} 
        onCheckedChange={handleValueChange}
        className={className}
      />
    ) : (
      localValue ? 
        <Check className={cn("h-4 w-4 text-green-500", className)} /> : 
        <X className={cn("h-4 w-4 text-red-500", className)} />
    );
  }
  
  // Object values (not arrays)
  if (typeof localValue === 'object') {
    const entries = Object.entries(localValue);
    const useHorizontalLayout = compact && entries.length <= 3 && 
                               !entries.some(([_, val]) => 
                                 typeof val === 'object' && val !== null && 
                                 !(Array.isArray(val) && val.length === 0));
    
    return useHorizontalLayout ? (
      // Horizontal layout for simple objects with few entries
      <div className={cn("flex flex-wrap gap-3", className)}>
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">{formatKeyName(key)}:</span>
            <DisplayValue 
              value={val} 
              isEditable={isEditable}
              onChange={(newValue) => handleObjectValueChange(key, newValue)}
              path={`${path}.${key}`}
              originalValue={originalValue?.[key]}
              compact={true}
            />
          </div>
        ))}
      </div>
    ) : (
      // Vertical layout for complex objects
      <div className={cn("flex flex-col gap-1", className)}>
        {entries.map(([key, val]) => (
          <div key={key} className="grid grid-cols-[30%_70%] items-start gap-1">
            <span className="font-medium text-xs text-muted-foreground">{formatKeyName(key)}:</span>
            <DisplayValue 
              value={val} 
              isEditable={isEditable}
              onChange={(newValue) => handleObjectValueChange(key, newValue)}
              path={`${path}.${key}`}
              originalValue={originalValue?.[key]}
              compact={compact}
            />
          </div>
        ))}
      </div>
    );
  }
  
  // Strings (multiline)
  if (typeof localValue === 'string' && localValue.includes('\n') && isEditable) {
    return (
      <Textarea 
        className={cn("text-sm", className)} 
        value={localValue}
        onChange={(e) => handleValueChange(e.target.value)}
        rows={3}
      />
    );
  }
  
  // Default case: strings, numbers, etc.
  return isEditable ? (
    <Input 
      className={cn("h-8 text-sm", className)} 
      value={String(localValue)}
      type={typeof localValue === 'number' ? 'number' : 'text'}
      onChange={(e) => {
        const newValue = typeof localValue === 'number' 
          ? parseFloat(e.target.value) 
          : e.target.value;
        handleValueChange(newValue);
      }}
      size={20}
    />
  ) : (
    <span className={cn("text-sm", className)}>{String(localValue)}</span>
  );
};
