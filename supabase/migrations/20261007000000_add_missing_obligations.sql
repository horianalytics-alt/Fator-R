-- Adiciona obrigações que faltavam para os templates de regime tributário
-- Execute este script no SQL Editor do Supabase

DO $$
DECLARE
  v_user_id uuid := '4a11321b-2f7d-410c-88e0-a98bfbb3c18d'; -- UUID do Bob/Heitor (conforme histórico)
BEGIN
  -- DASN-SIMEI anual (MEI)
  IF NOT EXISTS (SELECT 1 FROM public.obligation_types WHERE user_id = v_user_id AND name ILIKE '%DASN-SIMEI%') THEN
    INSERT INTO public.obligation_types (user_id, name, description, default_due_day) 
    VALUES (v_user_id, 'DASN-SIMEI (anual)', 'Declaração Anual do Simples Nacional do MEI', 31);
  END IF;

  -- Se não existir EFD Reinf ou outros que quiser adicionar futuramente, pode colocar aqui.
END $$;
