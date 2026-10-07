import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';
import { useAddHold } from '@/hooks/use-holds';
import { useDeleteTask } from '@/hooks/use-tasks';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TaskItemProps {
  task: any;
  onComplete: (id: string) => void;
  onUndo?: (id: string) => void;
}

export function TaskItem({ task, onComplete, onUndo }: TaskItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCompleted = task.status === 'concluida';
  const obligationName = task.client_obligations?.obligation_types?.name || 'Obrigação';
  const dueTime = new Date(task.due_date).setHours(0, 0, 0, 0);
  const todayTime = new Date().setHours(0, 0, 0, 0);
  const diffTime = dueTime - todayTime;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const isOverdue = !isCompleted && diffDays < 0;
  const isToday = !isCompleted && diffDays === 0;
  const isNext3Days = !isCompleted && diffDays > 0 && diffDays <= 3;
  
  // If task has clients object joined, check payment_status
  const isDevedor = task.clients?.payment_status === 'devedor';
  const clientName = task.clients?.name;
  const addHold = useAddHold();
  const deleteTask = useDeleteTask();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);

  const handleToggleClick = () => {
    if (isCompleted && onUndo) {
      setIsConfirmModalOpen(true);
    } else if (!isCompleted) {
      if (isDevedor) {
        setIsModalOpen(true);
      } else {
        setIsConfirmModalOpen(true);
      }
    }
  };

  const handleOnlyComplete = () => {
    onComplete(task.id);
    setIsModalOpen(false);
  };

  const handleCompleteAndHold = () => {
    onComplete(task.id);
    addHold.mutate({
      client_id: task.client_id,
      document_description: obligationName,
      reason: "Aguardando pagamento de honorários",
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={cn(
        "flex items-center justify-between p-4 border rounded-lg transition-colors",
        isCompleted ? "bg-muted/50" : "bg-card hover:bg-muted/10",
        isOverdue && "border-destructive/50 bg-destructive/5",
        isToday && "border-orange-500/50 bg-orange-500/5",
        isNext3Days && "border-yellow-500/50 bg-yellow-500/5"
      )}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button 
            onClick={handleToggleClick}
            className="text-muted-foreground hover:text-primary transition-colors focus:outline-none shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
          </button>
          <div className="flex-1 min-w-0 pr-2">
            <h4 
              className={cn(
                "font-medium text-sm md:text-base truncate",
                isCompleted && "line-through text-muted-foreground"
              )}
              title={obligationName}
            >
              {obligationName}
            </h4>
            <div className="flex items-center gap-2">
              {clientName && (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px] sm:max-w-[200px]" title={clientName}>
                    {clientName}
                  </span>
                  {isDevedor && (
                    <Badge variant="destructive" className="text-[10px] uppercase px-1.5 py-0 h-4 shrink-0 font-bold tracking-wider">
                      Devedor
                    </Badge>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground shrink-0">
                Venc.: {format(new Date(task.due_date), "dd/MM", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {isCompleted ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              Concluída
            </Badge>
          ) : isOverdue ? (
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
              Atrasada
            </Badge>
          ) : isToday ? (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
              Hoje
            </Badge>
          ) : isNext3Days ? (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              Vencendo
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
              Pendente
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsDeleteTaskOpen(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cliente inadimplente</DialogTitle>
            <DialogDescription className="pt-2">
              <strong className="text-foreground">{clientName || 'O cliente'}</strong> está com pagamento pendente. Deseja registrar a retenção deste documento?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsModalOpen(false)}
              className="min-h-[44px] w-full sm:w-auto order-3 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleOnlyComplete}
              className="min-h-[44px] w-full sm:w-auto order-2"
            >
              Só concluir
            </Button>
            <Button 
              variant="default" 
              onClick={handleCompleteAndHold}
              className="min-h-[44px] w-full sm:w-auto order-1 sm:order-3"
            >
              Concluir e reter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        title="Confirmar ação"
        description={isCompleted ? "Deseja desmarcar esta tarefa como concluída?" : "Deseja concluir esta tarefa?"}
        confirmText={isCompleted ? "Sim, desmarcar" : "Sim, concluir"}
        confirmVariant={isCompleted ? "destructive" : "default"}
        onConfirm={() => {
          if (isCompleted && onUndo) {
            onUndo(task.id);
          } else {
            onComplete(task.id);
          }
        }}
      />

      <ConfirmModal
        open={isDeleteTaskOpen}
        onOpenChange={setIsDeleteTaskOpen}
        title="Confirmar ação"
        description="Deseja realmente excluir esta tarefa? Essa ação não pode ser desfeita."
        confirmText="Sim, excluir"
        confirmVariant="destructive"
        onConfirm={() => deleteTask.mutate(task.id)}
        isPending={deleteTask.isPending}
      />
    </>
  );
}
