
import { ReactNode, useState, useEffect } from 'react';
import { DisplayTable } from './DisplayTable';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

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
  isInput?: boolean;
  onChange?: (value: any) => void;
  path?: string;
}

export const DisplayValue = ({ value, className, isInput = false, onChange, path = '' }: DisplayValueProps): ReactNode => {
  const [localValue, setLocalValue] = useState<any>(value);
  
  // Update local value when the prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Input mode handlers
  const handleInputChange = (newValue: any) => {
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
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
    return isInput ? 
      <Input 
        className={className} 
        value="" 
        onChange={(e) => handleInputChange(e.target.value)} 
        placeholder="Enter value" 
      /> : 
      <span className={cn("text-muted-foreground italic", className)}>None</span>;
  }
  
  // Array of objects - likely a table
  if (Array.isArray(localValue) && localValue.length > 0 && typeof localValue[0] === 'object') {
    return <DisplayTable 
      data={localValue} 
      className={className} 
      isInput={isInput}
      onChange={isInput ? handleInputChange : undefined}
    />;
  }
  
  // Array of primitives
  if (Array.isArray(localValue)) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {localValue.map((item, index) => (
          <div key={index} className="pl-2 border-l-2 border-muted">
            <DisplayValue 
              value={item} 
              isInput={isInput}
              onChange={isInput ? (newValue) => handleArrayItemChange(index, newValue) : undefined}
              path={`${path}[${index}]`}
            />
          </div>
        ))}
      </div>
    );
  }
  
  // Boolean values
  if (typeof localValue === 'boolean') {
    return isInput ? (
      <Checkbox 
        checked={localValue} 
        onCheckedChange={handleInputChange}
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
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {Object.entries(localValue).map(([key, val]) => (
          <div key={key} className="grid grid-cols-[30%_70%] items-start gap-2">
            <span className="font-medium text-sm text-muted-foreground">{formatKeyName(key)}:</span>
            <DisplayValue 
              value={val} 
              isInput={isInput}
              onChange={isInput ? (newValue) => handleObjectValueChange(key, newValue) : undefined}
              path={`${path}.${key}`}
            />
          </div>
        ))}
      </div>
    );
  }
  
  // Strings (multiline)
  if (typeof localValue === 'string' && localValue.includes('\n') && isInput) {
    return (
      <Textarea 
        className={className} 
        value={localValue}
        onChange={(e) => handleInputChange(e.target.value)}
      />
    );
  }
  
  // Default case: strings, numbers, etc.
  return isInput ? (
    <Input 
      className={className} 
      value={String(localValue)}
      type={typeof localValue === 'number' ? 'number' : 'text'}
      onChange={(e) => {
        const newValue = typeof localValue === 'number' 
          ? parseFloat(e.target.value) 
          : e.target.value;
        handleInputChange(newValue);
      }}
    />
  ) : (
    <span className={className}>{String(localValue)}</span>
  );
};
