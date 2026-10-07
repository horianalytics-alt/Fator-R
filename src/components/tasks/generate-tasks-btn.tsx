import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { generateTasksForMonth } from '@/lib/task-generator';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GenerateTasksBtnProps {
  month: Date;
  // Mantemos a prop para não quebrar componentes que a passam, mas ignoramos na geração global
  clientId?: string;
}

export function GenerateTasksBtn({ month }: GenerateTasksBtnProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      // Forçamos a geração para TODOS os clientes (undefined)
      const count = await generateTasksForMonth(month, undefined);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      if (count === -1) {
        toast.warning('Nenhuma obrigação cadastrada ainda. Cadastre um cliente e vincule as obrigações dele primeiro.');
      } else if (count > 0) {
        const monthName = format(month, 'MMMM', { locale: ptBR });
        toast.success(`${count} tarefas geradas para ${monthName}.`);
      } else {
        toast.info('As tarefas deste mês já foram geradas.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar tarefas.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={isGenerating}
      variant="outline"
      className="w-full sm:w-auto"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
      {isGenerating ? 'Gerando...' : 'Gerar tarefas do mês'}
    </Button>
  );
}
