import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Copy, Check, Plus, Trash2, Calendar, Tag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfileSidebar from '@/components/account/ProfileSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cupom } from '@/types/database';

const MyCoupons = () => {
    const { user, isAdmin } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form states for creating coupon
    const [newCoupon, setNewCoupon] = useState({
        codigo: '',
        tipo: 'percentual',
        valor: '',
        quantidade_total: '',
        data_validade: ''
    });

    // Fetch coupons from Supabase
    const { data: coupons = [], isLoading } = useQuery({
        queryKey: ['coupons', isAdmin],
        queryFn: async () => {
            if (!user) return [];
            let query = supabase.from('cupons').select('*').order('created_at', { ascending: false });

            // If user is NOT admin, show only active and non-expired coupons
            if (!isAdmin) {
                query = query
                    .eq('ativo', true)
                    .gt('data_fim', new Date().toISOString());
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Cupom[];
        },
        enabled: !!user
    });

    // Create Coupon Mutation
    const createCouponMutation = useMutation({
        mutationFn: async (novoCupom: any) => {
            const { data, error } = await supabase.from('cupons').insert([{
                codigo: novoCupom.codigo.toUpperCase(),
                tipo: novoCupom.tipo,
                valor: parseFloat(novoCupom.valor),
                quantidade_total: novoCupom.quantidade_total ? parseInt(novoCupom.quantidade_total) : null,
                quantidade_usada: 0,
                data_inicio: new Date().toISOString(),
                data_fim: new Date(novoCupom.data_validade).toISOString(),
                ativo: true
            }]).select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            toast({ title: "Sucesso!", description: "Cupom criado com sucesso." });
            setIsCreateOpen(false);
            setNewCoupon({ codigo: '', tipo: 'percentual', valor: '', quantidade_total: '', data_validade: '' });
        },
        onError: (error: any) => {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    });

    // Delete Coupon Mutation (Hard delete as requested)
    const deleteCouponMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('cupons').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            toast({ title: "Removido", description: "Cupom excluído permanentemente." });
        },
        onError: (error: any) => {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    });


    const handleCreateCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoupon.codigo || !newCoupon.valor || !newCoupon.data_validade) {
            toast({ title: "Atenção", description: "Preencha os campos obrigatórios.", variant: "destructive" });
            return;
        }
        createCouponMutation.mutate(newCoupon);
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast({
            title: "Código copiado!",
            description: `Cupom ${code} copiado para a área de transferência.`,
        });
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-6 md:py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary">Meus cupons</h1>

                    {isAdmin && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="btn-primary gap-2 shadow-lg hover:translate-y-[-2px] transition-all">
                                    <Plus className="w-4 h-4" /> Criar novo cupom
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Criar novo cupom</DialogTitle>
                                    <DialogDescription>
                                        Preencha as informações abaixo para gerar um novo código promocional.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateCoupon} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Código do Cupom</Label>
                                        <Input
                                            id="code"
                                            placeholder="Ex: VERAO10"
                                            className="uppercase font-bold tracking-wider"
                                            value={newCoupon.codigo}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, codigo: e.target.value.toUpperCase() })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Tipo de Desconto</Label>
                                            <Select
                                                value={newCoupon.tipo}
                                                onValueChange={(val) => setNewCoupon({ ...newCoupon, tipo: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentual">Porcentagem (%)</SelectItem>
                                                    <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Valor do Desconto</Label>
                                            <Input
                                                type="number"
                                                placeholder={newCoupon.tipo === 'percentual' ? "10" : "50.00"}
                                                value={newCoupon.valor}
                                                onChange={(e) => setNewCoupon({ ...newCoupon, valor: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Validade Até</Label>
                                            <Input
                                                type="date"
                                                value={newCoupon.data_validade}
                                                onChange={(e) => setNewCoupon({ ...newCoupon, data_validade: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Limite de Uso (Opcional)</Label>
                                            <Input
                                                type="number"
                                                placeholder="Ilimitado"
                                                value={newCoupon.quantidade_total}
                                                onChange={(e) => setNewCoupon({ ...newCoupon, quantidade_total: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full btn-primary font-bold mt-4" disabled={createCouponMutation.isPending}>
                                        {createCouponMutation.isPending ? "Criando..." : "Criar Cupom"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <ProfileSidebar />

                    {/* Content */}
                    <div className="lg:col-span-3 space-y-6">

                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 md:p-6 border border-primary/20 shadow-sm">
                            <div className="flex items-center md:items-start gap-3 md:gap-4">
                                <div className="p-2.5 md:p-3 bg-primary/20 rounded-full text-primary flex-shrink-0">
                                    <Ticket className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-xl font-black text-primary uppercase tracking-tight md:mb-1">Central de Descontos</h2>
                                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                                        {isAdmin
                                            ? "Gerencie os cupons da loja. Crie e remova promoções ativas."
                                            : "Aproveite cupons disponíveis para economizar em suas compras!"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="py-20 text-center text-muted-foreground">Carregando cupons...</div>
                        ) : coupons.length === 0 ? (
                            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed animate-in fade-in">
                                <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium text-foreground">Nenhum cupom ativo no momento</h3>
                                <p className="text-muted-foreground mt-1">
                                    {isAdmin ? "Crie seu primeiro cupom clicando no botão acima." : "Fique atento ao seu e-mail para receber novas ofertas!"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
                                {coupons.map((coupon) => (
                                    <div key={coupon.id} className="relative group">
                                        <div className="absolute inset-0 bg-primary/5 transform rotate-1 rounded-2xl transition-transform group-hover:rotate-2 group-hover:scale-[1.02]"></div>
                                        <div className="relative bg-card border border-border/60 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between overflow-hidden">

                                            {/* Decorative Circles simulating ticket holes */}
                                            <div className="absolute -left-3 top-[50%] -translate-y-1/2 w-6 h-6 bg-background rounded-full border-r border-border/60 z-10 hidden md:block"></div>
                                            <div className="absolute -right-3 top-[50%] -translate-y-1/2 w-6 h-6 bg-background rounded-full border-l border-border/60 z-10 hidden md:block"></div>

                                            <div>
                                                <div className="flex justify-between items-start mb-3 md:mb-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] md:text-xs uppercase tracking-wider font-black ${!coupon.ativo ? 'bg-gray-100 text-gray-700' :
                                                        new Date(coupon.data_fim) < new Date() ? 'bg-red-100 text-red-700' : 'bg-primary/20 text-primary'
                                                        }`}>
                                                        {!coupon.ativo ? 'Inativo' :
                                                            new Date(coupon.data_fim) < new Date() ? 'Expirado' : 'Ativo'}
                                                    </span>

                                                    {isAdmin && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                            onClick={() => {
                                                                if (confirm('Tem certeza que deseja excluir este cupom?')) {
                                                                    deleteCouponMutation.mutate(coupon.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="text-center mb-4 md:mb-6">
                                                    <span className="block text-3xl md:text-4xl font-black text-primary mb-0.5">
                                                        {coupon.tipo === 'percentual' ? `${coupon.valor}%` : formatCurrency(coupon.valor)}
                                                    </span>
                                                    <span className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest">
                                                        {coupon.tipo === 'percentual' ? 'De Desconto' : 'Reais OFF'}
                                                    </span>
                                                </div>

                                                <div className="bg-muted/50 p-3 md:p-4 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-between group-hover:border-primary/50 transition-colors mb-4 relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <code className="text-base md:text-xl font-mono font-black text-foreground tracking-widest relative z-10">
                                                        {coupon.codigo}
                                                    </code>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 md:h-9 md:w-9 hover:bg-primary hover:text-primary-foreground relative z-10"
                                                        onClick={() => copyToClipboard(coupon.codigo)}
                                                    >
                                                        {copiedCode === coupon.codigo ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="pt-3 md:pt-4 border-t border-dashed border-border flex justify-between items-center text-[9px] md:text-xs text-muted-foreground font-bold uppercase tracking-tighter">
                                                <span className="flex items-center gap-1">
                                                    <Tag className="w-3 h-3" />
                                                    {coupon.quantidade_total ? `${coupon.quantidade_usada}/${coupon.quantidade_total} usados` : 'Uso ilimitado'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Validade: {formatDate(coupon.data_fim)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MyCoupons;
