import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAddHold } from '@/hooks/use-holds';

const holdFormSchema = z.object({
  document_description: z.string().min(3, 'A descrição deve ter no mínimo 3 caracteres'),
  reason: z.string().min(3, 'O motivo deve ter no mínimo 3 caracteres'),
});

type HoldFormValues = z.infer<typeof holdFormSchema>;

interface HoldFormProps {
  clientId: string;
}

export function HoldForm({ clientId }: HoldFormProps) {
  const { mutate: addHold, isPending } = useAddHold();

  const form = useForm<HoldFormValues>({
    resolver: zodResolver(holdFormSchema),
    defaultValues: {
      document_description: '',
      reason: 'Aguardando pagamento de honorários',
    },
  });

  const onSubmit = (data: HoldFormValues) => {
    addHold(
      {
        client_id: clientId,
        ...data,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={form.control}
            name="document_description"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Documento Retido</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Guias do Simples, IR" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Motivo da Retenção</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending} variant="destructive">
          {isPending ? 'Registrando...' : 'Registrar Retenção'}
        </Button>
      </form>
    </Form>
  );
}
