import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { Client } from '@/lib/types';
import { toast } from 'sonner';

export function useClients() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        toast.error('Erro ao carregar clientes');
        throw error;
      }

      return data as Client[];
    },
    enabled: !!user,
  });
}

export function useClient(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!id) throw new Error('Client ID is required');

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast.error('Erro ao carregar cliente');
        throw error;
      }

      return data as Client;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      client,
      obligations,
    }: {
      client: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
      obligations?: { obligation_type_id: string; due_day: number }[];
    }) => {
      if (!user) throw new Error('Not authenticated');

      // 1. Create client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([{ ...client, user_id: user.id }])
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Create obligations if any
      if (obligations && obligations.length > 0) {
        const obsToInsert = obligations.map((obs) => ({
          client_id: newClient.id,
          obligation_type_id: obs.obligation_type_id,
          due_day: obs.due_day,
          user_id: user.id,
        }));

        const { error: obsError } = await supabase
          .from('client_obligations')
          .insert(obsToInsert);

        let obligationsFailed = false;
        if (obsError) {
          console.error('Erro ao inserir obrigações:', obsError);
          obligationsFailed = true;
          // Non-blocking for the client creation, but log it
        }
      }

      return { client: newClient, obligationsFailed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      if (data.obligationsFailed) {
        toast.warning('Cliente criado, mas as obrigações não foram salvas. Adicione na aba Obrigações.');
      } else {
        toast.success('Cliente criado com sucesso!');
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao criar cliente');
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao atualizar cliente');
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao excluir cliente');
    },
  });
}
