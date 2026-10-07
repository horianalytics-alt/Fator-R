import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PaymentStatus = 'em_dia' | 'devedor';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const isEmDia = status === 'em_dia';
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border-transparent", 
        isEmDia 
          ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-500" 
          : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-500",
        className
      )}
    >
      {isEmDia ? "Em dia" : "Devedor"}
    </Badge>
  );
}
