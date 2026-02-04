import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, Truck, ChevronRight, AlertCircle, Check, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { useShipping, ShippingOption } from '@/hooks/useShipping';
import { toast } from 'sonner';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart();
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [returnOldDevice, setReturnOldDevice] = useState(false);
  const [cep, setCep] = useState('');
  const { calculateShipping, isLoading: isCalculating, options: dynamicOptions } = useShipping();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();

  // Combine static fallback with dynamic options
  const allShippingOptions = dynamicOptions.length > 0
    ? dynamicOptions.map(opt => ({
      id: `dynamic-${opt.id}`,
      name: opt.name,
      description: `Entrega via ${opt.company.name} estimada em ${opt.delivery_time} dias`,
      price: Number(opt.custom_price),
      logo: opt.company.picture
    }))
    : [];

  const selectedOption = allShippingOptions.find((s) => s.id === selectedShipping);
  const shippingPrice = selectedOption?.price || 0;
  // Previously there was a 10% discount here. Now we removed it as per request.
  // Discount will be applied in checkout if Pix is selected (future implementation in Checkout.tsx).
  const total = subtotal + shippingPrice;

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 md:py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-muted/40 border border-border/50 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6">
              <Truck className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/60" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-4">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground text-xs md:text-sm mb-6 md:mb-8">
              Adicione produtos ao seu carrinho para continuar comprando.
            </p>
            <Link to="/produtos" className="btn-primary inline-flex items-center gap-2 px-8 h-10 md:h-12 text-[10px] md:text-sm font-bold uppercase tracking-widest">
              Ver Produtos <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-bold text-primary mb-8 text-[clamp(1.5rem,5vw,1.875rem)]">Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="bg-card border border-border/50 rounded-xl p-3 md:p-6 shadow-sm">
                <div className="flex gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 md:w-28 md:h-28 object-contain bg-muted/40 rounded-lg"
                    />
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[9px] text-primary font-bold uppercase tracking-widest opacity-70">Palheta</p>
                        <h3 className="font-bold text-foreground leading-tight text-[13px] md:text-lg truncate">{item.name}</h3>

                        {item.metadata?.veiculo && (
                          <div className="flex flex-col gap-1 mt-1.5">
                            <div className="inline-flex items-center px-1.5 py-0.5 bg-primary/5 text-primary rounded text-[9px] font-bold uppercase tracking-tight border border-primary/10 w-fit">
                              PARA: {item.metadata.veiculo.marca} {item.metadata.veiculo.modelo} ({item.metadata.veiculo.ano})
                            </div>
                            <div className="text-[9px] md:text-[10px] text-muted-foreground font-medium flex flex-wrap items-center gap-x-2 gap-y-0.5 uppercase tracking-tighter">
                              <span>Medidas: {item.metadata.veiculo.medidas?.motorista}" / {item.metadata.veiculo.medidas?.passageiro}"</span>
                              <span className="hidden md:inline px-1">|</span>
                              <span>Conector: {item.metadata.veiculo.conector}</span>
                            </div>
                          </div>
                        )}

                        <div className="mt-2 md:mt-3">
                          <span className="text-primary font-bold text-sm md:text-xl">R$ {item.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.size, item.metadata)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-5 md:h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 md:pt-4">
                      <div className="flex items-center bg-muted/30 rounded-lg border border-border/40 p-0.5 group">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.metadata)}
                          className="w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center hover:bg-background transition-all text-primary active:scale-95"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 md:w-10 text-center font-bold text-xs md:text-base">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.metadata)}
                          className="w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center hover:bg-background transition-all text-primary active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Shipping Calculation */}
            <div className="bg-card border border-border/50 rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-[11px] md:text-base uppercase tracking-widest text-foreground/70">Frete e Entrega</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="flex-1 bg-muted/20 border border-border/50 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <Button
                  onClick={() => calculateShipping(cep, items)}
                  disabled={isCalculating || cep.length < 8}
                  className="btn-primary h-10 md:h-auto font-bold text-[10px] uppercase tracking-widest px-6"
                >
                  {isCalculating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
                  Calcular
                </Button>
              </div>

              {allShippingOptions.length > 0 && (
                <div className="mt-5 space-y-2 animate-in fade-in slide-in-from-top-3">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 opacity-60">Selecione uma opção:</p>
                  {allShippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${selectedShipping === option.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/40 hover:border-primary/20 bg-muted/5'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping === option.id}
                          onChange={(e) => setSelectedShipping(e.target.value)}
                          className="w-3.5 h-3.5 accent-primary"
                        />
                        <div className="flex items-center gap-2.5">
                          {option.logo && <img src={option.logo} alt={option.name} className="w-7 h-7 object-contain rounded bg-white p-0.5" />}
                          <div>
                            <p className="text-[11px] md:text-sm font-bold uppercase tracking-tight leading-none mb-0.5">{option.name}</p>
                            <p className="text-[9px] text-muted-foreground font-medium leading-none">{option.description}</p>
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-primary text-xs md:text-base">R$ {option.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-xl p-5 md:p-6 sticky top-24 shadow-sm">
              <h2 className="font-bold text-[11px] md:text-base uppercase tracking-widest mb-6 text-foreground/70 border-b border-border/30 pb-3">Resumo</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Subtotal</span>
                  <span className="font-bold text-foreground">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Entrega</span>
                  <span className="font-bold text-foreground">{shippingPrice > 0 ? `R$ ${shippingPrice.toFixed(2)}` : 'A calcular'}</span>
                </div>

                <div className="border-t border-border/30 pt-4 flex justify-between items-center">
                  <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Total</span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-xl md:text-2xl text-primary tracking-tight leading-none">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="btn-primary w-full h-11 md:h-14 font-bold uppercase tracking-widest text-[11px] md:text-sm shadow-md shadow-primary/10 transition-all mb-6"
              >
                Finalizar Compra
              </Button>

              <div className="space-y-2 pt-2">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[9px] md:text-xs text-muted-foreground/70 font-bold uppercase tracking-tight">
                    <div className="w-3.5 h-3.5 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-2 h-2" />
                    </div>
                    Frete grátis +R$ 150
                  </li>
                  <li className="flex items-center gap-2 text-[9px] md:text-xs text-muted-foreground/70 font-bold uppercase tracking-tight">
                    <div className="w-3.5 h-3.5 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-2 h-2" />
                    </div>
                    Devolução em 30 dias
                  </li>
                  <li className="flex items-center gap-2 text-[9px] md:text-xs text-muted-foreground/70 font-bold uppercase tracking-tight">
                    <div className="w-3.5 h-3.5 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-2 h-2" />
                    </div>
                    Suporte VIP 24/7
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
