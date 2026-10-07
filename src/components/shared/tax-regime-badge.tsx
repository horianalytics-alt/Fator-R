import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TaxRegime = 'mei' | 'simples' | 'lucro_presumido' | 'lucro_real' | 'outro';

interface TaxRegimeBadgeProps {
  regime: TaxRegime;
  className?: string;
}

const regimeLabels: Record<TaxRegime, string> = {
  mei: "MEI",
  simples: "Simples Nacional",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
  outro: "Outro"
};

export function TaxRegimeBadge({ regime, className }: TaxRegimeBadgeProps) {
  const label = regimeLabels[regime] || regimeLabels.outro;

  return (
    <Badge 
      variant="secondary" 
      className={cn("font-normal text-xs px-2 py-0.5", className)}
    >
      {label}
    </Badge>
  );
}
