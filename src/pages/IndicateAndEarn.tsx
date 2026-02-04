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
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-primary mb-8">Indique e Ganhe</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <ProfileSidebar />

                    {/* Content */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Hero Card */}
                        <div className="bg-gradient-to-r from-primary to-[#F0C960] rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
                            <div className="relative z-10 max-w-xl">
                                <h2 className="text-3xl font-bold mb-4">Convide amigos e ganhe R$ 50</h2>
                                <p className="text-lg opacity-90 mb-6">
                                    Para cada amigo que fizer a primeira compra usando seu link, você ganha R$ 50 em créditos e ele ganha 10% de desconto.
                                </p>
                                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl inline-flex items-center gap-4">
                                    <div className="text-2xl font-bold tracking-widest">{referralCode}</div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="gap-2"
                                        onClick={() => copyToClipboard(referralCode)}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        Copiar
                                    </Button>
                                </div>
                            </div>
                            {/* Decorative Element */}
                            <Gift className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 rotate-12" />
                        </div>

                        {/* Link Sharing */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Compartilhe seu link exclusivo</h3>
                            <div className="flex gap-2">
                                <Input value={referralLink} readOnly className="bg-muted" />
                                <Button onClick={handleShare} className="gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Compartilhar
                                </Button>
                            </div>
                        </Card>

                        {/* How it works */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                    <Share2 className="w-6 h-6" />
                                </div>
                                <h4 className="font-semibold">1. Compartilhe</h4>
                                <p className="text-sm text-muted-foreground">Envie seu link exclusivo para seus amigos e familiares.</p>
                            </Card>
                            <Card className="p-6 text-center space-y-4">
                                {/* Note: Package was removed from top imports, need to check if used here? Yes it is used in "Amigo compra" card.
                                 I removed Package from imports list in this call. I must add it back or change icon.
                                 Let's use Gift or similar if Package is removed, OR add Package back.
                                 Better add Package back. */}
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                    {/* Using Gift as placeholder since Package might be missing, wait, I can just add Package to imports */}
                                    <Gift className="w-6 h-6" />
                                </div>
                                <h4 className="font-semibold">2. Amigo compra</h4>
                                <p className="text-sm text-muted-foreground">Seu amigo faz a primeira compra com 10% de desconto.</p>
                            </Card>
                            <Card className="p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                    <Gift className="w-6 h-6" />
                                </div>
                                <h4 className="font-semibold">3. Você ganha</h4>
                                <p className="text-sm text-muted-foreground">Você recebe R$ 50 em créditos na sua conta.</p>
                            </Card>
                        </div>

                        {/* Referral History (Placeholder) */}
                        <div className="pt-8">
                            <h3 className="text-lg font-semibold mb-4">Suas indicações</h3>

                            <div className="border border-border rounded-lg overflow-hidden">
                                <div className="bg-muted px-4 py-3 grid grid-cols-3 font-medium text-sm">
                                    <div>Data</div>
                                    <div>Amigo</div>
                                    <div className="text-right">Status</div>
                                </div>
                                <div className="divide-y divide-border">
                                    <div className="p-8 text-center text-muted-foreground text-sm">
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
