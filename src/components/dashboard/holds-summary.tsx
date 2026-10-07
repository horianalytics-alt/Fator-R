import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { format, parseISO } from "date-fns";

interface HoldsSummaryProps {
  count: number;
  items: any[];
  isLoading?: boolean;
}

export function HoldsSummary({ count, items, isLoading }: HoldsSummaryProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Retenções Ativas</CardTitle>
        <ShieldAlert className="h-4 w-4 text-orange-600" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold mb-4">{count}</div>
        )}
        
        {!isLoading && items && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 text-sm border-l-2 border-orange-500 pl-3">
                <div className="font-medium truncate" title={item.clients?.name}>{item.clients?.name || "Desconhecido"}</div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="truncate pr-2" title={item.document_description}>{item.document_description}</span>
                  <span className="whitespace-nowrap">
                    {item.held_since ? format(parseISO(item.held_since), "dd/MM") : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && count === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma retenção ativa.</p>
        )}
      </CardContent>
    </Card>
  );
}
