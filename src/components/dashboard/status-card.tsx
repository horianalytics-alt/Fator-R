import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface StatusCardProps {
  title: string;
  count: number | string;
  variant: "danger" | "warning" | "success";
  items?: any[];
  icon: LucideIcon;
  isLoading?: boolean;
}

export function StatusCard({ title, count, variant, items, icon: Icon, isLoading }: StatusCardProps) {
  const isDanger = variant === "danger";
  const isWarning = variant === "warning";
  const isSuccess = variant === "success";

  const displayItems = items?.slice(0, 5) || [];

  return (
    <Card className={cn("overflow-hidden h-full flex flex-col")}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", {
          "text-red-600": isDanger,
          "text-yellow-600": isWarning,
          "text-green-600": isSuccess,
        })} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold">{count}</div>
        )}
        
        {displayItems.length > 0 && !isLoading && (
          <div className="mt-4 space-y-3 border-t pt-4 flex-1">
            {displayItems.map((item) => {
              const clientName = item.clients?.name || "Desconhecido";
              const isDevedor = item.clients?.payment_status === 'devedor';
              const obligationName = item.client_obligations?.obligation_types?.name || "Obrigação";
              const dueDate = item.due_date ? format(parseISO(item.due_date), "dd/MM") : "";
              
              return (
                <div key={item.id} className="flex justify-between items-center text-xs gap-2">
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span className="font-medium truncate block" title={clientName}>{clientName}</span>
                    {isDevedor && (
                      <span className="shrink-0 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm leading-none">
                        Devedor
                      </span>
                    )}
                    <span className="text-muted-foreground truncate block" title={obligationName}>
                      - {obligationName}
                    </span>
                  </div>
                  <span className={cn("whitespace-nowrap font-medium shrink-0", {
                    "text-red-600": isDanger,
                    "text-yellow-600": isWarning,
                  })}>{dueDate}</span>
                </div>
              );
            })}
            {items && items.length > 5 && (
              <div className="text-xs text-muted-foreground pt-1">
                + {items.length - 5} outras tarefas
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
