import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useClient, useUpdateClient, useDeleteClient } from '@/hooks/use-clients';
import { ClientForm } from '@/components/clients/client-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { ArrowLeft, Building2, AlertCircle, CheckCircle2, Phone, Mail, FileText, MessageCircle, Zap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhatsAppCobrancaModal } from '@/components/clients/whatsapp-cobranca-modal';
import { QuickTaskModal } from '@/components/tasks/quick-task-modal';
import { extractContactsFromNotes, extractCleanNotes } from '@/lib/client-contacts-utils';
import { getWhatsAppUrl } from '@/lib/whatsapp-utils';
import { useClientObligations } from '@/hooks/use-obligations';
import { useTasks } from '@/hooks/use-tasks';
import { ClientObligations } from '@/components/clients/client-obligations';
import { TaskList } from '@/components/tasks/task-list';
import { GenerateTasksBtn } from '@/components/tasks/generate-tasks-btn';
import { DocForm } from '@/components/docs/doc-form';
import { DocItem } from '@/components/docs/doc-item';
import { HoldForm } from '@/components/holds/hold-form';
import { HoldItem } from '@/components/holds/hold-item';
import { usePendingDocs } from '@/hooks/use-pending-docs';
import { useHolds } from '@/hooks/use-holds';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
export const Route = createFileRoute('/_authenticated/clientes/$clientId')({
  component: ClientDetailRoute,
});

const regimeLabels: Record<string, string> = {
  mei: "MEI",
  simples: "Simples Nacional",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
  outro: "Outro",
};

