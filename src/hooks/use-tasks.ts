import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useTasks(clientId?: string, referenceMonth?: string) {
  return useQuery({
    queryKey: ['tasks', clientId, referenceMonth],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          client_obligations (
            *,
            obligation_types (*)
          )
        `)
        .order('due_date', { ascending: true });
        
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      if (referenceMonth) {
        query = query.eq('reference_month', referenceMonth);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'concluida',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao concluir tarefa.');
    }
  });
}

export function useUndoCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'pendente',
          completed_at: null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao reverter tarefa.');
    }
  });
}
