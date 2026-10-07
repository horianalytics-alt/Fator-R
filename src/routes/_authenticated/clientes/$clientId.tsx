import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useClient, useUpdateClient } from '@/hooks/use-clients';
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
import { ArrowLeft, Building2, AlertCircle, CheckCircle2, Phone, Mail, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [isEditOpen, setIsEditOpen] = useState(false);

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
          
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Editar Cliente</Button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-1">
          <span className="text-sm text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4"/> Documento</span>
          <span className="font-medium">{client.document || "Não informado"}</span>
        </div>
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-1">
          <span className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4"/> Telefone</span>
          <span className="font-medium">{client.phone || "Não informado"}</span>
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
            <GenerateTasksBtn clientId={clientId} month={currentDate} />
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
      
      {client.notes && (
        <div className="bg-muted/30 p-4 rounded-lg border">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Observações</h4>
          <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}
    </div>
  );
}
