
import { Card, CardContent } from "@/components/ui/card";
import { DisplayValue } from "./DisplayValue";
import { DisplayTable } from "./DisplayTable";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface KeyValueDisplayProps {
  data: Record<string, any>;
  title?: string;
  isEditable?: boolean;
  onChange?: ((data: Record<string, any>) => void) | null;
  onRemove?: () => void;
  compact?: boolean;
}

// Helper function to format key names (remove underscores and capitalize)
const formatKeyName = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to convert an array to a table-compatible format
const convertArrayToTableData = (arr: any[]): Record<string, any>[] => {
  return arr.map(item => ({ value: item }));
};

// Helper function to convert a dictionary to a table-compatible format
const convertDictToTableData = (dict: Record<string, any>): Record<string, any>[] => {
  return [dict];
};

export const KeyValueDisplay = ({ 
  data, 
  title, 
  isEditable = false, 
  onChange,
  onRemove,
  compact = false
}: KeyValueDisplayProps) => {
  const [localData, setLocalData] = useState<Record<string, any>>(data || {});
  const isMobile = useIsMobile();
  
  // Determine if the component is editable
  const isEditableMode = isEditable && onChange !== null;

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

  const handleReset = () => {
    setLocalData(data || {});
    if (onChange) {
      onChange(data || {});
    }
  };

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  // Special case: if there's only one key called "ret" or similar, just display the value
  const keys = Object.keys(data);
  if (keys.length === 1) {
    const singleKey = keys[0];
    const singleValue = data[singleKey];
    
    // If the value is an array of objects, use DisplayTable
    if (Array.isArray(singleValue) && singleValue.length > 0 && typeof singleValue[0] === 'object') {
      return (
        <Card>
          {title && (
            <div className="px-3 py-1.5 border-b bg-muted/50 font-medium text-sm flex justify-between items-center">
              <span>{title}</span>
              {isEditableMode && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 px-2">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  <span className="text-xs">Reset</span>
                </Button>
              )}
              {onRemove && (
                <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 px-2 text-muted-foreground hover:text-destructive">
                  <span className="text-xs">Remove</span>
                </Button>
              )}
            </div>
          )}
          <CardContent className="p-2">
            <div className="w-full overflow-hidden">
              <DisplayTable 
                data={singleValue} 
                isEditable={isEditableMode} 
                onChange={(newValue) => {
                  if (onChange) {
                    onChange({ [singleKey]: newValue });
                  }
                }}
                originalData={data[singleKey]}
              />
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // If the value is an array of primitives, convert to table data
    if (Array.isArray(singleValue) && singleValue.length > 0) {
      const tableData = convertArrayToTableData(singleValue);
      return (
        <Card>
          {title && (
            <div className="px-3 py-1.5 border-b bg-muted/50 font-medium text-sm flex justify-between items-center">
              <span>{title}</span>
              {isEditableMode && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 px-2">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  <span className="text-xs">Reset</span>
                </Button>
              )}
              {onRemove && (
                <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 px-2 text-muted-foreground hover:text-destructive">
                  <span className="text-xs">Remove</span>
                </Button>
              )}
            </div>
          )}
          <CardContent className="p-2">
            <div className="w-full overflow-hidden">
              <DisplayTable 
                data={tableData} 
                isEditable={isEditableMode}
                onChange={(newValue) => {
                  if (onChange) {
                    // Convert back from table format to array
                    const newArray = newValue.map(item => item.value);
                    onChange({ [singleKey]: newArray });
                  }
                }}
                originalData={tableData}
              />
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // If the value is an object (not an array), convert to table data
    if (typeof singleValue === 'object' && singleValue !== null && !Array.isArray(singleValue)) {
      const tableData = convertDictToTableData(singleValue);
      return (
        <Card>
          {title && (
            <div className="px-3 py-1.5 border-b bg-muted/50 font-medium text-sm flex justify-between items-center">
              <span>{title}</span>
              {isEditableMode && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 px-2">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  <span className="text-xs">Reset</span>
                </Button>
              )}
              {onRemove && (
                <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 px-2 text-muted-foreground hover:text-destructive">
                  <span className="text-xs">Remove</span>
                </Button>
              )}
            </div>
          )}
          <CardContent className="p-2">
            <div className="w-full overflow-hidden">
              <DisplayTable 
                data={tableData} 
                isEditable={isEditableMode}
                onChange={(newValue) => {
                  if (onChange) {
                    // Only use the first row since this was a dictionary
                    onChange({ [singleKey]: newValue[0] || {} });
                  }
                }}
                originalData={tableData}
              />
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card>
        {title && (
          <div className="px-3 py-1.5 border-b bg-muted/50 font-medium text-sm flex justify-between items-center">
            <span>{title}</span>
            {isEditableMode && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 px-2">
                <RotateCcw className="h-3 w-3 mr-1" />
                <span className="text-xs">Reset</span>
              </Button>
            )}
            {onRemove && (
              <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 px-2 text-muted-foreground hover:text-destructive">
                <span className="text-xs">Remove</span>
              </Button>
            )}
          </div>
        )}
        <CardContent className="p-3">
          <DisplayValue 
            value={singleValue} 
            isEditable={isEditableMode}
            onChange={isEditableMode ? (newValue) => handleValueChange(singleKey, newValue) : undefined}
            path={singleKey}
            originalValue={data[singleKey]}
            compact={compact}
          />
        </CardContent>
      </Card>
    );
  }

  // Regular key-value display for multiple keys
  // Choose layout based on screen size and number of fields
  const useHorizontalLayout = !isMobile && keys.length <= 4;

  return (
    <Card>
      {title && (
        <div className="px-3 py-1.5 border-b bg-muted/50 font-medium text-sm flex justify-between items-center">
          <span>{title}</span>
          {isEditableMode && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 px-2">
              <RotateCcw className="h-3 w-3 mr-1" />
              <span className="text-xs">Reset</span>
            </Button>
          )}
          {onRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 px-2 text-muted-foreground hover:text-destructive">
              <span className="text-xs">Remove</span>
            </Button>
          )}
        </div>
      )}
      <CardContent className={`${useHorizontalLayout ? 'p-2' : 'p-3 space-y-3'}`}>
        <div className={useHorizontalLayout ? 'grid grid-cols-2 md:grid-cols-4 gap-2' : ''}>
          {Object.entries(data).map(([key, value]) => {
            // If value is a complex object or array, it should always be full width
            const isComplexValue = 
              (typeof value === 'object' && value !== null && Object.keys(value).length > 3) || 
              (Array.isArray(value) && value.length > 0);
            
            // Special case for arrays - convert to table view
            if (Array.isArray(value) && value.length > 0) {
              const tableData = convertArrayToTableData(value);
              return (
                <div key={key} className={`${isComplexValue && useHorizontalLayout ? 'col-span-full mb-2' : ''}`}>
                  <label className="font-medium text-sm text-muted-foreground block">
                    {formatKeyName(key)}:
                  </label>
                  <div className="ml-0 mt-1">
                    <DisplayTable 
                      data={tableData} 
                      isEditable={isEditableMode}
                      onChange={(newValue) => {
                        if (onChange) {
                          // Convert back from table format to array
                          const newArray = newValue.map(item => item.value);
                          handleValueChange(key, newArray);
                        }
                      }}
                      originalData={tableData}
                    />
                  </div>
                </div>
              );
            }
            
            // Special case for objects - convert to table view
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              const tableData = convertDictToTableData(value);
              return (
                <div key={key} className={`${isComplexValue && useHorizontalLayout ? 'col-span-full mb-2' : ''}`}>
                  <label className="font-medium text-sm text-muted-foreground block">
                    {formatKeyName(key)}:
                  </label>
                  <div className="ml-0 mt-1">
                    <DisplayTable 
                      data={tableData} 
                      isEditable={isEditableMode}
                      onChange={(newValue) => {
                        if (onChange) {
                          // Only use the first row since this was a dictionary
                          handleValueChange(key, newValue[0] || {});
                        }
                      }}
                      originalData={tableData}
                    />
                  </div>
                </div>
              );
            }
            
            // Default display for other types
            return (
              <div key={key} className={isComplexValue && useHorizontalLayout ? 'col-span-full mb-2' : ''}>
                <label className="font-medium text-sm text-muted-foreground block">
                  {formatKeyName(key)}:
                </label>
                <div className="ml-0">
                  <DisplayValue 
                    value={value} 
                    isEditable={isEditableMode}
                    onChange={isEditableMode ? (newValue) => handleValueChange(key, newValue) : undefined}
                    path={key}
                    originalValue={data[key]}
                    compact={compact}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
