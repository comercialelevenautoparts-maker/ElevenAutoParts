import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, MapPin, CreditCard, Package, QrCode, Barcode, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useAddresses, useCreateAddress } from '@/hooks/useAddresses';
import { useCoupon } from '@/hooks/useCoupons';
import { useCreateOrder } from '@/hooks/useOrders';
import { Cupom } from '@/types/database';
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

// *** ATENÇÃO: SUBSTITUA POR SUA CHAVE PÚBLICA DE TESTE DA STRIPE ***
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .slice(0, 15);
};

const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

// --- SCHEMA VALIDATION (ZOD) ---
const checkoutSchema = z.object({
  // Step 1: Address
  phone: z.string().min(14, 'Telefone inválido').max(15, 'Telefone inválido'),
  cep: z.string().min(9, 'CEP incompleto'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado inválido').max(2, 'Use a sigla (ex: SP)'),

  // Step 2: Payment Method Selection
  paymentMethod: z.enum(['credit', 'debit', 'pix', 'boleto']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");

  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: savedAddresses = [] } = useAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Cupom | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: '',
      cep: '',
      street: '',
      number: '',
      city: '',
      state: '',
      paymentMethod: 'credit',
    },
    mode: 'onChange',
  });

  const { watch, setValue, trigger } = form;
  const paymentMethod = watch('paymentMethod');

  const subtotal = getTotalPrice();
  const shipping = 29.99;

  // Calculate Coupon Discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.tipo === 'percentual') {
      couponDiscount = subtotal * (appliedCoupon.valor / 100);
    } else {
      couponDiscount = appliedCoupon.valor;
    }
  }

  const specialDiscount = subtotal * 0.1;
  const total = subtotal + shipping - specialDiscount - couponDiscount;

  const steps = [
    { id: 1, name: 'Endereço', icon: MapPin },
    { id: 2, name: 'Resumo', icon: Package },
    { id: 3, name: 'Pagamento', icon: CreditCard },
  ];

  const { data: couponData, refetch: validateCoupon } = useCoupon(couponCode);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const { data, error } = await validateCoupon();
      if (data) {
        setAppliedCoupon(data as Cupom);
        toast.success(`Cupom ${data.codigo} aplicado!`);
      } else if (error) {
        toast.error((error as any).message || 'Cupom inválido.');
      } else {
        toast.error('Cupom não encontrado.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao validar cupom.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Address Lookup Logic
  const handleBlurCep = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue('street', data.logradouro);
          setValue('city', data.localidade);
          setValue('state', data.uf);
          toast.success('Endereço encontrado!');
          trigger(['street', 'city', 'state']);
        } else {
          toast.error('CEP não encontrado.');
        }
      } catch (error) {
        toast.error('Erro ao buscar CEP.');
      } finally {
        setIsLoadingAddress(false);
      }
    }
  };

  // Create PaymentIntent Simulation
  useEffect(() => {
    if (step === 3 && (paymentMethod === 'credit' || paymentMethod === 'debit')) {
      // NOTE: Without a backend, we cannot generate a valid clientSecret.
      // We set this to empty or specific value to trigger the 'Simulation Mode' UI
      // instead of trying to render Stripe Elements with an invalid key (which crashes).
      setClientSecret("");
    }
  }, [step, paymentMethod, total]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof CheckoutFormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['phone', 'cep', 'street', 'number', 'city', 'state'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const { mutateAsync: createOrder } = useCreateOrder();
  const { mutateAsync: createAddress } = useCreateAddress();
  const [isFinishing, setIsFinishing] = useState(false);

  // Called when non-stripe payments are finished
  const handleManualFinish = async () => {
    setIsFinishing(true);
    try {
      let addressId = selectedAddressId;

      // 1. If it's a new address, create it first
      if (!addressId) {
        const newAddr = await createAddress({
          cep: watch('cep'),
          logradouro: watch('street'),
          numero: watch('number'),
          cidade: watch('city'),
          uf: watch('state'),
          bairro: 'Não informado', // Bairro not in form, using placeholder
          complemento: '',
          tipo: 'entrega',
          padrao: false
        });
        addressId = newAddr.id;
      }

      // 2. Create the order
      await createOrder({
        endereco_id: addressId as string,
        valor_produtos: subtotal,
        valor_frete: shipping,
        valor_desconto: specialDiscount + couponDiscount,
        valor_total: total,
        forma_pagamento: paymentMethod,
        itens: items.map(item => ({
          produto_id: item.id,
          nome_produto: item.name,
          quantidade: item.quantity,
          preco_unitario: item.price,
          subtotal: item.price * item.quantity,
          tamanho: item.size
        }))
      });

      clearCart();
      toast.success('Pedido realizado com sucesso!');
      navigate('/pedidos');
    } catch (error: any) {
      toast.error('Erro ao processar pedido: ' + (error.message || 'Erro desconhecido.'));
    } finally {
      setIsFinishing(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  // Stripe Appearance Options
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0f172a',
    },
  };

  // NOTE: Without a real clientSecret from a backend, the Elements provider 
  // will throw an error or not render correctly. 
  // For demonstration purposes, we are checking if we have a secret (even fake).
  // In a real app, don't show the payment step until loading=false and secret exists.
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.id ? 'border-primary bg-primary text-primary-foreground shadow-lg' : 'border-muted'
                  }`}>
                  {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className="hidden md:block font-medium">{s.name}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 md:w-24 h-0.5 mx-2 rounded-full transition-colors ${step > s.id ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Form {...form}>
              <form className="space-y-8">

                {/* STEP 1: Address */}
                {step === 1 && (
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-left-4">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <MapPin className="text-primary w-6 h-6" />
                      <div>
                        <h2 className="text-xl font-bold">Detalhes da entrega</h2>
                        <p className="text-muted-foreground text-sm">Onde devemos entregar seu pedido?</p>
                      </div>
                    </div>

                    {/* Saved Addresses List */}
                    {savedAddresses.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-sm font-semibold mb-3">Seus endereços salvos:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {savedAddresses.map((addr) => (
                            <div
                              key={addr.id}
                              onClick={() => {
                                setSelectedAddressId(addr.id);
                                setValue('cep', addr.cep);
                                setValue('street', addr.logradouro);
                                setValue('number', addr.numero);
                                setValue('city', addr.cidade);
                                setValue('state', addr.uf);
                                trigger(['cep', 'street', 'number', 'city', 'state']);
                              }}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === addr.id
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'hover:border-primary/50'
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-xs uppercase text-muted-foreground">{addr.tipo}</span>
                                {addr.padrao && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Padrão</span>}
                              </div>
                              <p className="text-sm font-medium mt-1">{addr.logradouro}, {addr.numero}</p>
                              <p className="text-xs text-muted-foreground">{addr.cidade} - {addr.uf}</p>
                            </div>
                          ))}
                          <div
                            onClick={() => {
                              setSelectedAddressId(null);
                              form.reset({
                                ...form.getValues(),
                                cep: '', street: '', number: '', city: '', state: ''
                              });
                            }}
                            className={`p-4 border border-dashed rounded-lg cursor-pointer flex items-center justify-center hover:bg-muted/50 transition-all ${!selectedAddressId ? 'border-primary bg-primary/5' : ''
                              }`}
                          >
                            <span className="text-sm font-medium">+ Novo endereço</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone / WhatsApp</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} onChange={(e) => field.onChange(formatPhone(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="cep"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="00000-000"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(formatCEP(e.target.value));
                                      if (selectedAddressId) setSelectedAddressId(null);
                                    }}
                                    onBlur={handleBlurCep}
                                  />
                                  {isLoadingAddress && (
                                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name="street"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rua</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome da rua" {...field} disabled={isLoadingAddress} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade</FormLabel>
                                <FormControl>
                                  <Input placeholder="Cidade" {...field} disabled={isLoadingAddress} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input placeholder="SP" maxLength={2} className="uppercase" {...field} disabled={isLoadingAddress} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="button" onClick={nextStep} className="btn-primary mt-6 w-full md:w-auto">
                      Continuar para Resumo
                    </Button>
                  </div>
                )}

                {/* STEP 2: Summary -> New flow: Address, then Summary, then Payment */}
                {step === 2 && (
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <Package className="text-primary w-6 h-6" />
                      <div>
                        <h2 className="text-xl font-bold">Resumo do pedido</h2>
                        <p className="text-muted-foreground text-sm">Confira os itens antes de pagar</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded bg-white p-1" />
                          <div className="flex-1">
                            <p className="font-medium text-sm md:text-base">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                          </div>
                          <span className="font-bold whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted/40 p-4 rounded-lg space-y-2 text-sm mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Endereço:</span>
                        <span className="font-medium text-right">{watch('street')}, {watch('number')} - {watch('city')}/{watch('state')}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button type="button" variant="outline" onClick={prevStep}>Voltar</Button>
                      <Button type="button" onClick={() => setStep(3)} className="btn-primary flex-1">
                        Ir para Pagamento
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Payment */}
                {step === 3 && (
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <CreditCard className="text-primary w-6 h-6" />
                      <div>
                        <h2 className="text-xl font-bold">Método de pagamento</h2>
                        <p className="text-muted-foreground text-sm">Ambiente criptografado e seguro</p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              {[
                                { id: 'credit', icon: CreditCard, label: 'Cartão' }, // Credit/Debit handled by Stripe Elements
                                { id: 'pix', icon: QrCode, label: 'Pix' },
                                { id: 'boleto', icon: Barcode, label: 'Boleto' }
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  onClick={() => field.onChange(option.id)}
                                  className={`cursor-pointer p-4 border rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-200 ${field.value === option.id
                                    ? 'border-primary bg-primary/5 text-primary shadow-inner ring-1 ring-primary'
                                    : 'border-border hover:bg-muted/50 hover:border-primary/50'
                                    }`}
                                >
                                  <option.icon className="w-8 h-8" />
                                  <span className="font-medium">{option.label}</span>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* STRIPE PAYMENT AREA */}
                    {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                      <div className="mt-6">
                        {/* 
                          CRITICAL: Stripe Elements REQUIRE a valid clientSecret generated by a real backend.
                          A hardcoded/dummy secret ('pi_test_12345_secret_abcde') WILL CAUSE A CRASH or BLANK SCREEN
                          because the Stripe SDK tries to parse it and fails.
                          
                          To prevent the blank screen for this demo, we will only render the Element if we have a valid-looking secret,
                          OR we will show a "Simulation Mode" fallback if we detect we are in a demo environment without a backend.
                        */}
                        {clientSecret && clientSecret.includes('_secret_') ? (
                          <div className="min-h-[300px]">
                            {/* We wrap this in a try-catch visually by checking secret validity first */}
                            <Elements stripe={stripePromise} options={options}>
                              <StripePaymentForm
                                onSuccess={handleManualFinish}
                                onBack={prevStep}
                                amount={total}
                              />
                            </Elements>
                          </div>
                        ) : (
                          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg text-center animate-in fade-in">
                            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-yellow-600 dark:text-yellow-500" />
                            <h3 className="font-bold text-lg mb-2">Integração Stripe (Modo Simulação)</h3>
                            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                              Para processar cartões reais, o Backend precisa gerar uma chave de transação única (Client Secret).
                              <br /><br />
                              Como estamos sem backend agora, clique abaixo para simular um pagamento de sucesso.
                            </p>

                            <div className="flex gap-4 justify-center">
                              <Button type="button" variant="outline" onClick={prevStep} disabled={isFinishing}>Voltar</Button>
                              <Button type="button" onClick={handleManualFinish} className="btn-primary" disabled={isFinishing}>
                                {isFinishing ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processando...
                                  </>
                                ) : (
                                  'Simular Pagamento Aprovado'
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === 'pix' && (
                      <div className="p-6 bg-muted/30 rounded-lg text-center border-dashed border-2 animate-in fade-in">
                        <QrCode className="w-16 h-16 mx-auto mb-4 text-primary" />
                        <h3 className="font-bold text-lg mb-2">Pagamento via Pix</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                          Clique em finalizar para gerar o QR Code. O pagamento é aprovado instantaneamente.
                        </p>
                        <div className="flex gap-4">
                          <Button type="button" variant="outline" onClick={prevStep} disabled={isFinishing}>Voltar</Button>
                          <Button type="button" onClick={handleManualFinish} className="btn-primary flex-1" disabled={isFinishing}>
                            {isFinishing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Gerar Pix Copia e Cola'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'boleto' && (
                      <div className="p-6 bg-muted/30 rounded-lg text-center border-dashed border-2 animate-in fade-in">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-primary" />
                        <h3 className="font-bold text-lg mb-2">Boleto Bancário</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                          O boleto tem vencimento de 3 dias úteis. A aprovação ocorre na manhã seguinte ao pagamento.
                        </p>
                        <div className="flex gap-4">
                          <Button type="button" variant="outline" onClick={prevStep} disabled={isFinishing}>Voltar</Button>
                          <Button type="button" onClick={handleManualFinish} className="btn-primary flex-1" disabled={isFinishing}>
                            {isFinishing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Gerar Boleto'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </Form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-lg mb-4">Valores</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal ({items.length} itens)</span><span>R$ {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Entrega estimada</span><span>R$ {shipping.toFixed(2)}</span></div>
                <div className="flex justify-between text-green-600"><span>Desconto especial</span><span>- R$ {specialDiscount.toFixed(2)}</span></div>

                {appliedCoupon && (
                  <div className="flex justify-between text-primary font-medium animate-in slide-in-from-top-1">
                    <span>Cupom ({appliedCoupon.codigo})</span>
                    <span>- R$ {couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-4 mt-4 border-t">
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Cupom de desconto"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="h-9 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode}
                      className="h-9 px-3 text-xs"
                    >
                      {isValidatingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Aplicar'}
                    </Button>
                  </div>

                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lg">Total</span>
                    <div className="text-right">
                      <span className="font-bold text-2xl text-primary">R$ {total.toFixed(2)}</span>
                      <p className="text-xs text-muted-foreground">ou 10x de R$ {(total / 10).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Compra 100% Segura e Garantida</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
