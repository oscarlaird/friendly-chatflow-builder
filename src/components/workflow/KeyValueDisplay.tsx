
import { Card, CardContent } from "@/components/ui/card";
import { DisplayValue } from "./DisplayValue";

interface KeyValueDisplayProps {
  data: Record<string, any>;
  title?: string;
}

export const KeyValueDisplay = ({ data, title }: KeyValueDisplayProps) => {
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
            <DisplayValue value={value} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
