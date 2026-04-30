import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Copy, Check, Share2, Settings, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ProfileSidebar from '@/components/account/ProfileSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useReferralSettings, useUpdateReferralSettings } from '@/hooks/useReferralSettings';

const IndicateAndEarn = () => {
    const { user, profile, isAdmin } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editBonus, setEditBonus] = useState('50');

    const { data: settings, isLoading: isLoadingSettings } = useReferralSettings();
    const updateSettingsMutation = useUpdateReferralSettings();

    // Sincroniza o form quando os dados chegam
    useEffect(() => {
        if (settings) {
            setEditBonus(settings.referrer_bonus_amount.toString());
        }
    }, [settings]);

    // Obtém o código do perfil ou gera um fallback enquanto não está no banco
    const dbReferralCode = profile?.referral_code;
    const fallbackCode = user?.email ? `ELEVEN${user.email.split('@')[0].substring(0, 3).toUpperCase()}2025` : "ELEVEN2025";
    const referralCode = dbReferralCode || fallbackCode;
    const referralLink = `${window.location.origin}/registro?ref=${referralCode}`;

    // Lógica para gerar e salvar o código no banco se o usuário não tiver um
    useEffect(() => {
        const ensureReferralCode = async () => {
            if (profile && !profile.referral_code && user?.id) {
                const generated = `ELEVEN${user.email?.split('@')[0].substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 1000)}`;

                try {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ referral_code: generated })
                        .eq('user_id', user.id);

                    if (error) throw error;
                    console.log('✅ Referral code gerado e salvo:', generated);
                } catch (err) {
                    console.error('❌ Erro ao salvar referral code:', err);
                }
            }
        };

        if (profile) {
            ensureReferralCode();
        }
    }, [profile, user?.email, user?.id]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({
            title: "Copiado!",
            description: "Link copiado para a área de transferência.",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Ganhe desconto na Eleven Auto Parts',
                    text: `Use meu código para ganhar ${settings?.referred_discount_percent || 10}% OFF na sua primeira compra!`,
                    url: referralLink,
                });
            } catch (error) {
                console.error('Error sharing', error);
            }
        } else {
            copyToClipboard(referralLink);
        }
    };

    const handleSaveSettings = async () => {
        if (!settings?.id) return;
        
        try {
            await updateSettingsMutation.mutateAsync({
                id: settings.id,
                referrer_bonus_amount: Number(editBonus),
                referred_discount_percent: settings.referred_discount_percent // keeping discount same for now
            });
            toast({ title: 'Sucesso!', description: 'Valor de bonificação atualizado.' });
            setIsSettingsOpen(false);
        } catch (error: any) {
            toast({ title: 'Erro', description: error.message, variant: 'destructive' });
        }
    };

    const bonusValue = settings?.referrer_bonus_amount || 50;
    const discountValue = settings?.referred_discount_percent || 10;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-6 md:py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <h1 className="text-xl md:text-3xl font-bold text-primary">Indique e Ganhe</h1>
                    
                    {isAdmin && (
                        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                            <DialogTrigger asChild>
                                <Button className="btn-primary gap-2 shadow-lg transition-all font-bold">
                                    <Settings className="w-4 h-4" /> Configurar bônus
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Configurar bonificação</DialogTitle>
                                    <DialogDescription>
                                        Altere o valor em reais que o cliente ganha ao indicar um amigo.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bonusAmount">Valor do Bônus (R$)</Label>
                                        <Input
                                            id="bonusAmount"
                                            type="number"
                                            value={editBonus}
                                            onChange={(e) => setEditBonus(e.target.value)}
                                            placeholder="50"
                                        />
                                    </div>
                                    <Button 
                                        onClick={handleSaveSettings} 
                                        className="w-full btn-primary font-bold mt-4"
                                        disabled={updateSettingsMutation.isPending}
                                    >
                                        {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Salvar Alteração
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <ProfileSidebar />

                    {/* Content */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Hero Card */}
                        <div className="bg-gradient-to-r from-primary to-[#FFCC33] rounded-2xl p-5 md:p-8 text-primary-foreground relative overflow-hidden shadow-lg">
                            <div className="relative z-10 max-w-xl">
                                <h2 className="text-xl md:text-3xl font-bold mb-2.5 md:mb-4 uppercase tracking-tighter leading-[1.1]">Convide amigos e ganhe R$ {bonusValue}</h2>
                                <p className="text-[12px] md:text-lg opacity-90 mb-5 font-medium leading-relaxed">
                                    Para cada amigo que fizer a primeira compra usando seu link, você ganha R$ {bonusValue} em créditos e ele ganha {discountValue}% de desconto.
                                </p>
                                <div className="bg-background/20 backdrop-blur-md p-2.5 md:p-4 rounded-xl inline-flex items-center gap-3 md:gap-4 border border-white/20">
                                    <div className="text-lg md:text-2xl font-bold tracking-widest text-white leading-none">{referralCode}</div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="gap-1.5 h-8 md:h-10 px-2.5 md:px-4 text-[9px] md:text-xs font-bold uppercase tracking-widest"
                                        onClick={() => copyToClipboard(referralCode)}
                                    >
                                        {copied ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Copy className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                                        <span className="hidden sm:inline">Copiar Código</span>
                                        <span className="sm:hidden">Copiar</span>
                                    </Button>
                                </div>
                            </div>
                            {/* Decorative Element */}
                            <Gift className="absolute -right-8 -bottom-8 w-40 h-40 md:w-64 md:h-64 text-white/10 rotate-12" />
                        </div>

                        {/* Link Sharing & Balance */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-4 md:p-6 shadow-sm border-border/60 md:col-span-2">
                                <h3 className="text-[10px] md:text-lg font-bold uppercase tracking-widest mb-3 text-muted-foreground/80">Seu link exclusivo</h3>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input value={referralLink} readOnly className="bg-muted/30 h-10 md:h-12 text-[11px] md:text-sm font-medium" />
                                    <Button onClick={handleShare} className="btn-primary gap-2 h-10 md:h-12 px-6 font-bold text-[10px] md:text-xs uppercase tracking-widest flex-shrink-0">
                                        <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        Compartilhar
                                    </Button>
                                </div>
                            </Card>

                            <Card className="p-4 md:p-6 shadow-sm border-border/60 flex flex-col justify-center items-center bg-primary/5 border-primary/20">
                                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 text-primary/80">Saldo de Créditos</h3>
                                <div className="text-2xl md:text-4xl font-black text-primary tracking-tighter">
                                    R$ {profile?.saldo_creditos?.toFixed(2) || "0,00"}
                                </div>
                                <p className="text-[9px] md:text-[10px] uppercase font-bold text-muted-foreground mt-2">Disponível para uso</p>
                            </Card>
                        </div>

                        {/* How it works */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <Card className="p-5 md:p-6 text-center space-y-3 md:space-y-4 shadow-sm hover:translate-y-[-4px] transition-all">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                    <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h4 className="font-black text-xs md:text-base uppercase tracking-widest">1. Compartilhe</h4>
                                <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed">Envie seu link exclusivo para seus amigos e familiares.</p>
                            </Card>
                            <Card className="p-5 md:p-6 text-center space-y-3 md:space-y-4 shadow-sm hover:translate-y-[-4px] transition-all">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                    <Gift className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h4 className="font-black text-xs md:text-base uppercase tracking-widest">2. Amigo compra</h4>
                                <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed">Seu amigo faz a primeira compra com {discountValue}% de desconto.</p>
                            </Card>
                            <Card className="p-5 md:p-6 text-center space-y-3 md:space-y-4 shadow-sm hover:translate-y-[-4px] transition-all">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                    <Gift className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h4 className="font-black text-xs md:text-base uppercase tracking-widest">3. Você ganha</h4>
                                <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed">Você recebe R$ {bonusValue} em créditos na sua conta.</p>
                            </Card>
                        </div>

                        {/* Referral History (Placeholder) */}
                        <div className="pt-4 md:pt-8">
                            <h3 className="text-sm md:text-lg font-bold uppercase tracking-widest mb-4 text-foreground/80">Suas indicações</h3>
                            <div className="border border-border/100 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-muted/50 px-4 py-3 grid grid-cols-3 font-bold text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">
                                    <div>Data</div>
                                    <div>Amigo</div>
                                    <div className="text-right">Status</div>
                                </div>
                                <div className="divide-y divide-border/60 bg-card">
                                    <div className="p-10 text-center text-muted-foreground text-[11px] md:text-sm font-medium italic">
                                        Você ainda não fez nenhuma indicação. Comece agora!
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default IndicateAndEarn;
