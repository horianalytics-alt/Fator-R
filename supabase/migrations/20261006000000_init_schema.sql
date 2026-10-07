-- SISTEMA FATOR R V1 — Schema Completo
-- Supabase / PostgreSQL

-- TABELA: clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document TEXT,
  phone TEXT,
  email TEXT,
  tax_regime TEXT NOT NULL DEFAULT 'simples' CHECK (tax_regime IN ('mei', 'simples', 'lucro_presumido', 'lucro_real', 'outro')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  payment_status TEXT NOT NULL DEFAULT 'em_dia' CHECK (payment_status IN ('em_dia', 'devedor')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_is_active ON public.clients(user_id, is_active);
CREATE INDEX idx_clients_payment_status ON public.clients(user_id, payment_status);

-- TABELA: obligation_types
CREATE TABLE public.obligation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_due_day INTEGER CHECK (default_due_day IS NULL OR (default_due_day >= 1 AND default_due_day <= 31)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_obligation_types_user_id ON public.obligation_types(user_id);

-- TABELA: client_obligations
CREATE TABLE public.client_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  obligation_type_id UUID NOT NULL REFERENCES public.obligation_types(id) ON DELETE CASCADE,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, obligation_type_id)
);
CREATE INDEX idx_client_obligations_client ON public.client_obligations(client_id);
CREATE INDEX idx_client_obligations_user ON public.client_obligations(user_id);

-- TABELA: tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_obligation_id UUID NOT NULL REFERENCES public.client_obligations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  reference_month DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'atrasada')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_obligation_id, reference_month)
);
CREATE INDEX idx_tasks_user_due ON public.tasks(user_id, due_date);
CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX idx_tasks_user_month ON public.tasks(user_id, reference_month);
CREATE INDEX idx_tasks_client ON public.tasks(client_id);

-- TABELA: pending_docs
CREATE TABLE public.pending_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  reference_month DATE,
  status TEXT NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'recebido')),
  requested_at DATE NOT NULL DEFAULT CURRENT_DATE,
  received_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pending_docs_user ON public.pending_docs(user_id);
CREATE INDEX idx_pending_docs_client ON public.pending_docs(client_id);
CREATE INDEX idx_pending_docs_status ON public.pending_docs(user_id, status);

-- TABELA: holds (jogo de cintura)
CREATE TABLE public.holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  document_description TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Aguardando pagamento de honorários',
  held_since DATE NOT NULL DEFAULT CURRENT_DATE,
  released_at DATE,
  status TEXT NOT NULL DEFAULT 'retido' CHECK (status IN ('retido', 'liberado')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_holds_user ON public.holds(user_id);
CREATE INDEX idx_holds_client ON public.holds(client_id);
CREATE INDEX idx_holds_status ON public.holds(user_id, status);

-- TRIGGER: updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER tr_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_obligation_types_updated_at BEFORE UPDATE ON public.obligation_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_client_obligations_updated_at BEFORE UPDATE ON public.client_obligations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_pending_docs_updated_at BEFORE UPDATE ON public.pending_docs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_holds_updated_at BEFORE UPDATE ON public.holds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS (ALL 6 tables, 4 policies each)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete" ON public.clients FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.obligation_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obligation_types_select" ON public.obligation_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "obligation_types_insert" ON public.obligation_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "obligation_types_update" ON public.obligation_types FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "obligation_types_delete" ON public.obligation_types FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.client_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_obligations_select" ON public.client_obligations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "client_obligations_insert" ON public.client_obligations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "client_obligations_update" ON public.client_obligations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "client_obligations_delete" ON public.client_obligations FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.pending_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pending_docs_select" ON public.pending_docs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pending_docs_insert" ON public.pending_docs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pending_docs_update" ON public.pending_docs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pending_docs_delete" ON public.pending_docs FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "holds_select" ON public.holds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "holds_insert" ON public.holds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "holds_update" ON public.holds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "holds_delete" ON public.holds FOR DELETE USING (auth.uid() = user_id);

-- SEED: Tipos de Obrigação Padrão (rodar após criar usuário)
-- Substituir USER_ID_AQUI pelo UUID real
-- INSERT INTO public.obligation_types (user_id, name, description, default_due_day) VALUES
--   ('USER_ID_AQUI', 'DAS - Simples Nacional', 'Documento de Arrecadação do Simples Nacional', 20),
--   ('USER_ID_AQUI', 'DCTF', 'Declaração de Débitos e Créditos Tributários Federais', 15),
--   ('USER_ID_AQUI', 'Folha de Pagamento', 'Processamento da folha mensal', 5),
--   ('USER_ID_AQUI', 'FGTS Digital', 'Guia de recolhimento do FGTS', 20),
--   ('USER_ID_AQUI', 'INSS (GPS)', 'Guia da Previdência Social', 20),
--   ('USER_ID_AQUI', 'IRPJ/CSLL - Lucro Presumido', 'Imposto de Renda PJ e Contribuição Social', NULL),
--   ('USER_ID_AQUI', 'PIS/COFINS', 'Contribuições PIS e COFINS', 25),
--   ('USER_ID_AQUI', 'ISS (município)', 'Imposto Sobre Serviços municipal', 15),
--   ('USER_ID_AQUI', 'DEFIS (anual)', 'Declaração de Informações Socioeconômicas e Fiscais', 31),
--   ('USER_ID_AQUI', 'DIRF (anual)', 'Declaração do Imposto de Renda Retido na Fonte', 28),
--   ('USER_ID_AQUI', 'RAIS (anual)', 'Relação Anual de Informações Sociais', NULL),
--   ('USER_ID_AQUI', 'Entrega de holerites', 'Envio dos holerites aos funcionários', 5);

-- VIEW: Dashboard
CREATE OR REPLACE VIEW public.v_tasks_with_status AS
SELECT t.*, c.name AS client_name, c.document AS client_document, ot.name AS obligation_name,
  CASE
    WHEN t.status = 'concluida' THEN 'concluida'
    WHEN t.due_date < CURRENT_DATE AND t.status != 'concluida' THEN 'atrasada'
    WHEN t.due_date = CURRENT_DATE THEN 'hoje'
    WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'vencendo'
    ELSE t.status
  END AS computed_status
FROM public.tasks t
JOIN public.clients c ON c.id = t.client_id
JOIN public.client_obligations co ON co.id = t.client_obligation_id
JOIN public.obligation_types ot ON ot.id = co.obligation_type_id;
