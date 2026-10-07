// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { generateTasksForMonth } from './src/lib/task-generator';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function testAll() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'horiheitor@gmail.com',
    password: 'JEDh2007'
  });
  if (authErr) throw authErr;
  const user = authData.user;

  console.log('1. Testando criar cliente...');
  const newClient = {
    name: 'Cliente Teste UI',
    tax_regime: 'simples',
    payment_status: 'em_dia',
    is_active: true,
    user_id: user.id
  };
  
  const { data: client, error: cErr } = await supabase.from('clients').insert(newClient).select().single();
  if (cErr) throw cErr;
  console.log('Cliente criado:', client.id);

  console.log('2. Inserindo obrigação...');
  const { data: obTypes } = await supabase.from('obligation_types').select('*').limit(1);
  const { data: ob, error: obErr } = await supabase.from('client_obligations').insert({
    client_id: client.id,
    obligation_type_id: obTypes[0].id,
    due_day: 15,
    user_id: user.id
  }).select().single();
  if (obErr) throw obErr;
  console.log('Obrigação criada:', ob.id);

  console.log('3. Gerando tarefas para o mês atual...');
  const date = new Date();
  const count = await generateTasksForMonth(date);
  console.log('Tarefas geradas:', count);

  console.log('4. Buscando tarefas para o calendário...');
  const referenceMonthStr = format(date, 'yyyy-MM-01');
  const { data: tasks, error: tErr } = await supabase
        .from('tasks')
        .select(`*, client_obligations (*, obligation_types (*))`)
        .eq('reference_month', referenceMonthStr)
        .order('due_date', { ascending: true });
  if (tErr) throw tErr;
  console.log('Tarefas encontradas pro calendário:', tasks.length);
  if (tasks.length > 0) {
    console.log('Exemplo due_date:', tasks[0].due_date);
  }

  console.log('5. Limpando dados...');
  await supabase.from('clients').delete().eq('id', client.id);
  console.log('Fim!');
}

testAll().catch(console.error);
