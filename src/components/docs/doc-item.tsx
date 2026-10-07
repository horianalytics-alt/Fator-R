import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, Clock } from 'lucide-react';
import { useUpdatePendingDoc } from '@/hooks/use-pending-docs';
import type { PendingDoc } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DocItemProps {
  doc: PendingDoc;
}

export function DocItem({ doc }: DocItemProps) {
  const { mutate: updateDoc, isPending } = useUpdatePendingDoc();

  const handleMarkAsReceived = () => {
    updateDoc({ id: doc.id, status: 'recebido' });
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors",
      doc.status === 'recebido' ? "bg-muted/50 border-muted" : "bg-card"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-full",
          doc.status === 'recebido' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
        )}>
          {doc.status === 'recebido' ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
        </div>
        <div>
          <h4 className={cn("font-medium", doc.status === 'recebido' && "text-muted-foreground line-through")}>
            {doc.description}
          </h4>
          <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
            {doc.reference_month && (
              <span className="flex items-center gap-1">
                Ref: {format(new Date(`${doc.reference_month}-01`), 'MMM/yyyy', { locale: ptBR })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Solicitado: {format(new Date(doc.requested_at), 'dd/MM/yyyy')}
            </span>
            {doc.received_at && (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                Recebido: {format(new Date(doc.received_at), 'dd/MM/yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>

      {doc.status === 'aguardando' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAsReceived}
          disabled={isPending}
        >
          Marcar como Recebido
        </Button>
      )}
      {doc.status === 'recebido' && (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
          Recebido
        </Badge>
      )}
    </div>
  );
}
