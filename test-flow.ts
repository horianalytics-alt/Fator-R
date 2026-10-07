import { createClient } from '@supabase/supabase-js';
import { format, lastDayOfMonth } from 'date-fns';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function generateTasksForMonth(monthDate: Date) {
  const referenceMonth = format(monthDate, 'yyyy-MM-01');
  const monthYear = monthDate.getFullYear();
  const monthMonth = monthDate.getMonth();

  // Assuming user is already authenticated or we fake user ID.
  // Wait, I can't generate tasks without logging in first. Let's login via auth.signInWithPassword.
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'horiheitor@gmail.com',
    password: 'JEDh2007'
  });
  if (authErr) throw authErr;
  
  const userId = authData.user.id;

  let query = supabase
    .from('client_obligations')
    .select('*, clients!inner(id, is_active)')
    .eq('is_active', true)
    .eq('clients.is_active', true);

  const { data: obligations, error: obsError } = await query;
  if (obsError) throw obsError;
  if (!obligations || obligations.length === 0) return -1;

  let existingTasksQuery = supabase
    .from('tasks')
    .select('client_obligation_id')
    .eq('reference_month', referenceMonth);

  const { data: existingTasks, error: extError } = await existingTasksQuery;
  if (extError) throw extError;

  const existingObligationIds = new Set(existingTasks?.map(t => t.client_obligation_id) || []);

  const tasksToInsert = [];
  
  for (const obs of obligations) {
    if (!existingObligationIds.has(obs.id)) {
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

  if (tasksToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('tasks')
      .insert(tasksToInsert);
      
    if (insertError) throw insertError;
  }

  return tasksToInsert.length;
}

async function runTest() {
  console.log('=== INICIANDO TESTE ===');
  
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'horiheitor@gmail.com',
    password: 'JEDh2007'
  });
  if (authErr) throw authErr;
  
  const userId = authData.user.id;

  // 2. Criar Cliente 1: Padaria Teste (Simples Nacional)
  console.log('Criando Padaria Teste...');
  const { data: client1, error: c1Err } = await supabase.from('clients').insert({
    user_id: userId,
    name: 'Padaria Teste',
    tax_regime: 'simples',
    payment_status: 'em_dia',
    is_active: true
  }).select().single();
  
  if (c1Err) throw c1Err;

  // Criar obrigações do cliente 1
  const { data: obs } = await supabase.from('obligation_types').select('*');
  const findOb = (name: string) => obs?.find(o => o.name.toLowerCase().includes(name.toLowerCase()));
  
  const obsToInsert1 = [];
  ['DAS - Simples Nacional', 'Folha de Pagamento', 'FGTS Digital', 'INSS'].forEach(name => {
    const ob = findOb(name);
    if (ob) {
      obsToInsert1.push({
        client_id: client1.id,
        obligation_type_id: ob.id,
        due_day: ob.default_due_day,
        user_id: userId
      });
    }
  });
  await supabase.from('client_obligations').insert(obsToInsert1);
  console.log(`Padaria Teste criada com ${obsToInsert1.length} obrigações.`);

  // 3. Criar Cliente 2: MEI Teste (MEI)
  console.log('Criando MEI Teste...');
  const { data: client2, error: c2Err } = await supabase.from('clients').insert({
    user_id: userId,
    name: 'MEI Teste',
    tax_regime: 'mei',
    payment_status: 'em_dia',
    is_active: true
  }).select().single();

  if (c2Err) throw c2Err;

  const obsToInsert2 = [];
  ['DAS - Simples Nacional'].forEach(name => {
    const ob = findOb(name);
    if (ob) {
      obsToInsert2.push({
        client_id: client2.id,
        obligation_type_id: ob.id,
        due_day: ob.default_due_day,
        user_id: userId
      });
    }
  });
  await supabase.from('client_obligations').insert(obsToInsert2);
  console.log(`MEI Teste criado com ${obsToInsert2.length} obrigações.`);

  // 4. Testar Geração de Tarefas (1º Clique)
  console.log('Gerando tarefas (1º clique)...');
  const count1 = await generateTasksForMonth(new Date());
  console.log(`Resultado 1º clique: ${count1} tarefas geradas.`);

  // 5. Testar Geração de Tarefas (2º Clique)
  console.log('Gerando tarefas (2º clique)...');
  const count2 = await generateTasksForMonth(new Date());
  console.log(`Resultado 2º clique: ${count2} tarefas geradas (esperado 0).`);

}

runTest().catch(console.error);
