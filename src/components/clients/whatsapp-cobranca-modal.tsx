import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Client } from '@/lib/types';
import { usePixSettings } from '@/hooks/use-pix-settings';
import {
  buildSuspensionMessage,
  formatPhoneForWhatsApp,
  getWhatsAppUrl,
} from '@/lib/whatsapp-utils';
import { extractContactsFromNotes } from '@/lib/client-contacts-utils';
import { MessageCircle, Copy, ExternalLink, AlertTriangle, Check, Sparkles, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppCobrancaModalProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOTIVOS_SUGERIDOS = [
  'duas mensalidades de honorários contábeis em atraso',
  'uma mensalidade de honorários contábeis em atraso',
  'três mensalidades de honorários contábeis em atraso',
  'honorários contábeis do mês vigente em atraso',
  'documentos e honorários pendentes de regularização',
];

export function WhatsAppCobrancaModal({
  client,
  open,
  onOpenChange,
}: WhatsAppCobrancaModalProps) {
  const { pixSettings } = usePixSettings();
  const partners = useMemo(() => extractContactsFromNotes(client.notes), [client.notes]);

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('primary');
  const [greetingTarget, setGreetingTarget] = useState<'empresa' | 'socio'>('empresa');
  const [motivo, setMotivo] = useState(MOTIVOS_SUGERIDOS[0]);
  const [phone, setPhone] = useState(client.phone || '');
  const [copied, setCopied] = useState(false);

  // Sincroniza ao abrir o modal
  useEffect(() => {
    if (open) {
      setSelectedRecipientId('primary');
      setGreetingTarget('empresa');
      setPhone(client.phone || '');
      setCopied(false);
    }
  }, [client.phone, open]);

  // Atualiza telefone e sugestão de saudação ao trocar destinatário
  const handleRecipientChange = (val: string) => {
    setSelectedRecipientId(val);
    if (val === 'primary') {
      setPhone(client.phone || '');
      setGreetingTarget('empresa');
    } else {
      const partner = partners.find((p) => p.id === val);
      if (partner) {
        setPhone(partner.phone || '');
        setGreetingTarget('socio');
      }
    }
  };

  const selectedPartner = partners.find((p) => p.id === selectedRecipientId);

  const cleanPhone = formatPhoneForWhatsApp(phone);
  const isPhoneValid = cleanPhone.length >= 10;

  const fullMessage = buildSuspensionMessage({
    clientName: client.name,
    partnerName: greetingTarget === 'socio' ? selectedPartner?.name : undefined,
    motivo,
    pixSettings,
  });

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      toast.success('Mensagem copiada para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar automaticamente.');
    }
  };

  const handleSendWhatsApp = () => {
    if (!isPhoneValid) {
      toast.error('Informe um número de telefone com DDD válido para enviar.');
      return;
    }

    const url = getWhatsAppUrl(cleanPhone, fullMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success('Abrindo WhatsApp...');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                Aviso de Suspensão / Cobrança
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Envio direto pelo WhatsApp para <strong>{client.name}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* SELETOR DE DESTINATÁRIO (SE HOUVER SÓCIOS CADASTRADOS) */}
          {partners.length > 0 && (
            <div className="p-3 bg-muted/40 border rounded-lg space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  Enviar para qual contato?
                </Label>
                <Select value={selectedRecipientId} onValueChange={handleRecipientChange}>
                  <SelectTrigger className="h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Selecione o destinatário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">
                      🏢 Empresa (Principal): {client.phone || 'Sem telefone cadastrado'}
                    </SelectItem>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        👤 {partner.name} ({partner.role || 'Sócio'}): {partner.phone || 'Sem telefone'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPartner && (
                <div className="space-y-1 pt-1 border-t border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    Como saudar no início da mensagem?
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={greetingTarget === 'socio' ? 'default' : 'outline'}
                      onClick={() => setGreetingTarget('socio')}
                      className="text-xs h-7 gap-1"
                    >
                      <Users className="h-3 w-3" />
                      Nome do Sócio ({selectedPartner.name})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={greetingTarget === 'empresa' ? 'default' : 'outline'}
                      onClick={() => setGreetingTarget('empresa')}
                      className="text-xs h-7 gap-1"
                    >
                      <Building2 className="h-3 w-3" />
                      Nome da Empresa ({client.name})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Campo Telefone */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="whatsapp-phone" className="text-xs sm:text-sm font-medium">
                Número do WhatsApp destino (com DDD)
              </Label>
              {!isPhoneValid && (
                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Telefone necessário
                </span>
              )}
            </div>
            <Input
              id="whatsapp-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: (11) 94208-8265"
              className={!isPhoneValid ? 'border-amber-400 focus-visible:ring-amber-400' : ''}
            />
            {cleanPhone && (
              <p className="text-[11px] text-muted-foreground">
                Destinatário formatado: <code className="bg-muted px-1 py-0.5 rounded font-mono">+{cleanPhone}</code>
              </p>
            )}
          </div>

          {/* Campo Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo-input" className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Motivo identificado da inadimplência
            </Label>
            <Input
              id="motivo-input"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: duas mensalidades de honorários contábeis em atraso"
              className="text-sm h-10"
            />

            {/* Chips de sugestão rápida */}
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium">Sugestões rápidas:</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {MOTIVOS_SUGERIDOS.map((sugestao) => (
                  <button
                    key={sugestao}
                    type="button"
                    onClick={() => setMotivo(sugestao)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all text-left ${
                      motivo === sugestao
                        ? 'bg-primary text-primary-foreground border-primary font-medium'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border'
                    }`}
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pré-visualização ao vivo da mensagem no WhatsApp */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                Pré-visualização da mensagem formatada:
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyMessage}
                className="h-7 text-xs px-2 gap-1"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar texto
                  </>
                )}
              </Button>
            </div>

            <div className="bg-emerald-950/10 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-foreground font-sans leading-relaxed whitespace-pre-wrap max-h-[220px] overflow-y-auto select-text shadow-inner">
              {fullMessage}
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Chave PIX atual: <strong>{pixSettings.pixKey}</strong> ({pixSettings.recipient})</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] sm:min-h-0"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={!isPhoneValid}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium min-h-[44px] sm:min-h-0 shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Abrir no WhatsApp
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
