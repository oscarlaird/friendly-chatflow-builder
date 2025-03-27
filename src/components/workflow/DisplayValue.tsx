
import { ReactNode, useState, useEffect } from 'react';
import { DisplayTable } from './DisplayTable';
import { Check, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

// Helper function to format key names (remove underscores and capitalize)
const formatKeyName = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface DisplayValueProps {
  value: any;
  className?: string;
  isEditable?: boolean;
  onChange?: (value: any) => void;
  path?: string;
  originalValue?: any;
}

export const DisplayValue = ({ value, className, isEditable = false, onChange, path = '', originalValue }: DisplayValueProps): ReactNode => {
  const [localValue, setLocalValue] = useState<any>(value);
  
  // Update local value when the prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Input mode handlers
  const handleValueChange = (newValue: any) => {
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleReset = () => {
    // Reset to original value if provided, otherwise use value prop
    const resetValue = originalValue !== undefined ? originalValue : value;
    setLocalValue(resetValue);
    if (onChange) {
      onChange(resetValue);
    }
  };

  const handleObjectValueChange = (key: string, newValue: any) => {
    if (typeof localValue === 'object' && localValue !== null) {
      const updatedValue = { ...localValue, [key]: newValue };
      setLocalValue(updatedValue);
      if (onChange) {
        onChange(updatedValue);
      }
    }
  };

  const handleArrayItemChange = (index: number, newValue: any) => {
    if (Array.isArray(localValue)) {
      const updatedArray = [...localValue];
      updatedArray[index] = newValue;
      setLocalValue(updatedArray);
      if (onChange) {
        onChange(updatedArray);
      }
    }
  };

  // Handle different data types appropriately
  if (localValue === null || localValue === undefined) {
    return isEditable ? 
      <div className="flex items-center gap-2">
        <Input 
          className={className} 
          value="" 
          onChange={(e) => handleValueChange(e.target.value)} 
          placeholder="Enter value" 
        />
        {originalValue !== undefined && (
          <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div> : 
      <span className={cn("text-muted-foreground italic", className)}>None</span>;
  }
  
  // Array of objects - likely a table
  if (Array.isArray(localValue) && localValue.length > 0 && typeof localValue[0] === 'object') {
    return (
      <div className="flex flex-col gap-2">
        <DisplayTable 
          data={localValue} 
          className={className} 
          isEditable={isEditable}
          onChange={isEditable ? handleValueChange : undefined}
          originalData={originalValue}
        />
        {isEditable && originalValue !== undefined && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="self-end h-7 px-2">
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Reset</span>
          </Button>
        )}
      </div>
    );
  }
  
  // Array of primitives
  if (Array.isArray(localValue)) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {localValue.map((item, index) => (
          <div key={index} className="pl-2 border-l-2 border-muted">
            <DisplayValue 
              value={item} 
              isEditable={isEditable}
              onChange={isEditable ? (newValue) => handleArrayItemChange(index, newValue) : undefined}
              path={`${path}[${index}]`}
              originalValue={originalValue?.[index]}
            />
          </div>
        ))}
        {isEditable && originalValue !== undefined && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="self-end h-7 px-2">
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Reset</span>
          </Button>
        )}
      </div>
    );
  }
  
  // Boolean values
  if (typeof localValue === 'boolean') {
    return isEditable ? (
      <div className="flex items-center gap-2">
        <Checkbox 
          checked={localValue} 
          onCheckedChange={handleValueChange}
          className={className}
        />
        {originalValue !== undefined && (
          <Button variant="ghost" size="icon" onClick={handleReset} className="h-7 w-7">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    ) : (
      localValue ? 
        <Check className={cn("h-4 w-4 text-green-500", className)} /> : 
        <X className={cn("h-4 w-4 text-red-500", className)} />
    );
  }
  
  // Object values (not arrays)
  if (typeof localValue === 'object') {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {Object.entries(localValue).map(([key, val]) => (
          <div key={key} className="grid grid-cols-[30%_70%] items-start gap-2">
            <span className="font-medium text-sm text-muted-foreground">{formatKeyName(key)}:</span>
            <DisplayValue 
              value={val} 
              isEditable={isEditable}
              onChange={isEditable ? (newValue) => handleObjectValueChange(key, newValue) : undefined}
              path={`${path}.${key}`}
              originalValue={originalValue?.[key]}
            />
          </div>
        ))}
        {isEditable && originalValue !== undefined && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="self-end h-7 px-2">
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Reset</span>
          </Button>
        )}
      </div>
    );
  }
  
  // Strings (multiline)
  if (typeof localValue === 'string' && localValue.includes('\n') && isEditable) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea 
          className={className} 
          value={localValue}
          onChange={(e) => handleValueChange(e.target.value)}
        />
        {originalValue !== undefined && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="self-end h-7 px-2">
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Reset</span>
          </Button>
        )}
      </div>
    );
  }
  
  // Default case: strings, numbers, etc.
  return isEditable ? (
    <div className="flex items-center gap-2">
      <Input 
        className={className} 
        value={String(localValue)}
        type={typeof localValue === 'number' ? 'number' : 'text'}
        onChange={(e) => {
          const newValue = typeof localValue === 'number' 
            ? parseFloat(e.target.value) 
            : e.target.value;
          handleValueChange(newValue);
        }}
      />
      {originalValue !== undefined && (
        <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  ) : (
    <span className={className}>{String(localValue)}</span>
  );
};
