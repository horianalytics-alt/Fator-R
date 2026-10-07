import { supabase } from '@/lib/supabase';
import { format, lastDayOfMonth } from 'date-fns';

export async function generateTasksForMonth(monthDate: Date, clientId?: string) {
  const referenceMonth = format(monthDate, 'yyyy-MM');
  const monthYear = monthDate.getFullYear();
  const monthMonth = monthDate.getMonth(); // 0-indexed

  // 1. Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user.id;

  // 2. Fetch active client obligations
  let query = supabase
    .from('client_obligations')
    .select('*')
    .eq('is_active', true);
    
  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data: obligations, error: obsError } = await query;
  if (obsError) throw obsError;
  if (!obligations || obligations.length === 0) return 0;

  // 3. Fetch existing tasks for this reference_month
  let existingTasksQuery = supabase
    .from('tasks')
    .select('client_obligation_id')
    .eq('reference_month', referenceMonth);

  if (clientId) {
    existingTasksQuery = existingTasksQuery.eq('client_id', clientId);
  }

  const { data: existingTasks, error: extError } = await existingTasksQuery;
  if (extError) throw extError;

  const existingObligationIds = new Set(existingTasks?.map(t => t.client_obligation_id) || []);

  // 4. Determine tasks to create
  const tasksToInsert = [];
  
  for (const obs of obligations) {
    if (!existingObligationIds.has(obs.id)) {
      // Create due date
      let dueDay = obs.due_day;
      const daysInMonth = lastDayOfMonth(monthDate).getDate();
      if (dueDay > daysInMonth) {
        dueDay = daysInMonth;
      }
      
      const dueDate = new Date(monthYear, monthMonth, dueDay);

      tasksToInsert.push({
        user_id: userId,
        client_obligation_id: obs.id,
        client_id: obs.client_id,
        reference_month: referenceMonth,
        due_date: format(dueDate, 'yyyy-MM-dd'),
        status: 'pendente' as const,
      });
    }
  }

  // 5. Insert new tasks
  if (tasksToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('tasks')
      .insert(tasksToInsert);
      
    if (insertError) throw insertError;
  }

  return tasksToInsert.length;
}
