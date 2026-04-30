import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Store, MapPin, Save, Loader2, Info, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProfileSidebar from '@/components/account/ProfileSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePickupPoint, useUpdatePickupPoint } from '@/hooks/usePickupPoints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const pickupPointSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  address: z.string().min(5, 'Endereço obrigatório'),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF deve ter 2 caracteres'),
  cep: z.string().min(8, 'CEP inválido'),
  instructions: z.string().optional(),
});

type PickupPointFormValues = z.infer<typeof pickupPointSchema>;

const PickupPointManagement = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { data: pickupPoint, isLoading: isFetching } = usePickupPoint();
  const updateMutation = useUpdatePickupPoint();

  const form = useForm<PickupPointFormValues>({
    resolver: zodResolver(pickupPointSchema),
    defaultValues: {
      name: '',
      address: '',
      neighborhood: '',
      city: '',
      state: '',
      cep: '',
      instructions: '',
    },
  });

  useEffect(() => {
    if (pickupPoint) {
      form.reset({
        name: pickupPoint.name,
        address: pickupPoint.address,
        neighborhood: pickupPoint.neighborhood,
        city: pickupPoint.city,
        state: pickupPoint.state,
        cep: pickupPoint.cep,
        instructions: pickupPoint.instructions || '',
      });
    }
  }, [pickupPoint, form]);

  const onSubmit = async (values: PickupPointFormValues) => {
    if (!pickupPoint?.id) return;

    try {
      await updateMutation.mutateAsync({
        id: pickupPoint.id,
        ...values,
      });
      toast({
        title: "Sucesso!",
        description: "Posto de retirada atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar o posto de retirada.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || isFetching) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
          <p className="text-muted-foreground mt-2">Você não tem permissão para acessar esta página.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Posto de Retirada</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <ProfileSidebar />

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 md:p-6 border border-primary/20 shadow-sm mb-6">
              <div className="flex items-center md:items-start gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 bg-primary/20 rounded-full text-primary flex-shrink-0">
                  <Store className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-primary uppercase tracking-tight md:mb-1">Gestão de Retirada Física</h2>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Configure as informações do local onde seus clientes poderão retirar os produtos pessoalmente.
                  </p>
                </div>
              </div>
            </div>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Detalhes do Local
                </CardTitle>
                <CardDescription>
                  Estas informações aparecerão no checkout quando o cliente selecionar "Retirar no Posto".
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold uppercase text-[10px] tracking-widest opacity-70">Nome do Local</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Matriz Eleven Auto Parts" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold uppercase text-[10px] tracking-widest opacity-70">CEP</FormLabel>
                            <FormControl>
                              <Input placeholder="00000-000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="font-bold uppercase text-[10px] tracking-widest opacity-70">Logradouro e Número</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input className="pl-10" placeholder="Rua Exemplo, 123" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold uppercase text-[10px] tracking-widest opacity-70">Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Centro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4 md:col-span-1">
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold uppercase text-[10px] tracking-widest opacity-70">Cidade</FormLabel>
                                <FormControl>
                                  <Input placeholder="São Paulo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold uppercase text-[10px] tracking-widest opacity-70">UF</FormLabel>
                                <FormControl>
                                  <Input placeholder="SP" maxLength={2} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="font-bold uppercase text-[10px] tracking-widest opacity-70">Instruções de Retirada</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Ex: Horário de funcionamento, documentos necessários, etc." 
                                className="min-h-[100px] resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <CardDescription className="text-[10px] mt-1 italic">
                              Dica: Mencione horários e pontos de referência.
                            </CardDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        className="btn-primary w-full md:w-auto px-8 gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Salvar Alterações
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="bg-muted/30 border border-dashed rounded-xl p-6 text-center">
               <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-70">Prévia do Voucher</h3>
               <div className="max-w-md mx-auto bg-card border rounded-lg p-6 shadow-sm text-left">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-black text-xs uppercase tracking-widest">Pedido Pronto</span>
                  </div>
                  <h4 className="font-bold text-sm mb-1">{form.watch('name') || 'Nome do Local'}</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    {form.watch('address')}, {form.watch('neighborhood')}<br />
                    {form.watch('city')} - {form.watch('state')}, {form.watch('cep')}
                  </p>
                  <div className="p-3 bg-muted rounded text-[10px] font-medium leading-relaxed opacity-80">
                    {form.watch('instructions') || 'Instruções aparecerão aqui...'}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PickupPointManagement;
