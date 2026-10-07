import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfMonth, format, addDays } from 'date-fns';

export function useOverdueTasks() {
  return useQuery({
    queryKey: ['dashboard', 'tasks', 'overdue'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = format(startOfMonth(new Date()), 'yyyy-MM-01');

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients (id, name, payment_status),
          client_obligations (
            obligation_types (id, name)
          )
        `)
        .lt('due_date', today)
        .neq('status', 'concluida')
        .gte('reference_month', firstDayOfMonth)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpcomingTasks() {
  return useQuery({
    queryKey: ['dashboard', 'tasks', 'upcoming'],
    queryFn: async () => {
      const todayDate = new Date();
      const today = todayDate.toISOString().split('T')[0];
      const limitDate = addDays(todayDate, 3).toISOString().split('T')[0];
      const firstDayOfMonth = format(startOfMonth(new Date()), 'yyyy-MM-01');

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          clients (id, name, payment_status),
          client_obligations (
            obligation_types (id, name)
          )
        `)
        .gte('due_date', today)
        .lte('due_date', limitDate)
        .neq('status', 'concluida')
        .gte('reference_month', firstDayOfMonth)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCompletedCount() {
  return useQuery({
    queryKey: ['dashboard', 'tasks', 'completedCount'],
    queryFn: async () => {
      const firstDayOfMonth = format(startOfMonth(new Date()), 'yyyy-MM-01');
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'concluida')
        .eq('reference_month', firstDayOfMonth);
        
      if (error) throw error;
      return count || 0;
    },
  });
}

export function useTotalMonthTasks() {
  return useQuery({
    queryKey: ['dashboard', 'tasks', 'totalMonthCount'],
    queryFn: async () => {
      const firstDayOfMonth = format(startOfMonth(new Date()), 'yyyy-MM-01');
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('reference_month', firstDayOfMonth);
        
      if (error) throw error;
      return count || 0;
    },
  });
}

export function usePendingDocsSummary() {
  return useQuery({
    queryKey: ['dashboard', 'pendingDocs'],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('pending_docs')
        .select(`
          *,
          clients(id, name)
        `, { count: 'exact' })
        .eq('status', 'aguardando')
        .order('requested_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return { items: data || [], count: count || 0 };
    },
  });
}

export function useActiveHoldsSummary() {
  return useQuery({
    queryKey: ['dashboard', 'holds'],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('holds')
        .select(`
          *,
          clients(id, name)
        `, { count: 'exact' })
        .eq('status', 'retido')
        .order('held_since', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return { items: data || [], count: count || 0 };
    },
  });
}
