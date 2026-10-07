import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTasks } from '@/hooks/use-tasks';
import { useClients } from '@/hooks/use-clients';
import { TaskList } from '@/components/tasks/task-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/tarefas')({
  component: TarefasRoute,
});

function TarefasRoute() {
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('todas');

  const { data: clients, isLoading: isClientsLoading } = useClients();
  // Fetch all tasks for active clients, no clientId or referenceMonth filter
  const { data: allTasks, isLoading: isTasksLoading } = useTasks();

  if (isTasksLoading || isClientsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Todas as Tarefas</h1>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-4 mt-8">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // Only active clients
  const activeClients = clients?.filter(c => c.is_active) || [];

  // Filter tasks
  let filteredTasks = allTasks?.filter(task => {
    // 1. Only tasks belonging to active clients
    if (task.clients && !task.clients.is_active && task.clients.is_active !== undefined) {
      return false; // exclude inactive clients tasks if we can check it
      // Wait, is_active is in `clients` joined data?
      // useTasks has: `clients (id, name, payment_status)`
      // We didn't fetch `is_active` in useTasks.
      // We can check if `activeClients` contains this task's `client_id`
    }
    const isClientActive = activeClients.some(c => c.id === task.client_id);
    if (!isClientActive) return false;

    // 2. Client filter
    if (selectedClient !== 'all' && task.client_id !== selectedClient) {
      return false;
    }

    // 3. Status filter
    if (selectedStatus === 'concluidas' && task.status !== 'concluida') return false;
    if (selectedStatus === 'pendentes' && task.status === 'concluida') return false;
    if (selectedStatus === 'atrasadas') {
      const isCompleted = task.status === 'concluida';
      const todayTime = new Date().setHours(0, 0, 0, 0);
      const dueTime = new Date(task.due_date).setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((dueTime - todayTime) / (1000 * 60 * 60 * 24));
      if (isCompleted || diffDays >= 0) return false;
    }

    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Tarefas
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as tarefas de todos os clientes</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Filtrar por Cliente</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes ativos</SelectItem>
              {activeClients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Filtrar por Status</label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status da tarefa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="pendentes">Pendentes (Não concluídas)</SelectItem>
              <SelectItem value="atrasadas">Atrasadas</SelectItem>
              <SelectItem value="concluidas">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8">
        {filteredTasks.length === 0 ? (
          <div className="bg-card border rounded-lg p-12 text-center flex flex-col items-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Nenhuma tarefa encontrada.</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              Selecione outro filtro ou gere as tarefas do mês no Calendário.
            </p>
          </div>
        ) : (
          <TaskList tasks={filteredTasks} />
        )}
      </div>
    </div>
  );
}
