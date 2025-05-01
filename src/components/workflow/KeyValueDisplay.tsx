
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DisplayPrimitive } from "./DisplayPrimitive";
import { SerializedCallPayload, SerializedPrimitive, SerializedTable } from "@/types/call_payload";
import { DisplayTable } from "./DisplayTable";

interface KeyValueDisplayProps {
  data: SerializedCallPayload;
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
    if(isEditable) {
      console.log('data', data);
      // Check if data passes validation
      try {
        const validationResult = SerializedCallPayload.safeParse(data);
        console.log('Data validation result:', validationResult.success);
        if (!validationResult.success) {
          console.error('Validation errors:', validationResult.error.format());
        }
      } catch (error) {
        console.error('Error validating data:', error);
      }
    }
  }, [data, isEditable]);

  // Handler for all value changes from any child component
  const handleValueChange = (key: string, value: any) => {
    if (!setUserInputs) return;
    
    console.log('Changing data', key, value);
    // Create a new object to ensure React detects the change
    const newData = JSON.parse(JSON.stringify(data)); 
    newData[key] = value;
    setUserInputs(newData);
  };
  
  // Guard clause for empty data
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  
  // Regular key-value display
  return (
    <Card>
      <CardContent className={compact ? "p-2" : "p-3"}>
        <div className="space-y-3">
          {Object.entries(data.data).map(([key, value]) => (
            <div key={key}>
              <label className="font-medium text-sm text-muted-foreground block mb-1">
                {formatKeyName(key)}:
              </label>
              <div>
                {value.orig_type === "table" ? (
                  <DisplayTable 
                    table={value as SerializedTable}
                    isEditable={isEditable}
                    onTableChange={isEditable && setUserInputs ? 
                      (newData) => {
                        const updatedValue = { ...value, value: { ...value.value, items: newData } };
                        handleValueChange(key, updatedValue);
                      } : 
                      undefined
                    }
                  />
                ) : (
                  <DisplayPrimitive 
                    primitive={value as SerializedPrimitive} 
                    isEditable={isEditable}
                    onValueChange={isEditable && setUserInputs ? 
                      (newValue) => handleValueChange(key, newValue) : 
                      undefined
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
