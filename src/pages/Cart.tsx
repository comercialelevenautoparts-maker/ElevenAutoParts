import  React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, Truck, ChevronRight, Check, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { useShipping } from '@/hooks/useShipping';

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
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground mb-8">
              Adicione produtos ao seu carrinho para continuar comprando.
            </p>
            <Link to="/produtos" className="btn-primary inline-flex items-center gap-2">
              Ver Produtos <ChevronRight className="w-4 h-4" />
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
        <h1 className="text-3xl font-bold text-primary mb-8">Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-xl p-6">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-contain bg-muted rounded-lg"
                  />
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Palheta</p>
                        <h3 className="font-bold text-foreground text-lg leading-tight">{item.name}</h3>

                        {item.metadata?.veiculo && (
                          <div className="flex flex-col gap-1.5 mt-2">
                            <div className="inline-flex items-center px-2 py-0.5 bg-primary/20 text-[#B8860B] rounded text-[10px] font-bold uppercase tracking-wider w-fit border border-primary/30">
                              PARA: {item.metadata.veiculo.marca} {item.metadata.veiculo.modelo} ({item.metadata.veiculo.ano})
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                              <span>Medidas: {item.metadata.veiculo.medidas?.motorista}" / {item.metadata.veiculo.medidas?.passageiro}"</span>
                              <span className="text-primary">+</span>
                              <span>Conector: {item.metadata.veiculo.conector}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-primary font-bold text-lg">R$ {item.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-primary hover:text-destructive transition-colors p-1"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center bg-muted/30 rounded-lg border border-border p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded flex items-center justify-center hover:bg-background transition-colors text-primary"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded flex items-center justify-center hover:bg-background transition-colors text-primary"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Shipping Calculation */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Calcular frete e entrega</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  onClick={() => calculateShipping(cep, items)}
                  disabled={isCalculating || cep.length < 8}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  {isCalculating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Calcular
                </Button>
              </div>

              {allShippingOptions.length > 0 && (
                <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Opções disponíveis:</p>
                  {allShippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${selectedShipping === option.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/30'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping === option.id}
                          onChange={(e) => setSelectedShipping(e.target.value)}
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
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo de envio</span>
                  <span>R$ {shippingPrice.toFixed(2)}</span>
                </div>
                {/* Discount removed from display */}

                <div className="border-t border-border pt-4 flex justify-between items-end">
                  <span className="font-bold text-lg">Total</span>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-2xl text-primary">R$ {total.toFixed(2)}</span>
                    <span className="text-[10px] text-green-600 font-medium">10% OFF no Pix</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>Sua pontuação do pedido</span>
                <span className="text-primary font-bold">+72 🏆</span>
              </div>

              <Button
                onClick={handleCheckout}
                className="btn-primary w-full mb-4"
              >
                Continuar a compra
              </Button>

              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> Frete grátis para todos os pedidos acima de R$ 150
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> Devoluções em até 30 dias para troca de produto
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> Custo em pedido antecipado
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> Suporte 24 horas por dia, 7 dias por semana
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
