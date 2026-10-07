import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = 'pendente' | 'em_andamento' | 'concluida' | 'atrasada' | 'hoje' | 'vencendo';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pendente: { 
    label: "Pendente", 
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500" 
  },
  em_andamento: { 
    label: "Em andamento", 
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-500" 
  },
  concluida: { 
    label: "Concluída", 
    className: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-500" 
  },
  atrasada: { 
    label: "Atrasada", 
    className: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-500" 
  },
  hoje: { 
    label: "Hoje", 
    className: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-500" 
  },
  vencendo: { 
    label: "Vencendo", 
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-500" 
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) return null;

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium border-transparent", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
