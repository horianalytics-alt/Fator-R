import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, AlertTriangle, Calendar } from 'lucide-react';
import { useReleaseHold } from '@/hooks/use-holds';
import type { Hold } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HoldItemProps {
  hold: Hold & { clients?: { name: string } };
  showClient?: boolean;
}

export function HoldItem({ hold, showClient = false }: HoldItemProps) {
  const { mutate: releaseHold, isPending } = useReleaseHold();

  const handleRelease = () => {
    releaseHold(hold.id);
  };

  const daysHeld = differenceInDays(new Date(), new Date(hold.held_since));
  const isWarning = hold.status === 'retido' && daysHeld > 15;

  return (
    <div className={cn(
      "p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors",
      hold.status === 'liberado' ? "bg-muted/50 border-muted" : "bg-card",
      isWarning && "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-full",
          hold.status === 'liberado' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : 
          isWarning ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" : "bg-red-100 text-red-600 dark:bg-red-900/30"
        )}>
          {hold.status === 'liberado' ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 
              className={cn("font-medium truncate max-w-[200px] sm:max-w-[300px]", hold.status === 'liberado' && "text-muted-foreground line-through")}
              title={hold.document_description}
            >
              {hold.document_description}
            </h4>
            {isWarning && (
              <Badge variant="outline" className="text-amber-600 border-amber-600 bg-amber-50 dark:bg-transparent shrink-0">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Há {daysHeld} dias
              </Badge>
            )}
          </div>
          <div className="flex flex-col mt-1 text-sm text-muted-foreground gap-1">
            {showClient && hold.clients?.name && (
              <span className="font-medium text-foreground truncate max-w-[250px] sm:max-w-[400px]" title={hold.clients.name}>
                Cliente: {hold.clients.name}
              </span>
            )}
            <span>Motivo: {hold.reason}</span>
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Retido em: {format(new Date(hold.held_since), 'dd/MM/yyyy')}
              </span>
              {hold.released_at && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Unlock className="h-3 w-3" />
                  Liberado em: {format(new Date(hold.released_at), 'dd/MM/yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {hold.status === 'retido' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRelease}
          disabled={isPending}
          className="shrink-0"
        >
          <Unlock className="h-4 w-4 mr-2" />
          Liberar Documento
        </Button>
      )}
      {hold.status === 'liberado' && (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
          Liberado
        </Badge>
      )}
    </div>
  );
}
