import { TaxRegime, PaymentStatus, TaskStatus, DocStatus, HoldStatus } from './types';

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  mei: 'MEI',
  simples: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
  outro: 'Outro'
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  em_dia: 'Em dia',
  devedor: 'Devedor'
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  atrasada: 'Atrasada'
};

export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  aguardando: 'Aguardando',
  recebido: 'Recebido'
};

export const HOLD_STATUS_LABELS: Record<HoldStatus, string> = {
  retido: 'Retido',
  liberado: 'Liberado'
};

export const APP_CONFIG = {
  appName: 'Painel Contábil'
};

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/tarefas', label: 'Tarefas', icon: 'ClipboardList' },
  { path: '/clientes', label: 'Clientes', icon: 'Users' },
  { path: '/calendario', label: 'Calendário', icon: 'Calendar' },
  { path: '/retencoes', label: 'Retenções', icon: 'Hand' },
  { path: '/configuracoes', label: 'Configurações', icon: 'Settings' }
];
