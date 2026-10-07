import { TaskItem } from './task-item';
import { useCompleteTask, useUndoCompleteTask } from '@/hooks/use-tasks';
import { toast } from 'sonner';

interface TaskListProps {
  tasks: any[];
  title?: string;
}

export function TaskList({ tasks, title }: TaskListProps) {
  const completeMutation = useCompleteTask();
  const undoMutation = useUndoCompleteTask();

  const handleComplete = (id: string) => {
    completeMutation.mutate(id, {
      onSuccess: () => {
        toast('Tarefa concluída!', {
          action: {
            label: 'Desfazer',
            onClick: () => undoMutation.mutate(id)
          }
        });
      }
    });
  };

  const handleUndo = (id: string) => {
    undoMutation.mutate(id);
  };

  if (!tasks?.length) {
    return (
      <div className="text-center p-8 border rounded-lg border-dashed bg-muted/20">
        <p className="text-muted-foreground">Nenhuma tarefa encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onComplete={handleComplete}
            onUndo={handleUndo}
          />
        ))}
      </div>
    </div>
  );
}
