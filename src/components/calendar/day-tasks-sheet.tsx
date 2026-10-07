import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { TaskList } from "@/components/tasks/task-list";

interface DayTasksSheetProps {
  date: Date | null;
  tasks: any[];
  open: boolean;
  onClose: () => void;
}

export function DayTasksSheet({ date, tasks, open, onClose }: DayTasksSheetProps) {
  if (!date) return null;

  const formattedDate = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  // Capitalize first letter
  const title = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {tasks.length} {tasks.length === 1 ? 'tarefa para este dia' : 'tarefas para este dia'}
          </SheetDescription>
        </SheetHeader>
        
        <TaskList tasks={tasks} />
      </SheetContent>
    </Sheet>
  );
}
