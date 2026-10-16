import { useState, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useClients } from '@/hooks/use-clients';
import { useCreateQuickTask } from '@/hooks/use-tasks';
import { Zap, Search, Check, Building2, Calendar, FileText, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClientId?: string;
}

const TAREFAS_COMUNS = [
  'Emitir Nota Fiscal (NF)',
  'Consultar Parcelamento / Dívidas',
  'Emitir Certidão Negativa (CND)',
  'Guia Rescisória / Rescisão',
  'Consulta de Pendências Fiscais',
  'Cálculo e Guia Avulsa',
];

export function QuickTaskModal({
  open,
  onOpenChange,
  defaultClientId,
}: QuickTaskModalProps) {
  const { data: clients, isLoading: clientsLoading } = useClients();
  const createQuickTask = useCreateQuickTask();

  const [selectedClientId, setSelectedClientId] = useState<string>(defaultClientId || '');
  const [clientSearch, setClientSearch] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  // Sincroniza se defaultClientId mudar
  useMemo(() => {
    if (defaultClientId) {
      setSelectedClientId(defaultClientId);
    }
  }, [defaultClientId]);

  // Apenas clientes ativos
  const activeClients = useMemo(() => {
    return (clients || []).filter((c) => c.is_active);
  }, [clients]);

  // Filtra clientes pela busca
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return activeClients;
    const term = clientSearch.toLowerCase();
    return activeClients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.document && c.document.includes(term))
    );
  }, [activeClients, clientSearch]);

  const selectedClient = useMemo(() => {
    return activeClients.find((c) => c.id === selectedClientId);
  }, [activeClients, selectedClientId]);

  const handleQuickDate = (daysToAdd: number) => {
    const targetDate = addDays(new Date(), daysToAdd);
    setDueDate(format(targetDate, 'yyyy-MM-dd'));
  };

  const isToday = dueDate === format(new Date(), 'yyyy-MM-dd');
  const isTomorrow = dueDate === format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      toast.error('Selecione um cliente para vincular a tarefa.');
      return;
    }

    if (!title.trim()) {
      toast.error('Informe o que precisa ser feito na tarefa.');
      return;
    }

    createQuickTask.mutate(
      {
        clientId: selectedClientId,
        title: title.trim(),
        dueDate,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          // Limpa campos
          if (!defaultClientId) setSelectedClientId('');
          setTitle('');
          setNotes('');
          setDueDate(format(new Date(), 'yyyy-MM-dd'));
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                Nova Tarefa Rápida
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Anote uma demanda pontual para não esquecer (ex: emitir NF, CND, etc).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* 1. SELEÇÃO DE CLIENTE (COM CLIQUES GRANDES) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary" />
                1. Selecione o Cliente *
              </Label>
              {selectedClient && (
                <span className="text-xs text-primary font-medium truncate max-w-[200px]">
                  Selecionado: {selectedClient.name}
                </span>
              )}
            </div>

            {/* Campo de busca rápida de cliente */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Filtrar por nome ou CNPJ do cliente..."
                className="pl-9 text-sm h-10"
              />
            </div>

            {/* Lista com botões/cliques grandes */}
            <div className="border rounded-lg divide-y max-h-44 overflow-y-auto bg-muted/20">
              {clientsLoading ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Carregando lista de clientes...
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Nenhum cliente ativo encontrado com essa busca.
                </div>
              ) : (
                filteredClients.map((c) => {
                  const isSelected = c.id === selectedClientId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedClientId(c.id)}
                      className={cn(
                        "w-full text-left p-3 min-h-[52px] flex items-center justify-between gap-3 transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary/10 border-l-4 border-l-primary text-foreground font-medium"
                          : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate text-foreground">
                          {c.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          {c.document && <span>{c.document}</span>}
                          {c.payment_status === 'devedor' && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0 h-3.5">
                              Devedor
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div
                        className={cn(
                          "h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. O QUE PRECISA SER FEITO */}
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" />
              2. O que precisa ser feito? *
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Emitir Nota Fiscal de R$ 5.000 para cliente X"
              className="text-sm h-10"
              required
            />

            {/* Chips de clique rápido */}
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium">Sugestões rápidas de 1 clique:</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {TAREFAS_COMUNS.map((tarefa) => (
                  <button
                    key={tarefa}
                    type="button"
                    onClick={() => setTitle(tarefa)}
                    className={cn(
                      "text-[11px] px-2.5 py-1 rounded-full border transition-all text-left",
                      title === tarefa
                        ? "bg-purple-600 text-white border-purple-600 font-medium"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                    )}
                  >
                    {tarefa}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. DATA DE VENCIMENTO */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              3. Data de Vencimento
            </Label>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={isToday ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickDate(0)}
                className="h-8 text-xs font-medium"
              >
                Hoje
              </Button>
              <Button
                type="button"
                variant={isTomorrow ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickDate(1)}
                className="h-8 text-xs font-medium"
              >
                Amanhã
              </Button>
              <Button
                type="button"
                variant={dueDate === format(addDays(new Date(), 3), 'yyyy-MM-dd') ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickDate(3)}
                className="h-8 text-xs font-medium"
              >
                Em 3 dias
              </Button>

              <div className="flex-1 min-w-[140px]">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 4. OBSERVAÇÕES / DETALHES (OPCIONAL) */}
          <div className="space-y-1.5">
            <Label htmlFor="task-notes" className="text-xs sm:text-sm font-medium text-muted-foreground">
              Observações ou Detalhes adicionais (opcional)
            </Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Dados da nota enviados no WhatsApp pelo sócio Roberto..."
              className="text-xs sm:text-sm min-h-[64px] resize-none"
            />
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-[44px] sm:min-h-0"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createQuickTask.isPending || !selectedClientId || !title.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium min-h-[44px] sm:min-h-0 gap-2 shadow-sm"
            >
              <Zap className="h-4 w-4 fill-current" />
              {createQuickTask.isPending ? 'Criando...' : 'Criar Tarefa Rápida'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
