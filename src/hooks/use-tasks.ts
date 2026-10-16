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
          clients (id, name, payment_status),
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

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Tarefa excluída com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao excluir tarefa.');
    }
  });
}

export function useCreateQuickTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      clientId: string;
      title: string;
      dueDate?: string;
      notes?: string;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const due = params.dueDate || new Date().toISOString().split('T')[0];
      const referenceMonth = due.substring(0, 7) + '-01';

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userData.user.id,
          client_id: params.clientId,
          client_obligation_id: null,
          title: params.title.trim(),
          due_date: due,
          reference_month: referenceMonth,
          status: 'pendente',
          notes: params.notes?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Tarefa rápida criada com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao criar tarefa rápida.');
    },
  });
}

