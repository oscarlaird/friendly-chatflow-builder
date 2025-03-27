
import { Card, CardContent } from "@/components/ui/card";
import { DisplayValue } from "./DisplayValue";
import { useState, useEffect } from "react";

interface KeyValueDisplayProps {
  data: Record<string, any>;
  title?: string;
  isInput?: boolean;
  onChange?: (data: Record<string, any>) => void;
}

export const KeyValueDisplay = ({ data, title, isInput = false, onChange }: KeyValueDisplayProps) => {
  const [localData, setLocalData] = useState<Record<string, any>>(data || {});

  useEffect(() => {
    setLocalData(data || {});
  }, [data]);

  const handleValueChange = (key: string, value: any) => {
    const updatedData = { ...localData, [key]: value };
    setLocalData(updatedData);
    
    if (onChange) {
      onChange(updatedData);
    }
  };

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <Card>
      {title && (
        <div className="px-4 py-2 border-b bg-muted/50 font-medium text-sm">
          {title}
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="grid grid-cols-[30%_70%] gap-2 items-start">
            <span className="font-medium text-sm text-muted-foreground">{key}:</span>
            <DisplayValue 
              value={value} 
              isInput={isInput}
              onChange={(newValue) => handleValueChange(key, newValue)}
              path={key}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
