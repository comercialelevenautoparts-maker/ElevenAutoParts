import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, Truck, ChevronRight, AlertCircle, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart();
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [returnOldDevice, setReturnOldDevice] = useState(false);
  const navigate = useNavigate();

  const shippingOptions = [
    { id: 'basico', name: 'Básico', description: 'Entre 3 e 5 dias úteis', price: 25.00 },
    { id: 'garantia', name: 'Garantia', description: 'Entre 1 e 2 semanas', price: 49.00 },
    { id: 'premium', name: 'Premium', description: '1 dia útil', price: 89.00 },
  ];

  const subtotal = getTotalPrice();
  const shippingPrice = shippingOptions.find((s) => s.id === selectedShipping)?.price || 0;
  const discount = subtotal * 0.1; // 10% discount
  const total = subtotal + shippingPrice - discount;

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
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Palheta</p>
                        <h3 className="font-semibold">{item.name}</h3>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-primary hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-muted-foreground line-through text-sm">
                        R$ {(item.price * 1.2).toFixed(2)}
                      </span>
                      <span className="text-primary font-bold">R$ {item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Entrega em domicílio
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Return Old Device */}
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <AlertCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Deseja devolver seu aparelho antigo?</span>
                <input
                  type="checkbox"
                  checked={returnOldDevice}
                  onChange={(e) => setReturnOldDevice(e.target.checked)}
                  className="ml-auto"
                />
              </label>
            </div>

            {/* Shipping Options */}
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="font-medium mb-4">Selecione o seu método de envio</p>
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedShipping === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
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
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <span className="font-bold">R$ {option.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor do desconto</span>
                  <span className="text-green-600">(10%)</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl">R$ {total.toFixed(2)}</span>
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
