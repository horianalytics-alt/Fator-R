import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Hold } from '@/lib/types';

export function useHolds(clientId?: string) {
  return useQuery({
    queryKey: ['holds', clientId],
    queryFn: async () => {
      let query = supabase
        .from('holds')
        .select('*, clients(name)')
        .order('held_since', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching holds:', error);
        throw new Error('Falha ao carregar retenções');
      }
      
      return data as (Hold & { clients?: { name: string } })[];
    },
  });
}

export function useAddHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hold: {
      client_id: string;
      document_description: string;
      reason: string;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('holds')
        .insert({
          user_id: userData.user.id,
          client_id: hold.client_id,
          document_description: hold.document_description,
          reason: hold.reason,
          status: 'retido',
          held_since: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding hold:', error);
        throw new Error('Falha ao adicionar retenção');
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['holds'] });
      toast.success('Retenção registrada com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useReleaseHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('holds')
        .update({
          status: 'liberado',
          released_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error releasing hold:', error);
        throw new Error('Falha ao liberar documento');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holds'] });
      toast.success('Documento liberado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('holds')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting hold:', error);
        throw new Error('Falha ao excluir retenção');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holds'] });
      toast.success('Retenção excluída!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
