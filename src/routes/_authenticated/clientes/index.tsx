import { useState, useMemo } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useClients, useCreateClient } from '@/hooks/use-clients';
import { ClientCard } from '@/components/clients/client-card';
import { ClientFilters } from '@/components/clients/client-filters';
import { ClientForm } from '@/components/clients/client-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const Route = createFileRoute('/_authenticated/clientes/')({
  component: ClientesRoute,
});

function ClientesRoute() {
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients();
  const { mutate: createClient } = useCreateClient();
  
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    
    let filtered = clients;

    // Apply Search
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        c => 
          c.name.toLowerCase().includes(s) || 
          (c.document && c.document.includes(s)) ||
          (c.email && c.email.toLowerCase().includes(s))
      );
    }

    // Apply Filter
    switch (activeFilter) {
      case 'Ativos':
        filtered = filtered.filter(c => c.is_active);
        break;
      case 'Inativos':
        filtered = filtered.filter(c => !c.is_active);
        break;
      case 'Devedores':
        filtered = filtered.filter(c => c.payment_status === 'devedor');
        break;
    }

    return filtered;
  }, [clients, search, activeFilter]);

  const handleCreateSubmit = (data: any) => {
    createClient(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie a carteira de clientes do escritório.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <ClientForm 
              onSubmit={handleCreateSubmit} 
              onCancel={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-background rounded-lg border p-4 shadow-sm">
        <ClientFilters 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onSearch={setSearch}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20">
          <p className="text-lg font-medium">Nenhum cliente encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search || activeFilter !== 'Todos' 
              ? 'Tente alterar os filtros ou o termo de busca.' 
              : 'Comece cadastrando um novo cliente.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              pendingTasksCount={0} // To be implemented with tasks hook later
              onClick={() => navigate({ to: '/clientes/$clientId', params: { clientId: client.id } })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
