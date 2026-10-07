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
    { name: "DASN-SIMEI", defaultDay: 31 },
  ],
  simples: [
    { name: "DAS - Simples Nacional", defaultDay: 20 },
    { name: "Folha de Pagamento", defaultDay: 5 },
    { name: "FGTS Digital", defaultDay: 20 },
    { name: "INSS", defaultDay: 20 },
    { name: "DEFIS", defaultDay: 31 },
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
      notes: client?.notes || "",
    },
  });

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

    onSubmit(data, finalObligations);
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
                <FormLabel>Telefone</FormLabel>
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
              <h4 className="text-sm font-medium leading-none">Obrigações comuns deste regime</h4>
              <p className="text-[0.8rem] text-muted-foreground">
                Selecione as obrigações que devem ser criadas junto com este cliente.
              </p>
            </div>
            
            <div className="border rounded-md max-h-64 overflow-y-auto p-3 space-y-3 bg-muted/20">
              {obligationTypes.map((ob) => {
                const isSelected = selectedObs[ob.id]?.selected || false;
                const dueDay = selectedObs[ob.id]?.due_day || 30;

                return (
                  <div key={ob.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`ob-${ob.id}`}
                        checked={isSelected}
                        onChange={(e) => toggleObligation(ob.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                      />
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
                        className="w-16 h-8 text-center text-sm"
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
