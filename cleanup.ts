// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function runCleanup() {
  console.log('=== LIMPANDO BASE DE DADOS (LIXO DE TESTES) ===');
  
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'horiheitor@gmail.com',
    password: 'JEDh2007'
  });
  if (authErr) throw authErr;

  console.log('Deletando clientes "Padaria Teste" e "MEI Teste"...');
  const { data, error } = await supabase
    .from('clients')
    .delete()
    .in('name', ['Padaria Teste', 'MEI Teste'])
    .select();

  if (error) {
    console.error('Erro na exclusão:', error);
  } else {
    console.log(`Deletados ${data?.length || 0} clientes. (O CASCADE apagou obrigações, tarefas e retenções).`);
  }
}

runCleanup().catch(console.error);
