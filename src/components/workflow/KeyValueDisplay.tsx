
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DisplayValue } from "./DisplayValue";
import { DisplayTable } from "./DisplayTable";

interface KeyValueDisplayProps {
  data: Record<string, any>;
  title?: string;
  isEditable?: boolean;
  compact?: boolean;
  setUserInputs?: (userInputs: Record<string, any>) => void;
}

// Utility function for formatting key names
const formatKeyName = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const KeyValueDisplay = ({ 
  data, 
  title, 
  isEditable = false, 
  compact = false,
  setUserInputs,
}: KeyValueDisplayProps) => {

  useEffect(() => {
    console.log('RENDER - KeyValueDisplay component rendered');
    if(isEditable) {
      console.log('data', data);
    }
  }, [data, isEditable]);

  // Handler for all value changes from any child component
  const handleValueChange = (key: string, value: any) => {
    if (!setUserInputs) return;
    
    console.log('Changing data', key, value);
    const newData = JSON.parse(JSON.stringify(data));
    newData[key] = value;
    setUserInputs(newData);
  };
  
  // Guard clause for empty data
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  
  // Special case for single values that are arrays of objects (render as table)
  const keys = Object.keys(data);
  if (keys.length === 1) {
    const singleKey = keys[0];
    const singleValue = data[singleKey];
    
    if (Array.isArray(singleValue) && singleValue.length > 0 && 
        typeof singleValue[0] === 'object' && singleValue[0] !== null) {
      return (
        <Card>
          {title && (
            <div className="px-3 py-1.5 border-b bg-muted/50 font-medium text-sm flex justify-between items-center">
              <span>{title}</span>
            </div>
          )}
          <CardContent className="p-2">
            <DisplayTable 
              data={singleValue} 
              isEditable={isEditable}
              onTableChange={isEditable && setUserInputs ? 
                (newValue) => handleValueChange(singleKey, newValue) : 
                undefined
              }
            />
          </CardContent>
        </Card>
      );
    }
  }
  
  // Regular key-value display
  return (
    <Card>
      {title && (
        <div className="px-3 py-1.5 border-b bg-muted/50 font-medium text-sm flex justify-between items-center">
          <span>{title}</span>
        </div>
      )}
      <CardContent className={compact ? "p-2" : "p-3"}>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <label className="font-medium text-sm text-muted-foreground block mb-1">
                {formatKeyName(key)}:
              </label>
              <div>
                <DisplayValue 
                  value={value} 
                  isEditable={isEditable}
                  onValueChange={isEditable && setUserInputs ? 
                    (newValue) => handleValueChange(key, newValue) : 
                    undefined
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
