import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { generateTasksForMonth } from '@/lib/task-generator';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface GenerateTasksBtnProps {
  month: Date;
  clientId?: string;
}

export function GenerateTasksBtn({ month, clientId }: GenerateTasksBtnProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const count = await generateTasksForMonth(month, clientId);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      if (count > 0) {
        toast.success(`${count} tarefa(s) gerada(s) com sucesso!`);
      } else {
        toast.info('Nenhuma nova tarefa para gerar neste mês.');
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
      {isGenerating ? 'Gerando...' : 'Gerar Tarefas do Mês'}
    </Button>
  );
}
