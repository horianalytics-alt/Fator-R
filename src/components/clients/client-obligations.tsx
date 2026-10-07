import { useState } from 'react';
import { useObligationTypes, useAddClientObligation, useRemoveClientObligation } from '@/hooks/use-obligations';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface ClientObligationsProps {
  clientId: string;
  obligations: any[];
}

export function ClientObligations({ clientId, obligations }: ClientObligationsProps) {
  const { data: obligationTypes, isLoading: isLoadingTypes } = useObligationTypes();
  const addMutation = useAddClientObligation();
  const removeMutation = useRemoveClientObligation();

  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [dueDay, setDueDay] = useState<string>('');

  const handleAdd = () => {
    if (!selectedTypeId || !dueDay) return;
    
    addMutation.mutate({
      client_id: clientId,
      obligation_type_id: selectedTypeId,
      due_day: parseInt(dueDay, 10),
    }, {
      onSuccess: () => {
        setSelectedTypeId('');
        setDueDay('');
      }
    });
  };

  const handleRemove = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta obrigação?')) {
      removeMutation.mutate(id);
    }
  };

  const activeTypesIds = obligations?.map(o => o.obligation_type_id) || [];
  const availableTypes = obligationTypes?.filter(t => !activeTypesIds.includes(t.id)) || [];

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg border flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-sm font-medium mb-1 block">Obrigação</label>
          <Select value={selectedTypeId} onValueChange={setSelectedTypeId} disabled={isLoadingTypes}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma obrigação" />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-32">
          <label className="text-sm font-medium mb-1 block">Dia do Venc.</label>
          <Input 
            type="number" 
            min="1" 
            max="31" 
            value={dueDay} 
            onChange={(e) => setDueDay(e.target.value)} 
            placeholder="Ex: 15"
          />
        </div>
        
        <Button 
          onClick={handleAdd} 
          disabled={!selectedTypeId || !dueDay || addMutation.isPending}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Dia do Vencimento</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!obligations?.length ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma obrigação vinculada.
                </td>
              </tr>
            ) : (
              obligations.map((obs) => (
                <tr key={obs.id} className="border-t">
                  <td className="px-4 py-3">{obs.obligation_types?.name}</td>
                  <td className="px-4 py-3">Dia {obs.due_day}</td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemove(obs.id)}
                      disabled={removeMutation.isPending}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
