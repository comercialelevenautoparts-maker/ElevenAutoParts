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
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-primary mb-8">Rastreamento</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <ProfileSidebar />

                    {/* Content */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Rastreie seu pedido</h2>
                            <p className="text-muted-foreground mb-6">
                                Digite o código de rastreamento recebido por e-mail para acompanhar a entrega do seu produto em tempo real.
                            </p>

                            <form onSubmit={handleTrack} className="flex gap-2 max-w-xl">
                                <Input
                                    placeholder="Ex: AA123456789BR"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="text-lg h-12"
                                />
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-12 px-8 btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Search className="w-4 h-4" />
                                            Rastrear
                                        </span>
                                    )}
                                </Button>
                            </form>

                            {/* Error State */}
                            {error && (
                                <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-center gap-2 max-w-xl animate-in fade-in slide-in-from-top-4">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}
                        </Card>

                        {/* Tracking Results */}
                        {data && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                {/* Left Column: Status Summary */}
                                <div className="lg:col-span-1">
                                    <Card className="p-6 border-l-4 border-l-primary h-full">
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Código</span>
                                                <h3 className="text-xl font-bold text-foreground">{data.code}</h3>
                                            </div>
                                            <Separator />
                                            <div>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Transportadora</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Truck className="w-4 h-4 text-primary" />
                                                    <span className="font-medium">{data.carrier}</span>
                                                </div>
                                                {data.serviceType && (
                                                    <p className="text-sm text-muted-foreground mt-1">{data.serviceType}</p>
                                                )}
                                            </div>
                                            <Separator />
                                            <div>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</span>
                                                <p className="font-bold text-primary mt-1 text-lg leading-tight">
                                                    {data.status}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {data.lastUpdate}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Right Column: Timeline */}
                                <div className="lg:col-span-2">
                                    <Card className="p-6">
                                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            Histórico do Objeto
                                        </h3>
                                        <div className="relative space-y-8 pl-4 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-20px)] before:w-0.5 before:bg-border">
                                            {data.events.map((event, index) => (
                                                <div key={index} className="relative flex gap-4">
                                                    <div className={`
                                                        absolute -left-[21px] mt-1.5 h-4 w-4 rounded-full border-2 
                                                        ${index === 0 ? 'bg-primary border-primary ring-4 ring-primary/20' : 'bg-background border-muted-foreground'}
                                                    `}></div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center text-sm text-muted-foreground gap-2 mb-1">
                                                            <span className="font-medium text-foreground flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {event.date}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {event.time}
                                                            </span>
                                                        </div>
                                                        <h4 className={`font-bold ${index === 0 ? 'text-primary text-lg' : 'text-foreground'}`}>
                                                            {event.status}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {event.location}
                                                        </p>
                                                        {event.description && (
                                                            <p className="text-sm mt-2 p-2 bg-muted/50 rounded border border-border/50">
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                                    <CheckCircle2 className="w-8 h-8 text-[#DFB956]" />
                                    <div>
                                        <h3 className="font-semibold text-sm">Tempo Real</h3>
                                        <p className="text-xs text-muted-foreground">Atualizações diretas</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                                    <Package className="w-8 h-8 text-[#DFB956]" />
                                    <div>
                                        <h3 className="font-semibold text-sm">Multi-empresas</h3>
                                        <p className="text-xs text-muted-foreground">Diversas transportadoras</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                                    <Truck className="w-8 h-8 text-[#DFB956]" />
                                    <div>
                                        <h3 className="font-semibold text-sm">Simples</h3>
                                        <p className="text-xs text-muted-foreground">Fácil de usar</p>
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
