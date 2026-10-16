export interface PixSettings {
  keyType: string;
  pixKey: string;
  recipient: string;
}

export const DEFAULT_PIX_SETTINGS: PixSettings = {
  keyType: 'Celular',
  pixKey: '11942088265',
  recipient: 'FATOR R',
};

/**
 * Sanitiza e formata um número de telefone brasileiro para o padrão internacional do WhatsApp (ex: 5511999999999).
 */
export function formatPhoneForWhatsApp(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove tudo que não for dígito
  let clean = phone.replace(/\D/g, '');

  // Remove zero à esquerda se houver (ex: 011...)
  if (clean.startsWith('0')) {
    clean = clean.slice(1);
  }

  // Se já tiver 12 ou 13 dígitos e começar com 55, está pronto
  if ((clean.length === 12 || clean.length === 13) && clean.startsWith('55')) {
    return clean;
  }

  // Se tiver 10 ou 11 dígitos (DDD + número), adiciona o DDI 55
  if (clean.length === 10 || clean.length === 11) {
    return `55${clean}`;
  }

  return clean;
}

export interface BuildSuspensionMessageParams {
  clientName: string;
  partnerName?: string;
  motivo: string;
  pixSettings?: PixSettings;
}

/**
 * Constrói a mensagem padrão de aviso de suspensão e cobrança para WhatsApp
 */
export function buildSuspensionMessage({
  clientName,
  partnerName,
  motivo,
  pixSettings = DEFAULT_PIX_SETTINGS,
}: BuildSuspensionMessageParams): string {
  const safeClientName = clientName ? clientName.trim() : 'Prezado(a) Cliente';
  const safeMotivo = motivo ? motivo.trim() : 'mensalidade de honorários em atraso';

  const robo = '\u{1F916}';
  const alerta = '\u{26A0}\u{FE0F}';
  const pin = '\u{1F4CC}';

  let greeting = `Olá, *${safeClientName}*.`;
  if (partnerName && partnerName.trim()) {
    greeting = `Olá, *${partnerName.trim()}*. (Referente à empresa *${safeClientName}*)`;
  }

  return `${robo} *MENSAGEM AUTOMÁTICA – FATOR R*

${greeting}

${alerta} *AVISO DE SUSPENSÃO DOS SERVIÇOS CONTÁBEIS*

O FATOR R identificou *${safeMotivo}*.

Em razão da inadimplência, informamos que *os serviços contábeis encontram-se temporariamente suspensos até a regularização dos valores pendentes*.

Durante o período de suspensão, não serão realizados serviços, transmissões de obrigações, emissões de guias ou demais procedimentos contábeis vinculados à empresa.

Caso os pagamentos já tenham sido realizados, por favor, encaminhe os comprovantes para que possamos realizar a baixa e *restabelecer os serviços*.

${pin} *DADOS PARA PAGAMENTO*

PIX – ${pixSettings.keyType}: ${pixSettings.pixKey}
Favorecido: ${pixSettings.recipient}

${robo} _Mensagem enviada automaticamente pela FATOR R._`;
}

/**
 * Gera o link do WhatsApp compatível sem corromper emojis no redirecionamento.
 * Utiliza o endpoint oficial 'api.whatsapp.com/send' em vez do 'wa.me' que possui bug de charset em emojis.
 */
export function getWhatsAppUrl(phone: string, text?: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  if (!cleanPhone) return '';

  if (!text) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}`;
  }

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}
