import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface DayCellProps {
  day: Date;
  tasks: any[];
  isCurrentMonth: boolean;
  onClick: () => void;
}

export function DayCell({ day, tasks, isCurrentMonth, onClick }: DayCellProps) {
  const hasTasks = tasks.length > 0;
  
  const hasOverdue = tasks.some(t => t.status === 'atrasada');
  const hasPending = tasks.some(t => t.status === 'pendente');
  
  // Semaphore color logic
  let indicatorColor = "";
  if (hasTasks) {
    if (hasOverdue) {
      indicatorColor = "bg-red-500";
    } else if (hasPending) {
      indicatorColor = "bg-yellow-500";
    } else {
      indicatorColor = "bg-green-500"; // All done
    }
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "min-h-[100px] p-2 border-r border-b relative cursor-pointer hover:bg-muted/50 transition-colors",
        !isCurrentMonth && "bg-muted/20 text-muted-foreground",
        isToday(day) && "bg-primary/5"
      )}
    >
      <div className="flex justify-between items-start">
        <span
          className={cn(
            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
            isToday(day) && "bg-primary text-primary-foreground"
          )}
        >
          {format(day, "d")}
        </span>
        
        {hasTasks && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground font-medium">{tasks.length}</span>
            <div className={cn("w-2 h-2 rounded-full", indicatorColor)} />
          </div>
        )}
      </div>

      {hasTasks && (
        <div className="mt-2 flex flex-col gap-1">
          {/* Visual representation of tasks up to 3 */}
          {tasks.slice(0, 3).map((task, i) => {
             const statusColor = task.status === 'atrasada' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                 task.status === 'pendente' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
             
             const title = task.client_obligations?.obligation_types?.name || `Tarefa ${task.id.slice(0,4)}`;
             
             return (
              <div key={task.id} className={cn("text-[10px] truncate px-1 py-0.5 rounded", statusColor)}>
                {title}
              </div>
            );
          })}
          {tasks.length > 3 && (
            <div className="text-[10px] text-muted-foreground font-medium pl-1">
              +{tasks.length - 3} mais
            </div>
          )}
        </div>
      )}
    </div>
  );
}
