import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useObligationTypes() {
  return useQuery({
    queryKey: ['obligation_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obligation_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useAddObligationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newType: { name: string; description?: string; default_due_day?: number }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('obligation_types')
        .insert({
          ...newType,
          user_id: userData.user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obligation_types'] });
      toast.success('Tipo de obrigação criado com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao criar tipo de obrigação.');
    }
  });
}

export function useUpdateObligationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; default_due_day?: number | null }) => {
      const { data, error } = await supabase
        .from('obligation_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obligation_types'] });
      toast.success('Tipo de obrigação atualizado com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao atualizar tipo de obrigação.');
    }
  });
}

export function useDeleteObligationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('obligation_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obligation_types'] });
      toast.success('Tipo de obrigação excluído com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao excluir tipo de obrigação. Pode haver obrigações vinculadas.');
    }
  });
}

export function useClientObligations(clientId: string) {
  return useQuery({
    queryKey: ['client_obligations', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_obligations')
        .select(`
          *,
          obligation_types (*)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}

export function useAddClientObligation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newObligation: { client_id: string; obligation_type_id: string; due_day: number; notes?: string }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('client_obligations')
        .insert({
          ...newObligation,
          user_id: userData.user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client_obligations', variables.client_id] });
      toast.success('Obrigação adicionada com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao adicionar obrigação.');
    }
  });
}

export function useRemoveClientObligation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_obligations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_obligations'] });
      toast.success('Obrigação removida com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao remover obrigação.');
    }
  });
}
