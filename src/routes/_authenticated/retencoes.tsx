import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useHolds } from '@/hooks/use-holds';
import { HoldItem } from '@/components/holds/hold-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, AlertTriangle, Lock } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const Route = createFileRoute('/_authenticated/retencoes')({
  component: RetencoesRoute,
});

type FilterType = 'todos' | 'retidos' | 'liberados';

function RetencoesRoute() {
  const { data: holds, isLoading } = useHolds();
  const [filter, setFilter] = useState<FilterType>('retidos');

  const filteredHolds = holds?.filter((hold) => {
    if (filter === 'todos') return true;
    if (filter === 'retidos') return hold.status === 'retido';
    if (filter === 'liberados') return hold.status === 'liberado';
    return true;
  });

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jogo de Cintura (Retenções)</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de documentos retidos por falta de pagamento ou pendências.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as FilterType)}>
            <ToggleGroupItem value="todos" aria-label="Todos">Todos</ToggleGroupItem>
            <ToggleGroupItem value="retidos" aria-label="Retidos">Retidos</ToggleGroupItem>
            <ToggleGroupItem value="liberados" aria-label="Liberados">Liberados</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : filteredHolds && filteredHolds.length > 0 ? (
          <div className="space-y-4">
            {filteredHolds.map((hold) => (
              <HoldItem key={hold.id} hold={hold} showClient={true} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20">
            <Lock className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Nenhuma retenção encontrada</h3>
            <p className="text-muted-foreground mt-1">
              {filter === 'retidos' 
                ? 'Nenhum documento está retido no momento.' 
                : filter === 'liberados' 
                ? 'Nenhum documento foi liberado ainda.' 
                : 'Não há retenções registradas.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
