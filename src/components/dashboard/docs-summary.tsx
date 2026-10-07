import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { format, parseISO } from "date-fns";

interface DocsSummaryProps {
  count: number;
  items: any[];
  isLoading?: boolean;
}

export function DocsSummary({ count, items, isLoading }: DocsSummaryProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Documentos Pendentes</CardTitle>
        <FileText className="h-4 w-4 text-blue-600" />
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
              <div key={item.id} className="flex flex-col gap-1 text-sm border-l-2 border-blue-500 pl-3">
                <div className="font-medium truncate">{item.clients?.name || "Desconhecido"}</div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="truncate pr-2">{item.description}</span>
                  <span className="whitespace-nowrap">
                    {item.requested_at ? format(parseISO(item.requested_at), "dd/MM") : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && count === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum documento pendente.</p>
        )}
      </CardContent>
    </Card>
  );
}
