import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MapPin, CreditCard, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<string | null>('visa');
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const shipping = 29.99;
  const discount = subtotal * 0.1;
  const total = subtotal + shipping - discount;

  const steps = [
    { id: 1, name: 'Endereço', icon: MapPin },
    { id: 2, name: 'Pagamento', icon: CreditCard },
    { id: 3, name: 'Resumo da compra', icon: Package },
  ];

  const handleFinish = () => {
    clearCart();
    navigate('/pedidos');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= s.id ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'
                }`}>
                  {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className="hidden md:block font-medium">{s.name}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 md:w-24 h-0.5 mx-2 ${step > s.id ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Detalhes da entrega</h2>
                <p className="text-muted-foreground mb-6">Endereço de entrega e cobrança</p>
                <div className="space-y-4">
                  <div>
                    <Label>Número de telefone</Label>
                    <Input placeholder="+55 11 99999-9999" />
                  </div>
                  <div>
                    <Label>CEP</Label>
                    <Input placeholder="00000-000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Rua</Label>
                      <Input placeholder="Nome da rua" />
                    </div>
                    <div>
                      <Label>Número</Label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cidade</Label>
                      <Input placeholder="Sua cidade" />
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <Input placeholder="SP" />
                    </div>
                  </div>
                </div>
                <Button onClick={() => setStep(2)} className="btn-primary mt-6">Continuar</Button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Método de pagamento</h2>
                <p className="text-muted-foreground mb-6">Seus últimos métodos de compra</p>
                <div className="space-y-3">
                  {['visa', 'master'].map((card) => (
                    <label
                      key={card}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
                        selectedPayment === card ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value={card}
                          checked={selectedPayment === card}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="accent-primary"
                        />
                        <span className="font-medium">{card === 'visa' ? 'VISA card' : 'Master card'}</span>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{card.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                  <Button onClick={() => setStep(3)} className="btn-primary">Continuar</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Resumo do pedido</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded" />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <span className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                  <Button onClick={handleFinish} className="btn-primary">Finalizar Pedido</Button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit">
            <div className="space-y-4">
              <div className="flex justify-between"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Custo de envio</span><span>R$ {shipping.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Desconto</span><span className="text-green-600">(10%)</span></div>
              <div className="border-t pt-4 flex justify-between font-bold">
                <span>Total</span><span>R$ {total.toFixed(2)}</span>
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
