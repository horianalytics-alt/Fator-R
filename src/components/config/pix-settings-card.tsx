import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePixSettings } from '@/hooks/use-pix-settings';
import { Smartphone, Check, QrCode } from 'lucide-react';

const TIPOS_CHAVE = [
  { value: 'Celular', label: 'Celular' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'CPF', label: 'CPF' },
  { value: 'E-mail', label: 'E-mail' },
  { value: 'Chave Aleatória', label: 'Chave Aleatória' },
];

export function PixSettingsCard() {
  const { pixSettings, updatePixSettings, isLoading } = usePixSettings();

  const [form, setForm] = useState({
    keyType: pixSettings.keyType,
    pixKey: pixSettings.pixKey,
    recipient: pixSettings.recipient,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm({
      keyType: pixSettings.keyType,
      pixKey: pixSettings.pixKey,
      recipient: pixSettings.recipient,
    });
  }, [pixSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pixKey || !form.recipient) return;

    setIsSaving(true);
    await updatePixSettings({
      keyType: form.keyType,
      pixKey: form.pixKey.trim(),
      recipient: form.recipient.trim(),
    });
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <QrCode className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Chave PIX (Cobrança Automática)</CardTitle>
            <CardDescription>
              Dados de pagamento exibidos automaticamente na mensagem de aviso de suspensão via WhatsApp.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tipo de Chave */}
            <div className="space-y-2">
              <Label htmlFor="pix-type">Tipo de Chave</Label>
              <Select
                value={form.keyType}
                onValueChange={(value) => setForm({ ...form, keyType: value })}
                disabled={isLoading}
              >
                <SelectTrigger id="pix-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CHAVE.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chave PIX */}
            <div className="space-y-2">
              <Label htmlFor="pix-key">Chave PIX *</Label>
              <Input
                id="pix-key"
                value={form.pixKey}
                onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
                placeholder="Ex: 11942088265"
                required
                disabled={isLoading}
              />
            </div>

            {/* Favorecido */}
            <div className="space-y-2">
              <Label htmlFor="pix-recipient">Nome do Favorecido *</Label>
              <Input
                id="pix-recipient"
                value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                placeholder="Ex: FATOR R"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Pré-visualização de como sai na mensagem */}
          <div className="bg-muted/40 border rounded-lg p-3 text-xs space-y-1">
            <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
              Como aparecerá no WhatsApp:
            </span>
            <div className="font-mono text-foreground font-medium pt-0.5">
              📌 *DADOS PARA PAGAMENTO*<br />
              PIX – {form.keyType}: {form.pixKey || '(sua chave)'}<br />
              Favorecido: {form.recipient || '(nome do favorecido)'}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t pt-4">
          <Button
            type="submit"
            disabled={isSaving || isLoading || !form.pixKey || !form.recipient}
            className="gap-2 min-h-[44px] sm:min-h-0"
          >
            <Check className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Dados do PIX'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