function ClientDetailRoute() {
  const { clientId } = Route.useParams();
  const navigate = useNavigate();
  
  const { data: client, isLoading, error } = useClient(clientId);
  const { mutate: updateClient } = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCobrancaOpen, setIsCobrancaOpen] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);

  const handleDeleteClient = () => {
    deleteClientMutation.mutate(clientId, {
      onSuccess: () => {
        navigate({ to: '/clientes' });
      }
    });
  };

  const currentDate = new Date();
  const currentMonthStr = format(currentDate, 'yyyy-MM-01');
  const { data: clientObligations } = useClientObligations(clientId);
  const { data: monthTasks } = useTasks(clientId, currentMonthStr);
  
  const { data: pendingDocs, isLoading: pendingDocsLoading } = usePendingDocs(clientId);
  const { data: holds, isLoading: holdsLoading } = useHolds(clientId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 flex-1 max-w-md" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-medium text-destructive">Erro ao carregar cliente</p>
        <Button variant="link" onClick={() => navigate({ to: '/clientes' })}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  const isDevedor = client.payment_status === "devedor";
  const partners = extractContactsFromNotes(client.notes);
  const cleanNotes = extractCleanNotes(client.notes);

  const handleUpdateSubmit = (data: any) => {
    updateClient({ id: client.id, ...data }, {
      onSuccess: () => {
        setIsEditOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/clientes' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-muted-foreground hidden sm:block" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
              {!client.is_active && (
                <Badge variant="outline" className="text-muted-foreground mt-1">Inativo</Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {client.phone && (
              <Button 
                variant="outline"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 gap-1.5 h-9"
                onClick={() => window.open(getWhatsAppUrl(client.phone), '_blank', 'noopener,noreferrer')}
                title="Abrir WhatsApp com o cliente"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </Button>
            )}

            <Button
              variant={isDevedor ? "destructive" : "outline"}
              className={cn(
                "gap-1.5 font-medium h-9",
                !isDevedor && "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-300 dark:border-amber-800"
              )}
              onClick={() => setIsCobrancaOpen(true)}
              title="Gerar aviso de suspensão e cobrança para envio via WhatsApp"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Aviso de Cobrança</span>
            </Button>
            
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-9">Editar Cliente</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Cliente</DialogTitle>
                </DialogHeader>
                <ClientForm 
                  client={client}
                  onSubmit={handleUpdateSubmit} 
                  onCancel={() => setIsEditOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-1">
          <span className="text-sm text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4"/> Documento</span>
          <span className="font-medium">{client.document || "Não informado"}</span>
        </div>
        <div className="bg-card border rounded-lg p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4"/> Telefone Principal
            </span>
            {client.phone && (
              <button
                type="button"
                onClick={() => window.open(getWhatsAppUrl(client.phone), '_blank', 'noopener,noreferrer')}
                className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-xs font-medium hover:underline"
                title="Conversar no WhatsApp da Empresa"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </button>
            )}
          </div>
          <span className="font-medium text-sm">{client.phone || "Não informado"}</span>

          {partners.length > 0 && (
            <div className="border-t pt-2 mt-1 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3 text-primary" /> Sócios / Contatos ({partners.length})
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {partners.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-0.5">
                    <span className="truncate max-w-[130px]" title={`${p.name} (${p.role || 'Sócio'})`}>
                      <strong>{p.name}</strong> <span className="text-[10px] text-muted-foreground">({p.role || 'Sócio'})</span>
                    </span>
                    {p.phone && (
                      <button
                        type="button"
                        onClick={() => window.open(getWhatsAppUrl(p.phone), '_blank', 'noopener,noreferrer')}
                        className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 text-[11px] hover:underline"
                        title={`Conversar com ${p.name}`}
                      >
                        <MessageCircle className="h-3 w-3" />
                        Conversar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-1">
          <span className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4"/> E-mail</span>
          <span className="font-medium truncate" title={client.email || ""}>{client.email || "Não informado"}</span>
        </div>
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 justify-center">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-normal">
              {regimeLabels[client.tax_regime] || client.tax_regime}
            </Badge>
            <Badge 
              variant={isDevedor ? "destructive" : "default"} 
              className={cn(
                "font-normal", 
                !isDevedor && "bg-emerald-500 hover:bg-emerald-600 text-white"
              )}
            >
              {isDevedor ? (
                <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Devedor</span>
              ) : (
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Em dia</span>
              )}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="obrigacoes" className="w-full">
        <TabsList className="w-full sm:w-auto overflow-x-auto justify-start flex-nowrap">
          <TabsTrigger value="obrigacoes">Obrigações</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas do mês</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="retencoes">Retenções</TabsTrigger>
        </TabsList>
        
        <TabsContent value="obrigacoes" className="p-6 bg-card border rounded-lg mt-2">
          <ClientObligations clientId={clientId} obligations={clientObligations || []} />
        </TabsContent>
        
        <TabsContent value="tarefas" className="p-6 bg-card border rounded-lg mt-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-medium">Tarefas do Mês</h3>
              <p className="text-sm text-muted-foreground">Competência: {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="gap-1.5 border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 h-9 font-medium"
                onClick={() => setIsQuickTaskOpen(true)}
              >
                <Zap className="h-4 w-4 fill-current text-purple-600" />
                <span>Nova Tarefa Avulsa</span>
              </Button>
              <GenerateTasksBtn clientId={clientId} month={currentDate} />
            </div>
          </div>
          <TaskList tasks={monthTasks || []} />
        </TabsContent>
        
        <TabsContent value="documentos" className="p-6 bg-card border rounded-lg mt-2 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Solicitar Documento</h3>
            <DocForm clientId={clientId} />
          </div>
          
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-medium">Documentos Pendentes</h3>
            {pendingDocsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : pendingDocs?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum documento pendente.</p>
            ) : (
              <div className="space-y-3">
                {pendingDocs?.map((doc) => (
                  <DocItem key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="retencoes" className="p-6 bg-card border rounded-lg mt-2 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4 text-destructive">Registrar Retenção (Jogo de Cintura)</h3>
            <HoldForm clientId={clientId} />
          </div>
          
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-medium">Histórico de Retenções</h3>
            {holdsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : holds?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma retenção registrada para este cliente.</p>
            ) : (
              <div className="space-y-3">
                {holds?.map((hold) => (
                  <HoldItem key={hold.id} hold={hold} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {cleanNotes && (
        <div className="bg-muted/30 p-4 rounded-lg border">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Observações</h4>
          <p className="text-sm whitespace-pre-wrap">{cleanNotes}</p>
        </div>
      )}

      <div className="flex justify-center mt-8 pt-4 border-t">
        <Button 
          variant="outline" 
          className="text-destructive border-destructive hover:bg-destructive hover:text-white"
          onClick={() => setIsDeleteOpen(true)}
        >
          Excluir cliente
        </Button>
      </div>

      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Confirmar ação"
        description={`Deseja realmente excluir ${client.name}? Todas as obrigações, tarefas, documentos e retenções deste cliente serão removidos permanentemente.`}
        confirmText="Sim, excluir cliente"
        confirmVariant="destructive"
        onConfirm={handleDeleteClient}
        isPending={deleteClientMutation.isPending}
      />

      <WhatsAppCobrancaModal
        client={client}
        open={isCobrancaOpen}
        onOpenChange={setIsCobrancaOpen}
      />

      <QuickTaskModal
        open={isQuickTaskOpen}
        onOpenChange={setIsQuickTaskOpen}
        defaultClientId={clientId}
      />
    </div>
  );
}
