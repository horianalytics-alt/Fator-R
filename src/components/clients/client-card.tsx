import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/lib/types";
import { Building2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientCardProps {
  client: Client;
  pendingTasksCount: number;
  onClick?: () => void;
}

const regimeLabels: Record<string, string> = {
  mei: "MEI",
  simples: "Simples Nacional",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
  outro: "Outro",
};

export function ClientCard({ client, pendingTasksCount, onClick }: ClientCardProps) {
  const isDevedor = client.payment_status === "devedor";

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:border-primary/50 transition-colors",
        !client.is_active && "opacity-60"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg line-clamp-1" title={client.name}>{client.name}</h3>
          </div>
          {!client.is_active && (
            <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <Badge variant="secondary" className="font-normal">
            {regimeLabels[client.tax_regime] || client.tax_regime}
          </Badge>
          <Badge 
            variant={isDevedor ? "destructive" : "default"} 
            className={cn(
              "font-normal", 
              !isDevedor && "bg-emerald-500 hover:bg-emerald-600 text-white"
            )}
          >
            {isDevedor ? (
              <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Devedor</span>
            ) : (
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Em dia</span>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          {client.document && <p>Doc: {client.document}</p>}
          {client.email && <p className="truncate">{client.email}</p>}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground w-full">
          <Clock className="h-4 w-4" />
          <span>
            {pendingTasksCount === 0 
              ? "Nenhuma tarefa pendente" 
              : `${pendingTasksCount} ${pendingTasksCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'}`}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
