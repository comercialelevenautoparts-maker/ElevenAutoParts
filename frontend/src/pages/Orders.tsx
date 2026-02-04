import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, Search, ChevronRight, MapPin, CreditCard, Calendar, Hash, ReceiptText, Truck, Tag, User, Mail, Phone, Fingerprint } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { useCart } from '@/hooks/useCart';
import { Input } from '@/components/ui/input';
import ProfileSidebar from '@/components/account/ProfileSidebar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const Orders = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'concluidos' | 'em_analise' | 'cancelados'>(location.state?.tab || 'concluidos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const { user, profile } = useAuth();
  const { data: orders, isLoading } = useOrders();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyAgain = (order: any) => {
    order.pedido_itens?.forEach((item: any) => {
      addToCart({
        id: item.produto_id,
        name: item.nome_produto,
        price: item.preco_unitario,
        image: item.produto?.imagem_principal || "/placeholder.svg",
        size: item.tamanho,
        metadata: item.metadata
      }, item.quantidade);
    });
    toast.success('Itens adicionados ao carrinho!');
    navigate('/carrinho');
  };

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
    const matchesSearch = order.numero_pedido.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'concluidos') return order.status === 'pago' || order.status === 'entregue';
    if (activeTab === 'em_analise') return order.status === 'pendente' || order.status === 'enviado';
    if (activeTab === 'cancelados') return order.status === 'cancelado';
    return true;
  });

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatCPF = (cpf?: string) => {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pago':
      case 'entregue':
        return "bg-emerald-600 text-white border-transparent";
      case 'pendente':
      case 'enviado':
        return "bg-[#DFB956] text-white border-transparent shadow-[0_2px_10px_-3px_rgba(223,185,86,0.3)]";
      case 'cancelado':
        return "bg-rose-600 text-white border-transparent";
      default:
        return "bg-slate-600 text-white border-transparent";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'entregue': return 'Entregue';
      case 'pendente': return 'Pendente';
      case 'enviado': return 'Enviado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6 md:mb-8">Meus pedidos</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <ProfileSidebar />

          <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="grid grid-cols-3 md:flex w-full md:w-auto gap-1.5 md:gap-2 mb-2 md:mb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-1 md:px-3 py-2.5 md:py-1.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-tighter md:tracking-widest ${activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="text"
                  placeholder="Procurar por ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full md:w-64 h-10 md:h-9 text-sm rounded-xl"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 md:p-6 animate-pulse">
                    <div className="h-4 bg-muted/20 rounded w-1/4 mb-2" />
                    <div className="h-4 bg-muted/20 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredOrders?.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center shadow-sm">
                <Package className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">Nenhum pedido encontrado</h2>
                <p className="text-muted-foreground text-xs md:text-sm max-w-xs mx-auto mb-6">
                  {searchQuery ? `Não encontramos nenhum pedido com o ID "${searchQuery}"` : 'Você ainda não possui pedidos nesta categoria.'}
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary text-[10px] md:text-sm font-bold uppercase tracking-widest hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ID do pedido</th>
                        <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data</th>
                        <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preço</th>
                        <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="p-4 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders?.map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="group hover:bg-muted/20 cursor-pointer transition-colors"
                        >
                          <td className="p-4 text-sm font-bold text-foreground">
                            {order.numero_pedido}
                          </td>
                          <td className="p-4 text-xs text-muted-foreground font-medium">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4 text-sm font-bold text-foreground/90">
                            R$ {order.valor_total.toFixed(2)}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${getStatusStyle(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Ver Detalhes</span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {filteredOrders?.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-card border border-border rounded-xl p-4 shadow-sm active:scale-[0.98] transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[10px] font-black text-foreground uppercase tracking-tighter mb-0.5">#{order.numero_pedido.startsWith('#') ? order.numero_pedido.substring(1) : order.numero_pedido}</p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none ${getStatusStyle(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-black text-lg text-foreground">R$ {order.valor_total.toFixed(2)}</p>
                        <div className="flex items-center gap-1 text-primary font-black text-[10px] uppercase tracking-widest">
                          Detalhes
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Order Details Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="sm:max-w-md w-full p-0 flex flex-col gap-0 border-l overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader className="p-4 md:p-6 border-b bg-muted/5 text-left">
                <div className="flex items-center gap-1.5 text-primary mb-0.5 md:mb-1">
                  <Hash className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[9px] md:text-xs font-bold uppercase tracking-tighter">Detalhes do Pedido</span>
                </div>
                <SheetTitle className="text-lg md:text-2xl font-bold">{selectedOrder.numero_pedido.startsWith('#') ? selectedOrder.numero_pedido : `#${selectedOrder.numero_pedido}`}</SheetTitle>
                <SheetDescription className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium">
                  <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" /> Realizado em {new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedOrder.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8">
                {/* Status Section */}
                <div>
                  <h4 className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                    <Package className="w-2.5 h-2.5 md:w-3 md:h-3" /> Status do Pedido
                  </h4>
                  <Badge className={`text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1.5 md:px-4 md:py-2 rounded-md border shadow-sm ${getStatusStyle(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>

                {/* Items Section */}
                <div>
                  <h4 className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                    <ReceiptText className="w-2.5 h-2.5 md:w-3 md:h-3" /> Itens do Pedido ({selectedOrder.pedido_itens?.length})
                  </h4>
                  <div className="space-y-3 md:space-y-4">
                    {selectedOrder.pedido_itens?.map((item: any) => (
                      <div key={item.id} className="flex gap-3 md:gap-4 group items-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border group-hover:border-primary/50 transition-colors">
                          <img
                            src={item.produto?.imagem_principal || "/placeholder.svg"}
                            alt={item.nome_produto}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] md:text-sm font-bold text-foreground line-clamp-1">{item.nome_produto}</p>
                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5">
                            <span>Qtd: {item.quantity || item.quantidade}</span>
                            {(item.metadata?.veiculo || item.tamanho) && (
                              <>
                                <Separator orientation="vertical" className="h-2.5" />
                                <span className="truncate">
                                  {item.metadata?.veiculo ? `${item.metadata.veiculo.marca} ${item.metadata.veiculo.modelo}` : item.tamanho}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-[10px] md:text-xs font-bold text-primary mt-0.5">R$ {item.preco_unitario.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border/100" />

                {/* Customer Section */}
                <div>
                  <h4 className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                    <User className="w-2.5 h-2.5 md:w-3 md:h-3" /> Informações do Cliente
                  </h4>
                  <div className="p-3 md:p-4 bg-muted/30 rounded-xl border border-border/100 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-background border border-border flex items-center justify-center">
                        <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Nome Completo</p>
                        <p className="text-xs md:text-sm font-bold text-foreground">
                          {profile?.nome} {profile?.sobrenome}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-background border border-border flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">E-mail</p>
                        <p className="text-xs md:text-sm font-bold text-foreground truncate max-w-[180px] md:max-w-none">{profile?.email || user?.email}</p>
                      </div>
                    </div>
                    {(profile?.telefone || user?.user_metadata?.telefone) && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-background border border-border flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Telefone</p>
                          <p className="text-xs md:text-sm font-bold text-foreground">{formatPhone(profile?.telefone || user?.user_metadata?.telefone)}</p>
                        </div>
                      </div>
                    )}
                    {(profile?.cpf || user?.user_metadata?.cpf) && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-background border border-border flex items-center justify-center">
                          <Fingerprint className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">CPF</p>
                          <p className="text-xs md:text-sm font-bold text-foreground font-mono">{formatCPF(profile?.cpf || user?.user_metadata?.cpf)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h4 className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                    <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3" /> Endereço de Entrega
                  </h4>
                  {selectedOrder.endereco ? (
                    <div className="p-3 md:p-4 bg-muted/30 rounded-xl border border-border/100">
                      <p className="text-xs md:text-sm font-bold text-foreground mb-0.5 md:mb-1">{selectedOrder.endereco.logradouro}, {selectedOrder.endereco.numero}</p>
                      {selectedOrder.endereco.complemento && (
                        <p className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 md:mb-1">{selectedOrder.endereco.complemento}</p>
                      )}
                      <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                        {selectedOrder.endereco.bairro} • {selectedOrder.endereco.cidade}/{selectedOrder.endereco.uf}
                      </p>
                      <p className="text-[9px] md:text-[10px] font-bold text-primary mt-1 md:mt-2">CEP: {selectedOrder.endereco.cep}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] md:text-xs text-muted-foreground italic">Endereço não disponível</p>
                  )}
                </div>

                {/* Shipping Details Section */}
                <div>
                  <h4 className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                    <Truck className="w-2.5 h-2.5 md:w-3 md:h-3" /> Dados de Frete
                  </h4>
                  <div className="p-3 md:p-4 bg-muted/30 rounded-xl border border-border/100 space-y-2 md:space-y-3">
                    <div className="flex justify-between items-center text-[10px] md:text-xs">
                      <span className="text-muted-foreground font-medium">Serviço de Entrega</span>
                      <span className="font-bold text-foreground">{selectedOrder.metodo_envio || 'Correios / Transportadora'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] md:text-xs">
                      <span className="text-muted-foreground font-medium">Valor do Frete</span>
                      <span className="font-bold text-foreground">
                        {selectedOrder.valor_frete > 0 ? `R$ ${selectedOrder.valor_frete.toFixed(2)}` : 'Grátis'}
                      </span>
                    </div>
                    <div className="pt-1.5 md:pt-2 border-t border-border/50">
                      <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mb-0.5 md:mb-1">Código de Rastreio</p>
                      <div className="flex items-center gap-2">
                        {selectedOrder.codigo_rastreio ? (
                          <>
                            <p className="text-xs md:text-sm font-mono font-bold text-primary">{selectedOrder.codigo_rastreio}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedOrder.codigo_rastreio);
                                toast.success('Código copiado!');
                              }}
                              className="p-1 hover:bg-primary/10 rounded transition-colors"
                            >
                              <Search className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                            </button>
                          </>
                        ) : (
                          <p className="text-[10px] md:text-xs text-muted-foreground italic">Aguardando postagem do pedido</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                    <CreditCard className="w-2.5 h-2.5 md:w-3 md:h-3" /> Pagamento
                  </h4>
                  <div className="flex items-center gap-2.5 p-3 md:p-4 bg-muted/20 border-border/100 rounded-xl border">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold uppercase text-foreground leading-tight">
                        {(() => {
                          const type = selectedOrder.forma_pagamento?.toLowerCase();
                          const status = selectedOrder.status?.toLowerCase();

                          // Automatic identification logic
                          if (type === 'boleto' || type === 'bolbradesco') return 'Boleto Bancário';

                          // Failsafe: If status is pending and type is 'credit', it's likely a default value for a Boleto
                          if (status === 'pendente' && (type === 'credit' || !type)) return 'Boleto Bancário';

                          if (type === 'card' || type === 'credit' || type === 'debit' || type === 'visa' || type === 'mastercard') return 'Cartão de Crédito/Débito';
                          if (type === 'pix') return 'PIX';
                          if (type === 'stripe') return 'Cartão de Crédito';

                          if (type) {
                            return type.charAt(0).toUpperCase() + type.slice(1);
                          }

                          return 'Cartão de Crédito';
                        })()}
                      </p>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground font-medium">Processado via ambiente seguro</p>
                    </div>
                  </div>
                </div>

                {/* Values Summary */}
                <div className="bg-[#DFB956]/5 p-4 md:p-6 rounded-2xl border border-[#DFB956]/20 space-y-2 md:space-y-3">
                  <div className="flex justify-between text-[10px] md:text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5 md:gap-2"><Tag className="w-2.5 h-2.5 md:w-3 md:h-3" /> Subtotal</span>
                    <span>R$ {selectedOrder.valor_produtos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] md:text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5 md:gap-2"><Truck className="w-2.5 h-2.5 md:w-3 md:h-3" /> Frete</span>
                    <span>{selectedOrder.valor_frete > 0 ? `R$ ${selectedOrder.valor_frete.toFixed(2)}` : 'Grátis'}</span>
                  </div>
                  {selectedOrder.valor_desconto > 0 && (
                    <div className="flex justify-between text-[10px] md:text-xs font-semibold text-emerald-600">
                      <span>Desconto</span>
                      <span>- R$ {selectedOrder.valor_desconto.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="bg-[#DFB956]/20" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs md:text-sm font-bold text-foreground uppercase tracking-tight">Total</span>
                    <span className="text-base md:text-lg font-bold text-primary">R$ {selectedOrder.valor_total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t bg-muted/5 space-y-2 md:space-y-3">
                {(selectedOrder.status === 'entregue' || selectedOrder.status === 'pago') && (
                  <button
                    onClick={() => handleBuyAgain(selectedOrder)}
                    className="w-full py-2.5 md:py-3 h-11 md:h-12 bg-[#DFB956] text-white font-bold text-[10px] md:text-xs uppercase tracking-widest rounded-xl hover:bg-[#DFB956]/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5 md:w-4 md:h-4" /> Comprar Novamente
                  </button>
                )}
                {selectedOrder.status === 'cancelado' && (
                  <button
                    onClick={() => handleBuyAgain(selectedOrder)}
                    className="w-full py-2.5 md:py-3 h-11 md:h-12 bg-primary text-white font-bold text-[10px] md:text-xs uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5 md:w-4 md:h-4" /> Tentar Novamente
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className={`w-full py-2.5 md:py-3 h-11 md:h-12 font-bold text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 ${(selectedOrder.status === 'entregue' || selectedOrder.status === 'pago' || selectedOrder.status === 'cancelado')
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                    : 'bg-primary text-white shadow-md hover:bg-primary/90'
                    }`}
                >
                  Fechar Resumo
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
};
export default Orders;
