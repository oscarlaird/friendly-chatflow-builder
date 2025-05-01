import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SerializedPrimitive } from "@/types/call_payload";

interface DisplayPrimitiveProps {
  primitive: SerializedPrimitive;
  className?: string;
  isEditable?: boolean;
  onValueChange?: (newValue: SerializedPrimitive) => void;
}

export const DisplayPrimitive = ({
  primitive,
  className,
  isEditable = false,
  onValueChange
}: DisplayPrimitiveProps): ReactNode => {
  // Handle primitive input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onValueChange) {
      onValueChange({
        ...primitive,
        value: e.target.value
      });
    }
  };
  
  // Editable mode
  if (isEditable) {
    // Boolean values use a select
    if (primitive.orig_type === 'bool') {
      return (
        <Select 
          value={primitive.value ? "true" : "false"}
          onValueChange={(val) => {
            if (onValueChange) {
              onValueChange({
                ...primitive,
                value: val === "true"
              });
            }
          }}
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
    else if (primitive.orig_type === 'str' && typeof primitive.value === 'string' && primitive.value.includes('\n')) {
      return (
        <Textarea 
          className={cn("text-sm", className)} 
          value={String(primitive.value)}
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
          value={String(primitive.value)} 
          onChange={(e) => {
            if (onValueChange) {
              // Convert type for numbers
              if (primitive.orig_type === 'int' || primitive.orig_type === 'float') {
                const num = parseFloat(e.target.value);
                onValueChange({
                  ...primitive,
                  value: isNaN(num) ? e.target.value : num
                });
              } else {
                onValueChange({
                  ...primitive,
                  value: e.target.value
                });
              }
            }
          }}
        />
      );
    }
  }
  // Display-only mode
  else {
    if (primitive.orig_type === 'bool') {
      return primitive.value ? 
        <Check className="h-4 w-4 text-green-500" /> : 
        <X className="h-4 w-4 text-red-500" />;
    }
    return <span className={cn("text-sm", className)}>{String(primitive.value)}</span>;
  }
};