import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Copy, Check, Share2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import ProfileSidebar from '@/components/account/ProfileSidebar';

const IndicateAndEarn = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    // Fallback se não tiver usuário logado (embora deva ser protegido)
    if (!user) {
        navigate('/login');
        return null;
    }

    // Código de convite simulado (poderia vir do banco)
    const referralCode = `ELEVEN${user.email?.split('@')[0].substring(0, 3).toUpperCase()}2025`;
    const referralLink = `https://elevenautoparts.com.br/registro?ref=${referralCode}`;

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
                    text: 'Use meu código para ganhar 10% OFF na sua primeira compra!',
                    url: referralLink,
                });
            } catch (error) {
                console.error('Error sharing', error);
            }
        } else {
            copyToClipboard(referralLink);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-6 md:py-8">
                <h1 className="text-xl md:text-3xl font-bold text-primary mb-6 md:mb-8">Indique e Ganhe</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <ProfileSidebar />

                    {/* Content */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Hero Card */}
                        <div className="bg-gradient-to-r from-primary to-[#F0C960] rounded-2xl p-5 md:p-8 text-primary-foreground relative overflow-hidden shadow-lg">
                            <div className="relative z-10 max-w-xl">
                                <h2 className="text-xl md:text-3xl font-bold mb-2.5 md:mb-4 uppercase tracking-tighter leading-[1.1]">Convide amigos e ganhe R$ 50</h2>
                                <p className="text-[12px] md:text-lg opacity-90 mb-5 font-medium leading-relaxed">
                                    Para cada amigo que fizer a primeira compra usando seu link, você ganha R$ 50 em créditos e ele ganha 10% de desconto.
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

                        {/* Link Sharing */}
                        <Card className="p-4 md:p-6 shadow-sm border-border/60">
                            <h3 className="text-[10px] md:text-lg font-bold uppercase tracking-widest mb-3 text-muted-foreground/80">Seu link exclusivo</h3>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input value={referralLink} readOnly className="bg-muted/30 h-10 md:h-12 text-[11px] md:text-sm font-medium" />
                                <Button onClick={handleShare} className="btn-primary gap-2 h-10 md:h-12 px-6 font-bold text-[10px] md:text-xs uppercase tracking-widest flex-shrink-0">
                                    <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    Compartilhar
                                </Button>
                            </div>
                        </Card>

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
                                <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed">Seu amigo faz a primeira compra com 10% de desconto.</p>
                            </Card>
                            <Card className="p-5 md:p-6 text-center space-y-3 md:space-y-4 shadow-sm hover:translate-y-[-4px] transition-all">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                    <Gift className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h4 className="font-black text-xs md:text-base uppercase tracking-widest">3. Você ganha</h4>
                                <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed">Você recebe R$ 50 em créditos na sua conta.</p>
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
