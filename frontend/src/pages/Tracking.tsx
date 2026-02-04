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

// Mock Data Service
const mockTrackOrder = async (code: string): Promise<TrackingData> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
            // Simulate Correios Logic (Codes ending in BR)
            if (cleanCode.endsWith('BR')) {
                resolve({
                    code: cleanCode,
                    carrier: 'Correios',
                    status: 'Objeto em trânsito - por favor aguarde',
                    lastUpdate: '10/01/2026 14:30',
                    serviceType: 'SEDEX',
                    events: [
                        { date: '10/01/2026', time: '14:30', location: 'CTE CAJAMAR - CAJAMAR/SP', status: 'Objeto encaminhado', description: 'Para CTE BENFICA - RIO DE JANEIRO/RJ', icon: 'truck' },
                        { date: '10/01/2026', time: '14:30', location: 'CTE CAJAMAR - CAJAMAR/SP', status: 'Objeto postado após o horário limite da unidade', description: 'Sujeito a encaminhamento no próximo dia útil', icon: 'package' },
                        { date: '09/01/2026', time: '16:20', location: 'Agência dos Correios - SAO PAULO/SP', status: 'Objeto postado', icon: 'package' }
                    ]
                });
            }
            // Simulate Jadlog Logic
            else if (/^\d+$/.test(cleanCode) || cleanCode.startsWith('JAD')) {
                resolve({
                    code: cleanCode,
                    carrier: 'Jadlog',
                    status: 'EM ROTA DE ENTREGA',
                    lastUpdate: '10/01/2026 08:15',
                    serviceType: 'Jadlog .Package',
                    events: [
                        { date: '10/01/2026', time: '08:15', location: 'CO RIO DE JANEIRO 02', status: 'EM ROTA DE ENTREGA', description: 'Entregador: Carlos Silva', icon: 'truck' },
                        { date: '09/01/2026', time: '19:40', location: 'FL RIO DE JANEIRO', status: 'TRANSFERENCIA', description: 'Transferido para CO RIO DE JANEIRO 02', icon: 'truck' },
                        { date: '08/01/2026', time: '14:20', location: 'TECA JADLOG MATRIZ', status: 'EMISSAO', description: 'Documento emitido', icon: 'package' }
                    ]
                });
            }
            else {
                reject(new Error('Código de rastreio não encontrado. Verifique se o código está correto.'));
            }
        }, 1500);
    });
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
            const result = await mockTrackOrder(code);
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
                                    className="text-sm md:text-lg h-10 md:h-12 rounded-xl flex-1"
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
                                        <div className="space-y-3.5 md:space-y-4">
                                            <div>
                                                <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Código</span>
                                                <h3 className="text-lg md:text-2xl font-bold text-foreground tracking-tighter">{data.code}</h3>
                                            </div>
                                            <Separator className="opacity-50" />
                                            <div>
                                                <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Transportadora</span>
                                                <div className="flex items-center gap-1.5 mt-0.5 md:mt-1">
                                                    <Truck className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                                    <span className="font-bold text-xs md:text-base">{data.carrier}</span>
                                                </div>
                                                {data.serviceType && (
                                                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 font-medium">{data.serviceType}</p>
                                                )}
                                            </div>
                                            <Separator className="opacity-50" />
                                            <div>
                                                <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Status Atual</span>
                                                <p className="font-bold text-primary mt-0.5 text-sm md:text-lg leading-tight uppercase tracking-tight">
                                                    {data.status}
                                                </p>
                                                <p className="text-[9px] md:text-xs text-muted-foreground mt-1.5 md:mt-2 flex items-center gap-1 font-bold italic">
                                                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                                    Última atualização: {data.lastUpdate}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Right Column: Timeline */}
                                <div className="lg:col-span-2">
                                    <Card className="p-4 md:p-6 shadow-sm border-border/80 rounded-xl">
                                        <h3 className="font-bold text-xs md:text-lg mb-5 flex items-center gap-1.5 uppercase tracking-widest text-foreground/80">
                                            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                            Histórico do Objeto
                                        </h3>
                                        <div className="relative space-y-7 md:space-y-8 pl-3 md:pl-4 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-20px)] before:w-0.5 before:bg-border">
                                            {data.events.map((event, index) => (
                                                <div key={index} className="relative flex gap-3 md:gap-4">
                                                    <div className={`
                                                        absolute -left-[20px] md:-left-[21px] mt-1.5 h-3.5 w-3.5 md:h-4 md:w-4 rounded-full border-2 
                                                        ${index === 0 ? 'bg-primary border-primary ring-4 ring-primary/20' : 'bg-background border-muted-foreground'}
                                                    `}></div>
                                                    <div className="flex-1 space-y-1 md:space-y-1.5">
                                                        <div className="flex items-center text-[9px] md:text-xs text-muted-foreground gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                                            <span className="font-bold text-foreground flex items-center gap-1 uppercase tracking-tighter">
                                                                <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                                                {event.date}
                                                            </span>
                                                            <span className="opacity-30">•</span>
                                                            <span className="flex items-center gap-1 font-medium">
                                                                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                                                {event.time}
                                                            </span>
                                                        </div>
                                                        <h4 className={`font-bold uppercase tracking-tight leading-tight ${index === 0 ? 'text-primary text-sm md:text-lg' : 'text-foreground text-[11px] md:text-sm'}`}>
                                                            {event.status}
                                                        </h4>
                                                        <p className="text-[10px] md:text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                                                            <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary/60" />
                                                            {event.location}
                                                        </p>
                                                        {event.description && (
                                                            <p className="text-[10px] md:text-sm mt-1.5 md:mt-2 p-2.5 md:p-3 bg-muted/40 rounded-xl border border-border/40 font-medium leading-normal md:leading-relaxed">
                                                                {event.description}
                                                            </p>
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
