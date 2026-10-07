import { useState } from 'react';
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
import { useAddPendingDoc } from '@/hooks/use-pending-docs';

const docFormSchema = z.object({
  description: z.string().min(3, 'A descrição deve ter no mínimo 3 caracteres'),
  reference_month: z.string().optional(),
});

type DocFormValues = z.infer<typeof docFormSchema>;

interface DocFormProps {
  clientId: string;
}

export function DocForm({ clientId }: DocFormProps) {
  const { mutate: addDoc, isPending } = useAddPendingDoc();

  const form = useForm<DocFormValues>({
    resolver: zodResolver(docFormSchema),
    defaultValues: {
      description: '',
      reference_month: '',
    },
  });

  const onSubmit = (data: DocFormValues) => {
    addDoc(
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
            name="description"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Descrição do Documento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Extrato bancário, Notas Fiscais" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reference_month"
            render={({ field }) => (
              <FormItem className="sm:w-48">
                <FormLabel>Mês de Referência (Opcional)</FormLabel>
                <FormControl>
                  <Input type="month" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Adicionando...' : 'Solicitar Documento'}
        </Button>
      </form>
    </Form>
  );
}
