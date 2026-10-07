// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { format, lastDayOfMonth } from 'date-fns';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generateTasksForMonth(monthDate) {
  const referenceMonth = format(monthDate, 'yyyy-MM-01');
  const monthYear = monthDate.getFullYear();
  const monthMonth = monthDate.getMonth();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user.id;
  const { data: obligations, error: obsError } = await supabase.from('client_obligations').select('*, clients!inner(id, is_active)').eq('is_active', true).eq('clients.is_active', true);
  if (obsError) throw obsError;
  if (!obligations || obligations.length === 0) return -1;
  const { data: existingTasks, error: extError } = await supabase.from('tasks').select('client_obligation_id').eq('reference_month', referenceMonth);
  if (extError) throw extError;
  const existingObligationIds = new Set(existingTasks?.map(t => t.client_obligation_id) || []);
  const tasksToInsert = [];
  for (const obs of obligations) {
    if (!existingObligationIds.has(obs.id)) {
      let dueDay = obs.due_day;
      const daysInMonth = lastDayOfMonth(monthDate).getDate();
      if (dueDay > daysInMonth) dueDay = daysInMonth;
      const dueDate = new Date(monthYear, monthMonth, dueDay);
      tasksToInsert.push({
        user_id: userId,
        client_obligation_id: obs.id,
        client_id: obs.client_id,
        reference_month: referenceMonth,
        due_date: format(dueDate, 'yyyy-MM-dd'),
        status: 'pendente'
      });
    }
  }
  if (tasksToInsert.length > 0) {
    const { error: insertError } = await supabase.from('tasks').insert(tasksToInsert);
    if (insertError) throw insertError;
  }
  return tasksToInsert.length;
}

async function seedMocks() {
  console.log('--- INICIANDO CRIACAO DE DADOS MOCKADOS ---');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email: 'horiheitor@gmail.com', password: 'JEDh2007' });
  if (authErr) throw authErr;
  const user = authData.user;
  console.log('Login:', user.email);
  const { data: obTypes } = await supabase.from('obligation_types').select('*');
  const getObId = (namePart) => { const found = obTypes.find(o => o.name.toLowerCase().includes(namePart.toLowerCase())); return found ? found.id : null; };
  const idDAS = getObId('DAS'); const idFolha = getObId('Folha'); const idINSS = getObId('INSS'); const idIRPJ = getObId('IRPJ'); const idPIS = getObId('PIS');
  const clientsData = [
    { name: 'Padaria Teste (Simples Nacional)', document: '00.111.222/0001-33', tax_regime: 'simples', payment_status: 'devedor', is_active: true, user_id: user.id, obs: [{ obligation_type_id: idDAS, due_day: 20 }, { obligation_type_id: idFolha, due_day: 5 }, { obligation_type_id: idINSS, due_day: 20 }] },
    { name: 'MEI Teste (Em Dia)', document: '11.222.333/0001-44', tax_regime: 'mei', payment_status: 'em_dia', is_active: true, user_id: user.id, obs: [{ obligation_type_id: idDAS, due_day: 20 }] },
    { name: 'Consultoria Silva (Lucro Presumido)', document: '22.333.444/0001-55', tax_regime: 'lucro_presumido', payment_status: 'em_dia', is_active: true, user_id: user.id, obs: [{ obligation_type_id: idFolha, due_day: 5 }, { obligation_type_id: idIRPJ, due_day: 30 }, { obligation_type_id: idPIS, due_day: 25 }] },
    { name: 'Mercado Central (Devedor)', document: '33.444.555/0001-66', tax_regime: 'simples', payment_status: 'devedor', is_active: true, user_id: user.id, obs: [{ obligation_type_id: idDAS, due_day: 20 }, { obligation_type_id: idFolha, due_day: 5 }] },
    { name: 'Tech Solutions SA (Lucro Real)', document: '44.555.666/0001-77', tax_regime: 'lucro_real', payment_status: 'em_dia', is_active: true, user_id: user.id, obs: [{ obligation_type_id: idIRPJ, due_day: 30 }, { obligation_type_id: idPIS, due_day: 25 }, { obligation_type_id: idINSS, due_day: 20 }] }
  ];
  for (const clientData of clientsData) {
    console.log('Criando cliente:', clientData.name);
    const { obs, ...clientInsert } = clientData;
    const { data: newClient, error: cErr } = await supabase.from('clients').insert(clientInsert).select().single();
    if (cErr) console.error(cErr);
    const validObs = obs.filter(o => o.obligation_type_id !== null).map(o => ({ ...o, client_id: newClient.id, user_id: user.id }));
    if (validObs.length > 0) { await supabase.from('client_obligations').insert(validObs); }
  }
  console.log('Gerando as tarefas...');
  const tasksGenerated = await generateTasksForMonth(new Date());
  console.log('Tarefas geradas:', tasksGenerated);
}
seedMocks().catch(console.error);
