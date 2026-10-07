import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { format, addMonths, subMonths } from 'date-fns';
import { MonthView } from '@/components/calendar/month-view';
import { DayTasksSheet } from '@/components/calendar/day-tasks-sheet';
import { useTasks } from '@/hooks/use-tasks';
import { GenerateTasksBtn } from '@/components/tasks/generate-tasks-btn';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/calendario')({
  component: CalendarioPage,
});

function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  // Format as YYYY-MM-01 to match DATE column type
  const referenceMonthStr = format(currentMonth, 'yyyy-MM-01');
  
  const { data: tasks, isLoading } = useTasks(undefined, referenceMonthStr);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    if (!tasks) return map;
    
    tasks.forEach((task: any) => {
      if (!task.due_date) return;
      // assuming due_date is YYYY-MM-DD
      const dateKey = task.due_date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(task);
    });
    
    return map;
  }, [tasks]);

  const handleMonthChange = (dir: number) => {
    setCurrentMonth(prev => dir > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const selectedDayKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
  const selectedDayTasks = selectedDayKey ? tasksByDay.get(selectedDayKey) || [] : [];

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Calendário de Obrigações
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie as tarefas do mês
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <GenerateTasksBtn month={currentMonth} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[500px] border rounded-lg border-dashed">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MonthView 
          currentMonth={currentMonth}
          tasksByDay={tasksByDay}
          onDayClick={setSelectedDay}
          onMonthChange={handleMonthChange}
        />
      )}

      <DayTasksSheet 
        date={selectedDay}
        tasks={selectedDayTasks}
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}
