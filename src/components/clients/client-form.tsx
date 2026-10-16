import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/lib/types";
import { useObligationTypes } from "@/hooks/use-obligations";
import { 
  extractContactsFromNotes, 
  extractCleanNotes, 
  combineNotesAndContacts, 
  ClientContact 
} from "@/lib/client-contacts-utils";
import { Plus, Trash2, Users } from "lucide-react";
import { Label } from "@/components/ui/label";

const clientFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  document: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  tax_regime: z.enum(["mei", "simples", "lucro_presumido", "lucro_real", "outro"]),
  is_active: z.boolean().default(true),
  payment_status: z.enum(["em_dia", "devedor"]),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormValues, obligations?: { obligation_type_id: string; due_day: number }[]) => void;
  onCancel: () => void;
}

const REGIME_TEMPLATES = {
  mei: [
    { name: "DAS - Simples Nacional", defaultDay: 20 },
    // V2: obrigações anuais precisam de campo de mês de vencimento.
    // { name: "DASN-SIMEI", defaultDay: 31 },
  ],
  simples: [
    { name: "DAS - Simples Nacional", defaultDay: 20 },
    { name: "Folha de Pagamento", defaultDay: 5 },
    { name: "FGTS Digital", defaultDay: 20 },
    { name: "INSS", defaultDay: 20 },
    // V2: obrigações anuais precisam de campo de mês de vencimento.
    // { name: "DEFIS", defaultDay: 31 },
  ],
  lucro_presumido: [
    { name: "IRPJ/CSLL", defaultDay: 30 },
    { name: "PIS/COFINS", defaultDay: 25 },
    { name: "Folha de Pagamento", defaultDay: 5 },
    { name: "FGTS Digital", defaultDay: 20 },
    { name: "INSS", defaultDay: 20 },
    { name: "DCTF", defaultDay: 15 },
  ],
  lucro_real: [
    { name: "IRPJ/CSLL", defaultDay: 30 },
    { name: "PIS/COFINS", defaultDay: 25 },
    { name: "Folha de Pagamento", defaultDay: 5 },
    { name: "FGTS Digital", defaultDay: 20 },
    { name: "INSS", defaultDay: 20 },
    { name: "DCTF", defaultDay: 15 },
  ],
  outro: [],
};

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const { data: obligationTypes } = useObligationTypes();
  const [selectedObs, setSelectedObs] = useState<Record<string, { selected: boolean; due_day: number }>>({});
  const [contacts, setContacts] = useState<ClientContact[]>(() => {
    return extractContactsFromNotes(client?.notes);
  });

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client?.name || "",
      document: client?.document || "",
      phone: client?.phone || "",
      email: client?.email || "",
      tax_regime: client?.tax_regime || "simples",
      is_active: client !== undefined ? client.is_active : true,
      payment_status: client?.payment_status || "em_dia",
      notes: extractCleanNotes(client?.notes),
    },
  });

  const handleAddContact = () => {
    setContacts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', role: 'Sócio', phone: '' },
    ]);
  };

  const handleUpdateContact = (id: string, field: keyof ClientContact, value: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const taxRegime = form.watch("tax_regime");
  const isCreating = !client;

  useEffect(() => {
    if (!isCreating || !obligationTypes) return;

    const template = REGIME_TEMPLATES[taxRegime as keyof typeof REGIME_TEMPLATES] || [];
    const newState: Record<string, { selected: boolean; due_day: number }> = {};

    obligationTypes.forEach((ob) => {
      // Find if this DB obligation matches any in the template
      const templateMatch = template.find((t) => 
        ob.name.toLowerCase().includes(t.name.toLowerCase())
      );

      newState[ob.id] = {
        selected: !!templateMatch,
        due_day: templateMatch ? templateMatch.defaultDay : (ob.default_due_day || 30),
      };
    });

    setSelectedObs(newState);
  }, [taxRegime, obligationTypes, isCreating]);

  const handleSubmit = (data: ClientFormValues) => {
    let finalObligations = undefined;

    if (isCreating && obligationTypes) {
      finalObligations = obligationTypes
        .filter((ob) => selectedObs[ob.id]?.selected)
        .map((ob) => ({
          obligation_type_id: ob.id,
          due_day: selectedObs[ob.id]?.due_day || 30,
        }));
    }

    const finalNotes = combineNotesAndContacts(data.notes || '', contacts);
    onSubmit({ ...data, notes: finalNotes }, finalObligations);
  };

  const toggleObligation = (id: string, checked: boolean) => {
    setSelectedObs((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: checked },
    }));
  };

  const changeDueDay = (id: string, day: number) => {
    setSelectedObs((prev) => ({
      ...prev,
      [id]: { ...prev[id], due_day: day },
    }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome/Razão Social *</FormLabel>
              <FormControl>
                <Input placeholder="Empresa XYZ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone Principal (Empresa)</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contato@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEÇÃO DINÂMICA DE SÓCIOS E CONTATOS EXTRAS */}
        <div className="space-y-3 p-3.5 border rounded-lg bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Sócios e Contatos Adicionais (WhatsApp)
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Adicione sócios para envio de mensagens direcionadas e cobranças.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddContact}
              className="gap-1.5 text-xs h-9 min-h-[36px] sm:min-h-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar Sócio / Contato
            </Button>
          </div>

          {contacts.length === 0 ? (
            <div className="text-xs text-muted-foreground italic bg-background/50 border border-dashed rounded p-3 text-center">
              Nenhum sócio adicional cadastrado. Clique no botão acima para adicionar.
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 bg-background border rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end shadow-xs"
                >
                  <div className="sm:col-span-4 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Nome do Sócio / Contato *</Label>
                    <Input
                      placeholder="Ex: Roberto Silva"
                      value={contact.name}
                      onChange={(e) => handleUpdateContact(contact.id, 'name', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">Cargo / Função</Label>
                    <Input
                      placeholder="Ex: Sócio, Financeiro"
                      value={contact.role || ''}
                      onChange={(e) => handleUpdateContact(contact.id, 'role', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground">WhatsApp com DDD *</Label>
                    <Input
                      placeholder="Ex: (11) 98888-7777"
                      value={contact.phone}
                      onChange={(e) => handleUpdateContact(contact.id, 'phone', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveContact(contact.id)}
                      className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                      title="Remover este contato"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tax_regime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regime Tributário *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o regime" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mei">MEI</SelectItem>
                    <SelectItem value="simples">Simples Nacional</SelectItem>
                    <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                    <SelectItem value="lucro_real">Lucro Real</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situação Financeira *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="em_dia">Em Dia</SelectItem>
                    <SelectItem value="devedor">Devedor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Cliente Ativo</FormLabel>
                <div className="text-[0.8rem] text-muted-foreground">
                  Define se o cliente será exibido nas listagens principais
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais sobre o cliente..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCreating && obligationTypes && obligationTypes.length > 0 && (
          <div className="pt-2 border-t mt-4">
            <div className="space-y-1 mb-3">
              <h4 className="text-sm font-medium leading-none">Obrigações deste cliente</h4>
              <p className="text-[0.8rem] text-muted-foreground">
                Selecione as obrigações que devem ser criadas junto com este cliente.
              </p>
            </div>
            
            <div className="border rounded-md max-h-[40vh] overflow-y-auto p-3 space-y-3 bg-muted/20">
              {obligationTypes.map((ob) => {
                const isSelected = selectedObs[ob.id]?.selected || false;
                const dueDay = selectedObs[ob.id]?.due_day || 30;

                return (
                  <div key={ob.id} className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                      <div className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2">
                        <input
                          type="checkbox"
                          id={`ob-${ob.id}`}
                          checked={isSelected}
                          onChange={(e) => toggleObligation(ob.id, e.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                      </div>
                      <label 
                        htmlFor={`ob-${ob.id}`}
                        className="text-sm font-medium cursor-pointer select-none"
                      >
                        {ob.name}
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Dia</span>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={dueDay}
                        onChange={(e) => changeDueDay(ob.id, parseInt(e.target.value) || 1)}
                        disabled={!isSelected}
                        className="w-16 h-11 text-center text-base md:text-sm min-h-[44px]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {client ? "Salvar Alterações" : "Criar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
