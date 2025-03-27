
import { ReactNode, useState } from 'react';
import { DisplayTable } from './DisplayTable';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface DisplayValueProps {
  value: any;
  className?: string;
  isInput?: boolean;
  onChange?: (value: any) => void;
  path?: string;
}

export const DisplayValue = ({ value, className, isInput = false, onChange, path = '' }: DisplayValueProps): ReactNode => {
  // Input mode handlers
  const handleInputChange = (newValue: any) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleObjectValueChange = (key: string, newValue: any) => {
    if (onChange && typeof value === 'object' && value !== null) {
      const updatedValue = { ...value, [key]: newValue };
      onChange(updatedValue);
    }
  };

  const handleArrayItemChange = (index: number, newValue: any) => {
    if (onChange && Array.isArray(value)) {
      const updatedArray = [...value];
      updatedArray[index] = newValue;
      onChange(updatedArray);
    }
  };

  // Handle different data types appropriately
  if (value === null || value === undefined) {
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
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
    return <DisplayTable 
      data={value} 
      className={className} 
      isInput={isInput}
      onChange={isInput ? handleInputChange : undefined}
    />;
  }
  
  // Array of primitives
  if (Array.isArray(value)) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {value.map((item, index) => (
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
  if (typeof value === 'boolean') {
    return isInput ? (
      <Checkbox 
        checked={value} 
        onCheckedChange={handleInputChange}
        className={className}
      />
    ) : (
      value ? 
        <Check className={cn("h-4 w-4 text-green-500", className)} /> : 
        <X className={cn("h-4 w-4 text-red-500", className)} />
    );
  }
  
  // Object values (not arrays)
  if (typeof value === 'object') {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="grid grid-cols-[30%_70%] items-start gap-2">
            <span className="font-medium text-sm text-muted-foreground">{key}:</span>
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
  if (typeof value === 'string' && value.includes('\n') && isInput) {
    return (
      <Textarea 
        className={className} 
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
      />
    );
  }
  
  // Default case: strings, numbers, etc.
  return isInput ? (
    <Input 
      className={className} 
      value={String(value)}
      type={typeof value === 'number' ? 'number' : 'text'}
      onChange={(e) => {
        const newValue = typeof value === 'number' 
          ? parseFloat(e.target.value) 
          : e.target.value;
        handleInputChange(newValue);
      }}
    />
  ) : (
    <span className={className}>{String(value)}</span>
  );
};
