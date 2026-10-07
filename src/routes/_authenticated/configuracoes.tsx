import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { 
  useObligationTypes, 
  useAddObligationType, 
  useUpdateObligationType, 
  useDeleteObligationType 
} from "@/hooks/use-obligations";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import type { ObligationType } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  component: ConfiguracoesRoute,
});

function ConfiguracoesRoute() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: obligationTypes, isLoading } = useObligationTypes();
  const addObligationType = useAddObligationType();
  const updateObligationType = useUpdateObligationType();
  const deleteObligationType = useDeleteObligationType();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingType, setEditingType] = useState<ObligationType | null>(null);

  const [formState, setFormState] = useState({
    name: "",
    description: "",
    default_due_day: "",
  });

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const handleOpenAdd = () => {
    setFormState({ name: "", description: "", default_due_day: "" });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (type: ObligationType) => {
    setEditingType(type);
    setFormState({
      name: type.name,
      description: type.description || "",
      default_due_day: type.default_due_day ? String(type.default_due_day) : "",
    });
  };

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) return;

    addObligationType.mutate({
      name: formState.name,
      description: formState.description || undefined,
      default_due_day: formState.default_due_day ? parseInt(formState.default_due_day) : undefined,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setFormState({ name: "", description: "", default_due_day: "" });
      }
    });
  };

  const handleUpdateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType || !formState.name) return;

    updateObligationType.mutate({
      id: editingType.id,
      name: formState.name,
      description: formState.description || null,
      default_due_day: formState.default_due_day ? parseInt(formState.default_due_day) : null,
    }, {
      onSuccess: () => {
        setEditingType(null);
        setFormState({ name: "", description: "", default_due_day: "" });
      }
    });
  };

  const [deleteData, setDeleteData] = useState<{id: string, name: string} | null>(null);

  const handleDeleteType = (id: string, name: string) => {
    setDeleteData({ id, name });
  };

  const confirmDelete = () => {
    if (deleteData) {
      deleteObligationType.mutate(deleteData.id, {
        onSettled: () => setDeleteData(null)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sua Conta</CardTitle>
          <CardDescription>Gerencie suas informações de acesso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">E-mail de acesso</Label>
            <div className="font-medium mt-1">{session?.user?.email || "Usuário não logado"}</div>
          </div>
          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair da Conta
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Tipos de Obrigações</CardTitle>
            <CardDescription>Obrigações padrão disponíveis no sistema.</CardDescription>
          </div>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Tipo
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground mt-4">Carregando tipos...</div>
          ) : obligationTypes?.length === 0 ? (
            <div className="text-sm text-muted-foreground mt-4">Nenhum tipo de obrigação configurado.</div>
          ) : (
            <div className="mt-4 border rounded-md divide-y">
              {obligationTypes?.map((type) => (
                <div key={type.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{type.name}</div>
                    {type.description && (
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {type.default_due_day && (
                      <div className="text-sm px-2.5 py-1 bg-muted rounded-md whitespace-nowrap font-medium">
                        Vence dia {type.default_due_day}
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenEdit(type)}
                      title="Editar obrigação"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteType(type.id, type.name)}
                      title="Excluir obrigação"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Criar */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Tipo de Obrigação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateType} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Obrigação *</Label>
              <Input 
                id="name" 
                placeholder="Ex: DAS, PIS/COFINS, etc." 
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input 
                id="description" 
                placeholder="Breve descrição (opcional)" 
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_due_day">Dia do Vencimento Padrão (1-31)</Label>
              <Input 
                id="default_due_day" 
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 20" 
                value={formState.default_due_day}
                onChange={(e) => setFormState({ ...formState, default_due_day: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addObligationType.isPending || !formState.name}>
                {addObligationType.isPending ? "Criando..." : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Obrigação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateType} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Obrigação *</Label>
              <Input 
                id="edit-name" 
                placeholder="Ex: DAS, PIS/COFINS, etc." 
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input 
                id="edit-description" 
                placeholder="Breve descrição (opcional)" 
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-default_due_day">Dia do Vencimento Padrão (1-31)</Label>
              <Input 
                id="edit-default_due_day" 
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 20" 
                value={formState.default_due_day}
                onChange={(e) => setFormState({ ...formState, default_due_day: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingType(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateObligationType.isPending || !formState.name}>
                {updateObligationType.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteData}
        onOpenChange={(open) => !open && setDeleteData(null)}
        title="Confirmar ação"
        description={`Deseja realmente excluir o tipo de obrigação "${deleteData?.name}"? Essa ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        onConfirm={confirmDelete}
        isPending={deleteObligationType.isPending}
      />
    </div>
  );
}
