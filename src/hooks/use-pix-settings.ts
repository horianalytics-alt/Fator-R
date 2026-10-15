import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DEFAULT_PIX_SETTINGS, PixSettings } from '@/lib/whatsapp-utils';
import { toast } from 'sonner';

const STORAGE_KEY = 'fator_r_pix_settings';

export function usePixSettings() {
  const [pixSettings, setPixSettings] = useState<PixSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PIX_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PIX_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRemoteSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.pix_settings && mounted) {
          const remote = user.user_metadata.pix_settings as PixSettings;
          setPixSettings((prev) => {
            const merged = { ...prev, ...remote };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.error('Erro ao buscar configurações PIX remotas:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadRemoteSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const updatePixSettings = async (newSettings: PixSettings) => {
    try {
      setPixSettings(newSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

      // Salva no perfil do usuário no Supabase se logado
      const { error } = await supabase.auth.updateUser({
        data: { pix_settings: newSettings },
      });

      if (error) {
        console.warn('Configurações PIX salvas localmente, mas não sincronizadas com a nuvem:', error);
      }

      toast.success('Dados do PIX atualizados com sucesso!');
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar dados do PIX.');
      return false;
    }
  };

  return {
    pixSettings,
    updatePixSettings,
    isLoading,
  };
}
