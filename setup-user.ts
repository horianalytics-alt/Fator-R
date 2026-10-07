import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function setupUser() {
  console.log('Fazendo login com robert_fiscal@hotmail.com...');
  
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'robert_fiscal@hotmail.com',
    password: 'fiscal123'
  });

  if (authErr) {
    console.error('Erro ao fazer login:', authErr.message);
    return;
  }
  
  const user = authData.user;
  console.log('Login feito! ID:', user.id);
  
  console.log('Adicionando tipos de obrigação padrão para o novo usuário...');
  const userId = user.id;
  const defaultTypes = [
    { user_id: userId, name: 'DAS - Simples Nacional', description: 'Documento de Arrecadação do Simples Nacional', default_due_day: 20 },
    { user_id: userId, name: 'DCTF', description: 'Declaração de Débitos e Créditos Tributários Federais', default_due_day: 15 },
    { user_id: userId, name: 'Folha de Pagamento', description: 'Processamento da folha mensal', default_due_day: 5 },
    { user_id: userId, name: 'FGTS Digital', description: 'Guia de recolhimento do FGTS', default_due_day: 20 },
    { user_id: userId, name: 'INSS (GPS)', description: 'Guia da Previdência Social', default_due_day: 20 },
    { user_id: userId, name: 'IRPJ/CSLL - Lucro Presumido', description: 'Imposto de Renda PJ e Contribuição Social', default_due_day: null },
    { user_id: userId, name: 'PIS/COFINS', description: 'Contribuições PIS e COFINS', default_due_day: 25 },
    { user_id: userId, name: 'ISS (município)', description: 'Imposto Sobre Serviços municipal', default_due_day: 15 },
  ];
  
  const { error: seedError } = await supabase.from('obligation_types').insert(defaultTypes);
  if (seedError) {
    console.error('Erro ao popular obrigações padrão:', seedError);
  } else {
    console.log('Obrigações padrão configuradas com sucesso!');
  }
}

setupUser().catch(console.error);
