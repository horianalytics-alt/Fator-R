import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { PendingDoc } from '@/lib/types';

export function usePendingDocs(clientId?: string) {
  return useQuery({
    queryKey: ['pending-docs', clientId],
    queryFn: async () => {
      let query = supabase
        .from('pending_docs')
        .select('*')
        .order('requested_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching pending docs:', error);
        throw new Error('Falha ao carregar documentos pendentes');
      }
      
      return data as PendingDoc[];
    },
  });
}

export function useAddPendingDoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doc: {
      client_id: string;
      description: string;
      reference_month?: string;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('pending_docs')
        .insert({
          user_id: userData.user.id,
          client_id: doc.client_id,
          description: doc.description,
          reference_month: doc.reference_month ? `${doc.reference_month}-01` : null,
          status: 'aguardando',
          requested_at: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding pending doc:', error);
        throw new Error('Falha ao adicionar documento');
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pending-docs'] });
      toast.success('Documento solicitado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePendingDoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'aguardando' | 'recebido' }) => {
      const updates: any = { status };
      
      if (status === 'recebido') {
        updates.received_at = new Date().toISOString().split('T')[0];
      } else {
        updates.received_at = null;
      }

      const { data, error } = await supabase
        .from('pending_docs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating pending doc:', error);
        throw new Error('Falha ao atualizar status do documento');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-docs'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePendingDoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pending_docs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting pending doc:', error);
        throw new Error('Falha ao excluir documento pendente');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-docs'] });
      toast.success('Documento pendente excluído!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
