import { useState } from 'react';
import { Search, Truck, MapPin, Calendar, Clock, Package, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ProfileSidebar from '@/components/account/ProfileSidebar';

// Types for Tracking Data
interface TrackingEvent {
    date: string;
    time: string;
    location: string;
    status: string;
    description?: string;
    icon?: 'check' | 'truck' | 'package' | 'alert';
}

interface TrackingData {
    code: string;
    carrier: 'Correios' | 'Jadlog' | 'Azul Cargo' | 'Total Express' | 'Outra';
    status: string;
    lastUpdate: string;
    serviceType?: string; // SEDEX, PAC, .COM
    events: TrackingEvent[];
}

// Real Data Service calling Backend
const fetchTrackingInfo = async (code: string): Promise<TrackingData> => {
    const cleanCode = code.toUpperCase().trim();
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${apiUrl}/api/frete/tracking/${cleanCode}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Código de rastreio não encontrado. Verifique se o código está correto.');
    }

    return response.json();
};

const Tracking = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TrackingData | null>(null);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setData(null);

        try {
            const result = await fetchTrackingInfo(code);
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Erro ao buscar rastreio. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-6 md:py-8">
                <h1 className="text-xl md:text-3xl font-bold text-primary mb-6 md:mb-8">Rastreamento</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <ProfileSidebar />

                    {/* Content */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="p-3.5 md:p-6 shadow-sm border-border/80 rounded-xl">
                            <h2 className="text-base md:text-xl font-bold uppercase tracking-tight mb-1.5 md:mb-4">Rastreie seu pedido</h2>
                            <p className="text-[11px] md:text-sm text-muted-foreground mb-5 leading-relaxed">
                                Digite o código de rastreamento recebido por e-mail para acompanhar a entrega do seu produto em tempo real.
                            </p>

                            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2 max-w-xl">
                                <Input
                                    placeholder="Ex: AA123456789BR"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="text-sm md:text-sm h-10 md:h-12 rounded-xl flex-1"
                                />
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-10 md:h-12 px-6 md:px-8 btn-primary font-bold text-[10px] md:text-xs uppercase tracking-widest"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5">
                                            <Search className="w-3.5 h-3.5" />
                                            Rastrear
                                        </span>
                                    )}
                                </Button>
                            </form>

                            {/* Error State */}
                            {error && (
                                <div className="mt-3.5 bg-red-50 text-red-600 p-3 md:p-4 rounded-xl text-[10px] md:text-sm flex items-center justify-center gap-2 max-w-xl animate-in fade-in slide-in-from-top-4 font-bold">
                                    <AlertCircle className="w-3.5 h-3.5 md:w-5 md:h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}
                        </Card>

                        {/* Tracking Results */}
                        {data && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                {/* Left Column: Status Summary */}
                                <div className="lg:col-span-1">
                                    <Card className="p-4 md:p-6 border-l-4 border-l-primary h-full shadow-sm rounded-xl">
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Código</span>
                                                <h3 className="text-base md:text-lg font-bold text-foreground tracking-tighter">{data.code}</h3>
                                            </div>
                                            <Separator className="opacity-50" />
                                            <div>
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Transportadora</span>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Truck className="w-3 h-3 text-primary" />
                                                    <span className="font-bold text-xs md:text-sm">{data.carrier}</span>
                                                </div>
                                                {data.serviceType && (
                                                    <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">{data.serviceType}</p>
                                                )}
                                            </div>
                                            <Separator className="opacity-50" />
                                            <div>
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Status Atual</span>
                                                <p className="font-black text-primary mt-0.5 text-xs md:text-sm leading-tight uppercase tracking-tight">
                                                    {data.status}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground mt-1.5 flex items-center gap-1 font-bold italic">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    Última atualização: {data.lastUpdate}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Right Column: Timeline */}
                                <div className="lg:col-span-2">
                                    <Card className="p-4 md:p-6 shadow-sm border-border/80 rounded-xl">
                                        <h3 className="font-bold text-[10px] md:text-sm mb-4 flex items-center gap-1.5 uppercase tracking-widest text-foreground/80">
                                            <MapPin className="w-3.5 h-3.5 text-primary" />
                                            Histórico do Objeto
                                        </h3>
                                        <div className="relative space-y-6 md:space-y-8 pl-6 md:pl-8">
                                            {data.events.map((event, index) => (
                                                <div key={index} className="relative flex flex-col gap-2">
                                                    {/* Circle Indicator */}
                                                    <div className={`
                                                        absolute -left-[20px] md:-left-[24px] mt-0.5 h-4 w-4 md:h-4 md:w-4 rounded-full border-2 z-10
                                                        ${index === 0
                                                            ? 'bg-primary border-background ring-4 ring-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]'
                                                            : 'bg-background border-muted-foreground/30 shadow-sm'}
                                                    `}></div>

                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center text-[9px] text-muted-foreground gap-1.5">
                                                            <span className="font-bold text-foreground flex items-center gap-1 uppercase tracking-tighter bg-muted/60 px-2 py-0.5 rounded-md shadow-sm">
                                                                <Calendar className="w-2.5 h-2.5 text-primary/70" />
                                                                {event.date}
                                                            </span>
                                                            <span className="flex items-center gap-1 font-medium bg-muted/60 px-2 py-0.5 rounded-md shadow-sm">
                                                                <Clock className="w-2.5 h-2.5 text-primary/70" />
                                                                {event.time}
                                                            </span>
                                                        </div>

                                                        <h4 className={`font-black uppercase tracking-tight leading-tight ${index === 0 ? 'text-sm md:text-base text-primary' : 'text-foreground/90 text-xs md:text-sm'}`}>
                                                            {event.status}
                                                        </h4>

                                                        <p className="text-[9px] md:text-xs text-muted-foreground flex items-center gap-1.5 font-bold">
                                                            <MapPin className="w-2.5 h-2.5 text-primary/60" />
                                                            {event.location}
                                                        </p>

                                                        {event.description && (
                                                            <div className="mt-2.5 p-3 md:p-4 bg-card border border-border/80 rounded-xl font-medium leading-relaxed shadow-sm relative overflow-hidden group">
                                                                <div className="absolute left-0 top-0 h-full w-0.5 bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                                                <p className="text-[10px] md:text-xs text-foreground/80">{event.description}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Features Grid (Simple) */}
                        {!data && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                                <div className="flex items-center gap-4 p-4 bg-card border border-border/100 rounded-xl shadow-sm">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[10px] md:text-xs uppercase tracking-widest mb-0.5">Tempo Real</h3>
                                        <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Atualizações diretas</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-card border border-border/100 rounded-xl shadow-sm">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[10px] md:text-xs uppercase tracking-widest mb-0.5">Multi-empresas</h3>
                                        <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Diversas transportadoras</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-card border border-border/100 rounded-xl shadow-sm">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[10px] md:text-xs uppercase tracking-widest mb-0.5">Simples</h3>
                                        <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Fácil de usar</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

function AlertCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
    );
}

export default Tracking;
