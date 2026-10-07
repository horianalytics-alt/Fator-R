import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth,
  addMonths,
  subMonths
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayCell } from "./day-cell";

interface MonthViewProps {
  currentMonth: Date;
  tasksByDay: Map<string, any[]>;
  onDayClick: (date: Date) => void;
  onMonthChange: (dir: number) => void;
}

export function MonthView({ currentMonth, tasksByDay, onDayClick, onMonthChange }: MonthViewProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold capitalize">
          {format(currentMonth, dateFormat, { locale: ptBR })}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => onMonthChange(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onMonthChange(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day, i) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDay.get(dateKey) || [];
          return (
            <DayCell
              key={day.toString()}
              day={day}
              tasks={dayTasks}
              isCurrentMonth={isSameMonth(day, monthStart)}
              onClick={() => onDayClick(day)}
            />
          );
        })}
      </div>
    </div>
  );
}
