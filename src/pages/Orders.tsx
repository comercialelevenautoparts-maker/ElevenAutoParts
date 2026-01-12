import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Input } from '@/components/ui/input';
import ProfileSidebar from '@/components/account/ProfileSidebar';

const Orders = () => {
  const [activeTab, setActiveTab] = useState<'concluidos' | 'em_analise' | 'cancelados'>('concluidos');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const tabs = [
    { id: 'concluidos', label: 'Concluídos' },
    { id: 'em_analise', label: 'Em análise' },
    { id: 'cancelados', label: 'Cancelados' },
  ];

  const filteredOrders = orders?.filter((order) => {
    if (activeTab === 'concluidos') return order.status === 'pago' || order.status === 'entregue';
    if (activeTab === 'em_analise') return order.status === 'pendente' || order.status === 'enviado';
    if (activeTab === 'cancelados') return order.status === 'cancelado';
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Meus pedidos</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <ProfileSidebar />

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Procurar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full md:w-64"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-muted rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/4 mb-2" />
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredOrders?.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum pedido encontrado</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">ID do pedido</th>
                      <th className="text-left p-4 font-medium">Data</th>
                      <th className="text-left p-4 font-medium">Preço</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders?.map((order) => (
                      <tr key={order.id} className="border-t border-border hover:bg-muted/50">
                        <td className="p-4 font-medium">{order.numero_pedido}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4">R$ {order.valor_total.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${order.status === 'pago' ? 'bg-green-100 text-green-700' :
                              order.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
