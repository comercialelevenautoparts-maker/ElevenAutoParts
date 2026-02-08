import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, MapPin, CreditCard, Package, QrCode, Barcode, FileText, Loader2, ShieldCheck, Truck, Wallet, Trash2, Plus, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useAddresses, useCreateAddress, useDeleteAddress } from '@/hooks/useAddresses';
import { useCoupon } from '@/hooks/useCoupons';
import { useCreateOrder } from '@/hooks/useOrders';
import { useShipping } from '@/hooks/useShipping';
import { Cupom, StatusPedido } from '@/types/database';
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
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado inválido').max(2, 'Use a sigla (ex: SP)'),

  // Step 2: Payment Method Selection
  paymentMethod: z.enum(['credit', 'debit', 'pix', 'boleto', 'card']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [stripeSubmitFn, setStripeSubmitFn] = useState<(() => Promise<void>) | null>(null);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: string;
    type: 'card' | 'boleto' | 'pix';
    boletoUrl?: string;
  } | null>(null);
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
      bairro: '',
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
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);

  const allShippingOptions = useMemo(() => shippingOptions.map(opt => ({
    id: String(opt.id),
    name: opt.name,
    description: `Entrega via ${opt.company.name} estimada em ${opt.delivery_time} dias`,
    price: Number(opt.custom_price),
    logo: opt.company.picture
  })), [shippingOptions]);

  const selectedShippingOption = allShippingOptions.find((s) => s.id === selectedShippingId);
  const shipping = selectedShippingOption ? selectedShippingOption.price : 0;

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.tipo === 'percentual') {
      couponDiscount = subtotal * (appliedCoupon.valor / 100);
    } else {
      couponDiscount = appliedCoupon.valor;
    }
  }

  const finalTotal = subtotal + shipping - couponDiscount;

  const steps = [
    { id: 1, name: 'Endereço', icon: MapPin },
    { id: 2, name: 'Pagamento', icon: CreditCard },
    { id: 3, name: 'Resumo', icon: Package },
  ];

  const { refetch: validateCoupon } = useCoupon(couponCode);

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

  const handleSearchCep = async (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, '');
    if (cep.length === 8) {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue('street', data.logradouro);
          setValue('bairro', data.bairro);
          setValue('city', data.localidade);
          setValue('state', data.uf);
          setValue('complement', data.complemento || '');
          toast.success('Endereço encontrado!');
          trigger(['street', 'bairro', 'city', 'state', 'complement']);
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



  useEffect(() => {
    const fetchPaymentIntent = async () => {
      if (step === 2 && finalTotal > 0 && !clientSecret) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const response = await fetch(`${apiUrl}/api/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: finalTotal,
              currency: 'brl',
              customerEmail: user?.email,
              metadata: {
                userId: user?.id,
                orderItems: items.length
              }
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Falha ao iniciar pagamento');
          }

          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (error: any) {
          console.error("Error creating payment intent:", error);
          toast.error(error.message || "Erro ao inicializar pagamento seguro.");
        }
      }
    };

    fetchPaymentIntent();
  }, [step, finalTotal, user, items.length, clientSecret]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof CheckoutFormValues)[] = [];
    if (step === 1) {
      if (selectedAddressId) {
        fieldsToValidate = ['phone']; // Only phone is needed if address is selected
      } else {
        fieldsToValidate = ['phone', 'cep', 'street', 'number', 'complement', 'bairro', 'city', 'state'];
      }

      if (allShippingOptions.length > 0 && !selectedShippingId) {
        toast.error("Selecione uma opção de frete.");
        return;
      }
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => prev - 1);
  };

  const { mutateAsync: createOrder } = useCreateOrder();
  const { mutateAsync: createAddress } = useCreateAddress();
  const { mutateAsync: deleteAddress } = useDeleteAddress();

  const handleCreateOrder = async (status: string, formaPagamento?: string) => {
    let addressId = selectedAddressId;

    if (!addressId) {
      const newAddr = await createAddress({
        cep: watch('cep').replace(/\D/g, ''),
        logradouro: watch('street'),
        numero: watch('number'),
        cidade: watch('city'),
        uf: watch('state'),
        bairro: watch('bairro') || 'Centro',
        complemento: watch('complement') || null,
        tipo: 'entrega',
        padrao: false
      });
      addressId = newAddr.id;
    }

    return await createOrder({
      endereco_id: addressId as string,
      valor_produtos: subtotal,
      valor_frete: shipping,
      valor_desconto: couponDiscount,
      valor_total: finalTotal,
      forma_pagamento: formaPagamento || paymentMethod,
      status: status as StatusPedido,
      itens: items.map(item => ({
        produto_id: item.id,
        nome_produto: item.name,
        quantidade: item.quantity,
        preco_unitario: Number(item.price),
        subtotal: Number(item.price * item.quantity),
        tamanho: item.size || null,
        metadata: item.metadata || null
      }))
    });
  };

  const appearance = useMemo(() => ({
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#F9B80E',
    },
  }), []);

  const stripeOptions = useMemo(() => ({
    clientSecret,
    appearance,
    locale: 'pt-BR' as const,
    paymentMethodCreation: 'manual' as const,
  }), [clientSecret, appearance]);

  const billingDetails = useMemo(() => ({
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Cliente",
    email: user?.email || "",
    phone: watch('phone') || "",
    address: {
      line1: `${watch('street')}, ${watch('number')}`,
      city: watch('city'),
      state: watch('state'),
      postal_code: watch('cep').replace(/\D/g, ''),
      country: 'BR'
    }
  }), [user, watch('phone'), watch('street'), watch('number'), watch('city'), watch('state'), watch('cep')]);

  const handlePaymentMethodChange = useCallback((type: string) => {
    setValue('paymentMethod', type as any);
  }, [setValue]);

  const handleCompleteChange = useCallback((complete: boolean) => {
    setIsPaymentComplete(complete);
  }, []);

  const handleRegisterSubmit = useCallback((fn: () => Promise<void>) => {
    setStripeSubmitFn(() => fn);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 md:mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-1.5 md:gap-2 ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center border-1.5 transition-all ${step >= s.id ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-muted'
                  }`}>
                  {step > s.id ? <Check className="w-3.5 h-3.5 md:w-5 md:h-5" /> : <s.icon className="w-3.5 h-3.5 md:w-5 md:h-5" />}
                </div>
                <span className="hidden md:block font-bold text-xs uppercase tracking-widest">{s.name}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 md:w-24 h-0.5 mx-1 md:mx-2 rounded-full transition-colors ${step > s.id ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 items-start">
          <div className="lg:col-span-2">
            <Form {...form}>
              <form>
                <div className="space-y-3.5 md:space-y-8">
                  {/* STEP 1: Address */}
                  {step === 1 && (
                    <div className="bg-card border border-border/100 rounded-xl p-3.5 md:p-6 shadow-sm animate-in fade-in slide-in-from-left-4">
                      <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 border-b border-border/40">
                        <MapPin className="text-primary w-4 h-4 md:w-6 md:h-6" />
                        <div>
                          <h2 className="text-base md:text-xl font-bold uppercase tracking-widest text-foreground/80">Entrega</h2>
                          <p className="text-muted-foreground text-[10px] md:text-sm font-medium uppercase tracking-tighter opacity-70">Onde devemos entregar seu pedido?</p>
                        </div>
                      </div>

                      {/* Saved Addresses List */}
                      {savedAddresses.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">Seus endereços salvos:</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {savedAddresses.map((addr) => (
                              <div
                                key={addr.id}
                                onClick={() => {
                                  if (selectedAddressId === addr.id) {
                                    setSelectedAddressId(null);
                                    setValue('cep', '');
                                    setValue('street', '');
                                    setValue('number', '');
                                    setValue('bairro', '');
                                    setValue('city', '');
                                    setValue('state', '');
                                    setSelectedShippingId(null);
                                  } else {
                                    setSelectedAddressId(addr.id);
                                    setValue('cep', addr.cep);
                                    setValue('street', addr.logradouro);
                                    setValue('number', addr.numero);
                                    setValue('bairro', addr.bairro);
                                    setValue('city', addr.cidade);
                                    setValue('state', addr.uf);
                                    calculateShipping(addr.cep, items);
                                    trigger(['phone']);
                                  }
                                }}
                                className={`group relative p-3 border rounded-xl cursor-pointer transition-all duration-300 ${selectedAddressId === addr.id
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                                  : 'border-border/60 hover:border-primary/30 hover:bg-muted/5'
                                  }`}
                              >
                                <div className="flex justify-between items-start mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[8px] md:text-[10px] uppercase px-1.5 py-0.5 bg-muted rounded text-muted-foreground tracking-widest">{addr.tipo}</span>
                                    {addr.padrao && <span className="text-[8px] md:text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest">Padrão</span>}
                                  </div>
                                  <div className="flex items-center justify-center min-w-[28px] min-h-[28px]">
                                    {selectedAddressId === addr.id ? (
                                      <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-sm border border-primary animate-in zoom-in-50 duration-200">
                                        <Check className="w-3.5 h-3.5" />
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          if (confirm('Tem certeza que deseja excluir este endereço?')) {
                                            try {
                                              await deleteAddress(addr.id);
                                              if (selectedAddressId === addr.id) {
                                                setSelectedAddressId(null);
                                              }
                                              toast.success('Endereço removido');
                                            } catch (error: any) {
                                              console.error('Erro ao deletar endereço:', error);
                                              toast.error('Não foi possível excluir o endereço no momento.');
                                            }
                                          }
                                        }}
                                        className="md:opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-600 rounded-full transition-all text-muted-foreground/60"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[11px] md:text-sm font-bold text-foreground leading-tight">{addr.logradouro}, {addr.numero}</p>
                                <p className="text-[9px] md:text-xs text-muted-foreground font-medium uppercase tracking-tighter">{addr.bairro} - {addr.cidade}/{addr.uf}</p>
                              </div>
                            ))}
                            <div
                              onClick={() => {
                                setSelectedAddressId(null);
                                form.reset({
                                  ...form.getValues(),
                                  cep: '', street: '', number: '', bairro: '', city: '', state: ''
                                });
                                setSelectedShippingId(null);
                              }}
                              className={`p-3 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1.5 hover:bg-primary/5 hover:border-primary transition-all duration-300 min-h-[80px] md:min-h-[100px] ${!selectedAddressId ? 'border-primary bg-primary/5 shadow-sm' : 'border-muted'
                                }`}
                            >
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Novo endereço</span>
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
                                <Input className="text-xs h-9" placeholder="(11) 99999-9999" {...field} onChange={(e) => field.onChange(formatPhone(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {!selectedAddressId && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
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
                                            className="text-xs h-9"
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
                                        <Input className="text-xs h-9" placeholder="Nome da rua" {...field} disabled={isLoadingAddress} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Número</FormLabel>
                                    <FormControl>
                                      <Input className="text-xs h-9" placeholder="123" {...field} />
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
                                      <Input className="text-xs h-9" placeholder="Apto 101, Bloco A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                              <div className="md:col-span-2">
                                <FormField
                                  control={form.control}
                                  name="bairro"
                                  render={({ field }) => (
                                    <FormItem>
                                      <h3 className="section-subtitle mb-2">Bairro</h3>
                                      <FormControl>
                                        <Input className="text-xs h-9" placeholder="Seu bairro" {...field} disabled={isLoadingAddress} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <FormField
                                  control={form.control}
                                  name="city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Cidade</FormLabel>
                                      <FormControl>
                                        <Input className="text-xs h-9" placeholder="Cidade" {...field} disabled={isLoadingAddress} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="md:col-span-1">
                                <FormField
                                  control={form.control}
                                  name="state"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Estado</FormLabel>
                                      <FormControl>
                                        <Input placeholder="SP" maxLength={2} className="uppercase text-xs h-9" {...field} disabled={isLoadingAddress} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {allShippingOptions.length > 0 && watch('cep').replace(/\D/g, '').length === 8 && (
                        <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-4">
                          <p className="text-[10px] md:text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest opacity-60 text-center md:text-left">Opções disponíveis:</p>
                          {allShippingOptions.map((option) => (
                            <div
                              key={option.id}
                              onClick={() => {
                                setSelectedShippingId(prev => prev === option.id ? null : option.id);
                              }}
                              className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${selectedShippingId === option.id
                                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                : 'border-border/50 hover:border-primary/20 bg-muted/5'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedShippingId === option.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                                  {selectedShippingId === option.id && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <div className="flex items-center gap-2.5">
                                  {option.logo && <img src={option.logo} alt={option.name} className="w-7 h-7 object-contain bg-white rounded-sm p-0.5" />}
                                  <div>
                                    <p className="text-[11px] md:text-sm font-bold uppercase tracking-tight leading-none mb-0.5">{option.name}</p>
                                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter leading-none">{option.description}</p>
                                  </div>
                                </div>
                              </div>
                              <span className="font-bold text-[11px] md:text-sm text-primary whitespace-nowrap">R$ {option.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEPS 2 & 3: Payment and Summary */}
                  {(step === 2 || step === 3) && (
                    <div className="flex flex-col">
                      {clientSecret && clientSecret.includes('_secret_') ? (
                        <Elements key="stable-stripe-provider" stripe={stripePromise} options={stripeOptions}>
                          <div className={step === 3 ? 'block' : 'hidden'}>
                            <div className="bg-card border border-border/100 rounded-xl p-3.5 md:p-6 shadow-sm animate-in fade-in slide-in-from-right-4">
                              <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 border-b border-border/100">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={prevStep}
                                    className="md:hidden p-1.5 -ml-1 text-primary hover:bg-primary/5 rounded-full transition-all"
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                  </button>
                                  <Package className="text-primary w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <div>
                                  <h2 className="text-base md:text-xl font-bold uppercase tracking-widest text-foreground/80">Produtos</h2>
                                  <p className="text-muted-foreground text-[10px] md:text-sm font-medium uppercase tracking-tighter opacity-70">Confira os itens antes de finalizar</p>
                                </div>
                              </div>

                              <div className="space-y-2.5 mb-6">
                                {items.map((item) => (
                                  <div key={item.id} className="flex gap-3 p-3 md:p-4 bg-muted/20 rounded-xl border border-border/30 items-center md:items-start relative">
                                    <img src={item.image} alt={item.name} className="w-14 h-14 md:w-20 md:h-20 object-contain rounded-lg bg-white p-1 border shadow-sm" />
                                    <div className="flex-1 space-y-0.5 min-w-0">
                                      <h4 className="font-bold text-[12px] md:text-base text-foreground leading-tight truncate">{item.name}</h4>
                                      {item.metadata?.veiculo && (
                                        <div className="text-[9px] md:text-xs space-y-1 mt-1">
                                          <div className="inline-block bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight">
                                            {item.metadata.veiculo.marca} {item.metadata.veiculo.modelo} ({item.metadata.veiculo.ano})
                                          </div>
                                          <div className="text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 items-center font-medium uppercase tracking-tighter">
                                            {item.metadata.veiculo.medidas && (
                                              <span className="flex items-center gap-1">
                                                {item.metadata.veiculo.medidas.motorista}" / {item.metadata.veiculo.medidas.passageiro}"
                                              </span>
                                            )}
                                            {item.metadata.veiculo.conector && (
                                              <span>Conector: {item.metadata.veiculo.conector}</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      <p className="text-[10px] md:text-sm text-foreground mt-1 font-medium">Qtd: <span className="font-bold">{item.quantity}</span></p>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                      <span className="font-bold text-xs md:text-lg text-primary tracking-tight">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="bg-muted/40 p-3 md:p-4 rounded-xl space-y-2.5 md:space-y-4 text-[11px] md:text-sm mb-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-muted-foreground font-bold uppercase tracking-tighter text-[9px] md:text-[10px]">Endereço de Entrega:</span>
                                  <span className="font-bold text-foreground text-[11px] md:text-sm leading-tight">
                                    {watch('street')}, {watch('number')}{watch('complement') ? ` - ${watch('complement')}` : ''}, {watch('bairro')} - {watch('city')}/{watch('state')}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center border-t border-border/50 pt-2">
                                  <span className="text-muted-foreground font-bold uppercase tracking-tighter text-[9px] md:text-[10px]">Forma de Pagamento:</span>
                                  <span className="font-bold text-foreground md:text-right capitalize">
                                    {paymentMethod === 'card' ? 'Cartão' : paymentMethod}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-start">
                                <Button type="button" variant="outline" onClick={prevStep} className="hidden md:flex w-40 h-10 border-primary text-primary hover:bg-primary/5 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                                  Voltar
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className={step === 2 ? 'block' : 'contents'}>
                            <div className={step === 2 ? 'bg-card border border-border/100 rounded-xl p-3.5 md:p-6 shadow-sm mb-4 md:mb-6' : 'h-0 overflow-hidden'}>
                              {step === 2 && (
                                <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 border-b border-border/100">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={prevStep}
                                      className="md:hidden p-1.5 -ml-1 text-primary hover:bg-primary/5 rounded-full transition-all"
                                    >
                                      <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <CreditCard className="text-primary w-4 h-4 md:w-6 md:h-6" />
                                  </div>
                                  <div>
                                    <h2 className="text-base md:text-xl font-bold uppercase tracking-widest text-foreground/80">Pagamento</h2>
                                    <p className="text-muted-foreground text-[10px] md:text-sm font-medium uppercase tracking-tighter opacity-70">Escolha como deseja pagar</p>
                                  </div>
                                </div>
                              )}

                              <StripePaymentForm
                                isSummaryStep={step === 3}
                                onNextStep={() => setStep(3)}
                                onSuccess={(orderId, data) => {
                                  setOrderSuccessData({ orderId, ...data });
                                }}
                                onBack={prevStep}
                                amount={finalTotal}
                                baseAmount={finalTotal}
                                paymentMethod={paymentMethod as any}
                                clientSecret={clientSecret}
                                onCreateOrder={handleCreateOrder}
                                onPaymentMethodChange={handlePaymentMethodChange}
                                onCompleteChange={handleCompleteChange}
                                onRegisterSubmit={handleRegisterSubmit}
                                billingDetails={billingDetails}
                              />

                            </div>
                          </div>
                        </Elements>
                      ) : (
                        <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm flex flex-col items-center justify-center py-10 md:py-12 text-muted-foreground text-center">
                          <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin mb-4 text-primary/50" />
                          <p className="text-xs md:text-sm font-medium">Iniciando ambiente seguro...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </div >

          <div className="lg:col-span-1">
            <div className="bg-card border border-border/100 rounded-xl p-5 md:p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-[10px] md:text-xs uppercase tracking-widest mb-5 flex items-center gap-2 text-foreground/70">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Resumo Financeiro
              </h3>
              <div className="space-y-3.5 text-[11px] md:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Subtotal ({items.length} itens)</span>
                  <span className="font-bold tracking-tight">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Entrega estimada</span>
                  <span className="font-bold tracking-tight">{watch('cep').replace(/\D/g, '').length === 8 ? `R$ ${shipping.toFixed(2)}` : '--'}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center text-primary font-bold animate-in slide-in-from-top-1">
                    <span className="uppercase text-[9px] tracking-widest">Cupom ({appliedCoupon.codigo})</span>
                    <span className="tracking-tight">- R$ {couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-border/40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Total do Pedido</span>
                    <span className="font-bold text-xl md:text-2xl text-primary tracking-tighter leading-none">R$ {finalTotal.toFixed(2)}</span>
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

              {step === 2 && (
                <div className="space-y-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => {
                      if (!isPaymentComplete) {
                        toast.error("Por favor, preencha todos os campos de pagamento.");
                        return;
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setStep(3);
                    }}
                    className="btn-primary w-full"
                  >
                    Revisar pedido
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6">
                  <Button
                    type="button"
                    onClick={() => {
                      if (stripeSubmitFn) {
                        stripeSubmitFn();
                      }
                    }}
                    className="btn-primary w-full"
                  >
                    Finalizar compra
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div >
      </main >

      {/* Success Modal Overlay */}
      {
        orderSuccessData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8 text-center animate-in zoom-in-95 duration-500">
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-500" />
                </div>
              </div>

              {orderSuccessData.type === 'boleto' ? (
                <>
                  <h3 className="text-xl md:text-2xl font-black text-foreground mb-2 uppercase tracking-tight">PEDIDO REALIZADO!</h3>
                  <p className="text-muted-foreground text-xs md:text-sm mb-6 md:mb-8">
                    Seu pedido foi registrado com sucesso. Efetue o pagamento do boleto para processarmos o envio.
                  </p>
                  <div className="flex flex-col gap-3">
                    {orderSuccessData.boletoUrl && (
                      <Button
                        className="w-full h-12 font-bold bg-primary hover:bg-primary/90 text-white transition-all transform hover:scale-[1.02] shadow-lg"
                        onClick={() => window.open(orderSuccessData.boletoUrl, '_blank')}
                      >
                        <FileText className="w-5 h-5 mr-2" /> Abrir boleto bancário
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full h-12 font-semibold border-border hover:bg-muted hover:text-primary text-muted-foreground transition-all"
                      onClick={() => {
                        clearCart();
                        navigate('/pedidos', { state: { tab: orderSuccessData.type === 'boleto' ? 'em_analise' : 'concluidos' } });
                      }}
                    >
                      <Package className="w-5 h-5 mr-2" /> Ver meus pedidos
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-6 uppercase tracking-widest bg-muted/30 py-2 rounded-lg font-medium">
                    O pagamento pode levar até 3 dias úteis para compensar.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-black text-foreground mb-2 uppercase tracking-tight">PAGAMENTO APROVADO!</h3>
                  <p className="text-muted-foreground text-xs md:text-sm mb-6 md:mb-8">
                    Obrigado por sua compra. Seu pedido foi processado com sucesso e logo será enviado.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button
                      className="w-full h-12 font-bold bg-green-600 hover:bg-green-700 text-white transition-all transform hover:scale-[1.02] shadow-lg"
                      onClick={() => {
                        clearCart();
                        navigate('/pedidos', { state: { tab: 'concluidos' } });
                      }}
                    >
                      <Package className="w-5 h-5 mr-2" /> VER MEUS PEDIDOS
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full font-medium text-muted-foreground"
                      onClick={() => {
                        clearCart();
                        window.location.href = '/';
                      }}
                    >
                      Voltar para a Loja
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }

      <Footer />
    </div >
  );
};

export default Checkout;
