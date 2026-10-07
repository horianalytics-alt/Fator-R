import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface TaskItemProps {
  task: any;
  onComplete: (id: string) => void;
  onUndo?: (id: string) => void;
}

export function TaskItem({ task, onComplete, onUndo }: TaskItemProps) {
  const isCompleted = task.status === 'concluida';
  const obligationName = task.client_obligations?.obligation_types?.name || 'Obrigação';
  const isOverdue = !isCompleted && new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

  const handleToggle = () => {
    if (isCompleted && onUndo) {
      onUndo(task.id);
    } else if (!isCompleted) {
      onComplete(task.id);
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 border rounded-lg transition-colors",
      isCompleted ? "bg-muted/50" : "bg-card hover:bg-muted/10",
      isOverdue && !isCompleted && "border-destructive/50 bg-destructive/5"
    )}>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleToggle}
          className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
        >
          {isCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <Circle className="h-6 w-6" />
          )}
        </button>
        <div>
          <h4 className={cn(
            "font-medium text-sm md:text-base",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {obligationName}
          </h4>
          <p className="text-xs text-muted-foreground">
            Vencimento: {format(new Date(task.due_date), "dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isCompleted ? (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            Concluída
          </Badge>
        ) : isOverdue ? (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            Atrasada
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            Pendente
          </Badge>
        )}
      </div>
    </div>
  );
}
