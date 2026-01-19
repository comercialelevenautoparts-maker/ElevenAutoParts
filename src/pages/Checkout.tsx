import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, MapPin, CreditCard, Package, QrCode, Barcode, FileText, Loader2, ShieldCheck, Truck, Wallet } from 'lucide-react';
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
import { useShipping } from '@/hooks/useShipping';
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
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
  complement: z.string().optional(),
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
  const [installments, setInstallments] = useState(1); // Número de parcelas selecionadas
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: savedAddresses = [] } = useAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Cupom | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      city: '',
      state: '',
      paymentMethod: 'credit',
    },
    mode: 'onChange',
  });

  const { watch, setValue, trigger } = form;
  const paymentMethod = watch('paymentMethod');
  const subtotal = getTotalPrice();

  // Shipping Logic
  const { calculateShipping, isLoading: isCalculatingShipping, options: shippingOptions } = useShipping();
  // Using ID string to track selection, matching the radio button value
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);

  // Create standardized options list for rendering
  const allShippingOptions = shippingOptions.map(opt => ({
    id: String(opt.id),
    name: opt.name,
    description: `Entrega via ${opt.company.name} estimada em ${opt.delivery_time} dias`,
    price: Number(opt.custom_price),
    logo: opt.company.picture
  }));

  // Find the selected option object based on ID
  const selectedShippingOption = allShippingOptions.find((s) => s.id === selectedShippingId);
  const shipping = selectedShippingOption ? selectedShippingOption.price : 0;

  // Calculate Coupon Discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.tipo === 'percentual') {
      couponDiscount = subtotal * (appliedCoupon.valor / 100);
    } else {
      couponDiscount = appliedCoupon.valor;
    }
  }

  const baseTotal = subtotal + shipping - couponDiscount;

  // Interest Logic: 1-3x interest-free, 4x+ logic
  const INTEREST_RATE = 0.0299; // 2.99% per month
  const MAX_FREE_INSTALLMENTS = 3;

  const calculateTotalWithInterest = (base: number, n: number) => {
    if (n <= MAX_FREE_INSTALLMENTS || paymentMethod !== 'credit') return base;
    // Applying simple interest for the whole period for 4x onwards
    return base * (1 + (INTEREST_RATE * n));
  };

  const finalTotal = calculateTotalWithInterest(baseTotal, installments);

  const steps = [
    { id: 1, name: 'Endereço', icon: MapPin },
    { id: 2, name: 'Pagamento', icon: CreditCard },
    { id: 3, name: 'Resumo', icon: Package },
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
  const handleSearchCep = async (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, '');
    if (cep.length === 8) {
      setIsLoadingAddress(true);
      try {
        // 1. Fetch Address
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue('street', data.logradouro);
          setValue('city', data.localidade);
          setValue('state', data.uf);
          setValue('complement', data.complemento || '');
          toast.success('Endereço encontrado!');
          trigger(['street', 'city', 'state', 'complement']);

          // 2. Calculate Shipping
          await calculateShipping(cep, items);
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

  const handleBlurCep = async (e: React.FocusEvent<HTMLInputElement>) => {
    await handleSearchCep(e.target.value);
  };

  // Auto-select first shipping option if available and none selected
  useEffect(() => {
    if (allShippingOptions.length > 0 && !selectedShippingId) {
      setSelectedShippingId(allShippingOptions[0].id);
    }
  }, [allShippingOptions, selectedShippingId]);

  // ... lines omitted ...


  // Create PaymentIntent Simulation
  // Create PaymentIntent via Backend
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      // Only create intent if we are on payment step and method is credit/debit/pix/boleto
      if (step === 2 && (paymentMethod === 'credit' || paymentMethod === 'debit' || paymentMethod === 'pix' || paymentMethod === 'boleto') && finalTotal > 0) {
        console.log('🔄 Iniciando criação de PaymentIntent...', { step, paymentMethod, finalTotal });
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const response = await fetch(`${apiUrl}/api/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: finalTotal, // Backend handles * 100 conversion
              currency: 'brl',
              customerEmail: user?.email,
              metadata: {
                userId: user?.id,
                orderItems: items.length,
                installments: installments
              }
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Falha ao iniciar pagamento');
          }

          const data = await response.json();
          console.log('✅ PaymentIntent criado:', data.clientSecret);
          setClientSecret(data.clientSecret);
        } catch (error: any) {
          console.error("Error creating payment intent:", error);
          toast.error(error.message || "Erro ao inicializar pagamento seguro.");
        }
      } else {
        console.log('⏭️ Pulando criação de PaymentIntent:', { step, paymentMethod, finalTotal });
      }
    };

    fetchPaymentIntent();
  }, [step, paymentMethod, finalTotal, user, items.length]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof CheckoutFormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['phone', 'cep', 'street', 'number', 'complement', 'city', 'state'];

      // Validate Shipping Selection
      if (allShippingOptions.length > 0 && !selectedShippingId) {
        toast.error("Selecione uma opção de frete.");
        return;
      }
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
          complemento: watch('complement') || '',
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
        valor_desconto: couponDiscount,
        valor_total: finalTotal,
        forma_pagamento: paymentMethod,
        itens: items.map(item => ({
          produto_id: item.id,
          nome_produto: item.name,
          quantidade: item.quantity,
          preco_unitario: item.price,
          subtotal: item.price * item.quantity,
          tamanho: item.size,
          metadata: item.metadata
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
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
    locale: 'pt-BR' as const,
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
                                calculateShipping(addr.cep, items); // Auto calculate for saved address
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
                              setSelectedShippingId(null);
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
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <Input
                                      placeholder="00000-000"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(formatCEP(e.target.value));
                                        if (selectedAddressId) setSelectedAddressId(null);
                                      }}
                                      onBlur={handleBlurCep}
                                    />
                                  </div>
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
                        <FormField
                          control={form.control}
                          name="complement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complemento (opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Apto 101, Bloco A" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                    </div >


                    {allShippingOptions.length > 0 && (
                      <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Opções disponíveis:</p>
                        {allShippingOptions.map((option) => (
                          <label
                            key={option.id}
                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${selectedShippingId === option.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/30'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={selectedShippingId === option.id}
                                onChange={(e) => setSelectedShippingId(e.target.value)}
                                className="accent-primary"
                              />
                              <div className="flex items-center gap-3">
                                {option.logo && <img src={option.logo} alt={option.name} className="w-8 h-8 object-contain" />}
                                <div>
                                  <p className="font-medium">{option.name}</p>
                                  <p className="text-[11px] text-muted-foreground">{option.description}</p>
                                </div>
                              </div>
                            </div>
                            <span className="font-bold text-primary">R$ {option.price.toFixed(2)}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="hidden md:block"></div>
                  </div >
                )}

                {/* STEP 2: Summary -> New flow: Address, then Summary, then Payment */}
                {
                  step === 3 && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                        <Package className="text-primary w-6 h-6" />
                        <div>
                          <h2 className="text-xl font-bold">Resumo do pedido</h2>
                          <p className="text-muted-foreground text-sm">Confira os itens antes de finalizar</p>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg border border-border/50 items-start">
                            <img src={item.image} alt={item.name} className="w-20 h-20 object-contain rounded bg-white p-2 border" />
                            <div className="flex-1 space-y-1">
                              <h4 className="font-bold text-base text-foreground">{item.name}</h4>

                              {/* Product Metadata/Compatibility Display */}
                              {(item.metadata?.veiculo && typeof item.metadata.veiculo === 'object') && (
                                <div className="text-xs text-muted-foreground space-y-0.5 mt-4">
                                  <p className="font-medium text-foreground">Compatível com: {item.metadata.veiculo.marca} {item.metadata.veiculo.modelo} ({item.metadata.veiculo.ano})</p>
                                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4">
                                    {item.metadata.veiculo.medidas && (
                                      <span className="flex items-center gap-1 bg-background px-1.5 py-0.5 rounded border">
                                        Medidas: {item.metadata.veiculo.medidas.motorista}" / {item.metadata.veiculo.medidas.passageiro}"
                                      </span>
                                    )}
                                    {item.metadata.veiculo.conector && (
                                      <span className="flex items-center gap-1 bg-background px-1.5 py-0.5 rounded border">
                                        Conector: {item.metadata.veiculo.conector}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              <p className="text-sm text-foreground mt-2">Quantidade: <span className="font-medium">{item.quantity}</span></p>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-lg">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-muted/40 p-4 rounded-lg space-y-4 text-sm mb-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Endereço:</span>
                          <span className="font-medium text-right">
                            {watch('street')}, {watch('number')}
                            {watch('complement') ? ` - ${watch('complement')}` : ''}
                            {"\n"}-{"\n"}
                            {watch('city')}/{watch('state')}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2">
                          <span className="text-muted-foreground">Pagamento:</span>
                          <span className="font-medium text-right capitalize">
                            {paymentMethod === 'credit' && 'Cartão de Crédito'}
                            {paymentMethod === 'debit' && 'Cartão de Débito'}
                            {paymentMethod === 'pix' && 'Pix'}
                            {paymentMethod === 'boleto' && 'Boleto Bancário'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-6">
                        <Button type="button" variant="outline" onClick={prevStep}>Voltar</Button>
                        <Button type="button" onClick={handleManualFinish} className="btn-primary flex-1" disabled={isFinishing}>
                          {isFinishing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
                            </>
                          ) : 'Finalizar Pedido'}
                        </Button>
                      </div>
                    </div>
                  )
                }

                {/* STEP 3: Payment */}
                {
                  step === 2 && (
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
                                  { id: 'credit', icon: CreditCard, label: 'Crédito' },
                                  { id: 'debit', icon: Wallet, label: 'Débito' },
                                  { id: 'pix', icon: QrCode, label: 'Pix' },
                                  { id: 'boleto', icon: Barcode, label: 'Boleto' }
                                ].map((option) => (
                                  <div
                                    key={option.id}
                                    onClick={() => {
                                      field.onChange(option.id);
                                      // Reset installments when changing payment method
                                      if (option.id !== 'credit') {
                                        setInstallments(1);
                                      }
                                    }}
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



                      {/* STRIPE PAYMENT AREA - Now for all methods */}
                      {(paymentMethod === 'credit' || paymentMethod === 'debit' || paymentMethod === 'pix' || paymentMethod === 'boleto') && (
                        <div className="mt-6">
                          {(() => {
                            console.log('🎨 Renderizando área de pagamento:', { clientSecret, hasSecret: !!clientSecret, includesSecret: clientSecret?.includes('_secret_') });
                            return null;
                          })()}
                          {clientSecret && clientSecret.includes('_secret_') ? (
                            <div className="min-h-[300px]">
                              {/* We wrap this in a try-catch visually by checking secret validity first */}
                              <Elements key={clientSecret} stripe={stripePromise} options={options}>
                                <StripePaymentForm
                                  onSuccess={() => setStep(3)}
                                  onBack={prevStep}
                                  amount={finalTotal}
                                  baseAmount={baseTotal}
                                  paymentMethod={paymentMethod as 'credit' | 'debit' | 'pix' | 'boleto'}
                                  installments={installments}
                                  setInstallments={setInstallments}
                                  submitLabel={paymentMethod === 'pix' ? "Gerar QR Code Pix" : paymentMethod === 'boleto' ? "Gerar Boleto" : "Confirmar Pagamento"}
                                  clientSecret={clientSecret}
                                  billingDetails={{
                                    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Cliente",
                                    email: user?.email || "",
                                    phone: watch('phone'),
                                    address: {
                                      line1: `${watch('street')}, ${watch('number')}`,
                                      city: watch('city'),
                                      state: watch('state'),
                                      postal_code: watch('cep'),
                                      country: 'BR'
                                    }
                                  }}
                                />
                              </Elements>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-in fade-in">
                              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                              <p>Iniciando pagamento seguro...</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                }
              </form >
            </Form >
          </div >

          {/* Summary Sidebar */}
          < div className="lg:col-span-1" >
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-lg mb-4">Valores</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal ({items.length} itens)</span><span>R$ {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Entrega estimada</span><span>R$ {shipping.toFixed(2)}</span></div>

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
                      <span className="font-bold text-2xl text-primary">R$ {finalTotal.toFixed(2)}</span>
                      {paymentMethod === 'credit' && installments > 1 ? (
                        <p className="text-xs text-muted-foreground">
                          ou {installments}x de R$ {(finalTotal / installments).toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          ou até 12x de R$ {(baseTotal / 12).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Compra 100% segura e garantida</span>
              </div>

              {step === 1 && (
                <Button type="button" onClick={nextStep} className="btn-primary w-full mt-6">
                  Continuar para Pagamento
                </Button>
              )}
            </div>
          </div >
        </div >
      </main >
      <Footer />
    </div >
  );
};

export default Checkout;
