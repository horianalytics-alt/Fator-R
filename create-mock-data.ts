// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { generateTasksForMonth } from './src/lib/task-generator';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL/
  process.env.VITE_SUPABASE_ANON_KEY
);

async function seedMocks() {
  console.log('--- INICIANDO CRIACAO DE DADOS MOCKnADOS ---');

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'horiheitor@gmail.com',
    password: "JEDh2007"
  });
  if (authErr) throw authErr;
  const user = authData.user;
  console.log('Login:', user.email);

  const { data: obTypes } = await supabase.from('obligation_types').select('*');

  const getObId = (namePart) => {
    const found = obTypes.find(o => o.name.toLowerCase().includes(namePart.toLowerCase()));
    return found ? found.id : null;
  };

  const idDAS = getObId('DAS - Simples');
  const idFolha = getObId('Folha');
  const idINSS = getObId('INSS');
  const idIRPJ = getObId('IRPJ');
  const idPIS = getObId('PIS');

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
    const { data: newClient } = await supabase.from('clients').insert(clientInsert).select().single();
    const validObs = obs.filter(o => o.obligation_type_id !== null).map(o => ({ ...o, client_id: newClient.id, user_id: user.id }));
    if (validObs.length > 0) {
      await supabase.from('client_obligations').insert(validObs);
    }
  }

  console.log('Gerando as tarefas para o mes atual...');
  const tasksGenerated = await generateTasksForMonth(new Date());
  console.log('Tarefas geradas:', tasksGenerated);
}
seedMocks().catch(console.error);