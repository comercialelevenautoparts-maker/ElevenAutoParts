import { useState, useEffect } from 'react';
import { ChevronDown, Check, X, ShieldCheck, MapPin, AlertTriangle } from 'lucide-react';
import { useMarcas, useModelos, useAnos, useCompatibilidade } from '@/hooks/useVehicles';
import palhetaImg from '@/assets/palheta.png';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const VehicleFilter = () => {
    // States do filtro
    const [selectedMarca, setSelectedMarca] = useState<string>('');
    const [selectedModelo, setSelectedModelo] = useState<string>('');
    const [selectedAno, setSelectedAno] = useState<number | null>(null);
    const [baseProduct, setBaseProduct] = useState<any>(null);

    // States de abertura dos menus
    const [isMarcaOpen, setIsMarcaOpen] = useState(false);
    const [isModeloOpen, setIsModeloOpen] = useState(false);
    const [isAnoOpen, setIsAnoOpen] = useState(false);

    const { addToCart } = useCart();
    const { toast } = useToast();

    // Hooks do catálogo unificado
    const { data: marcas = [], isLoading: marcasLoading } = useMarcas();
    const { data: modelos = [], isLoading: modelosLoading } = useModelos(selectedMarca);
    const { data: anos = [], isLoading: anosLoading } = useAnos(selectedMarca, selectedModelo);
    const { data: compatibilidade } = useCompatibilidade(selectedMarca, selectedModelo, selectedAno || 0);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Abre o modal de sucesso quando tudo estiver selecionado
    useEffect(() => {
        if (compatibilidade && selectedMarca && selectedModelo && selectedAno) {
            setIsModalOpen(true);
        }
    }, [compatibilidade, selectedMarca, selectedModelo, selectedAno]);

    // Busca produto base para o kit
    useEffect(() => {
        const fetchBaseProduct = async () => {
            try {
                const { data } = await supabase
                    .from('produtos')
                    .select('*')
                    .eq('ativo', true)
                    .ilike('nome', '%Palheta%')
                    .limit(1)
                    .maybeSingle();

                if (data) setBaseProduct(data);
            } catch (error) { console.error('Erro ao buscar produto base'); }
        };
        fetchBaseProduct();
    }, []);

    const handleMarcaSelect = (marca: string) => {
        setSelectedMarca(marca);
        setSelectedModelo('');
        setSelectedAno(null);
        setIsMarcaOpen(false);
    };

    const handleModeloSelect = (modelo: string) => {
        setSelectedModelo(modelo);
        setSelectedAno(null);
        setIsModeloOpen(false);
    };

    const handleAnoSelect = (ano: number) => {
        setSelectedAno(ano);
        setIsAnoOpen(false);
    };

    const closeAllDropdowns = () => {
        setIsMarcaOpen(false);
        setIsModeloOpen(false);
        setIsAnoOpen(false);
    };

    const handleAddToCart = () => {
        if (!compatibilidade || !baseProduct) return;
        addToCart({
            id: baseProduct.id,
            name: baseProduct.nome,
            price: baseProduct.preco_promocional || baseProduct.preco,
            image: baseProduct.imagem_principal || palhetaImg,
            size: `Kit ${compatibilidade.tamanho_motorista}"/${compatibilidade.tamanho_passageiro}"`,
            metadata: {
                veiculo: {
                    marca: selectedMarca,
                    modelo: selectedModelo,
                    ano: selectedAno,
                    conector: compatibilidade.conector
                }
            }
        }, 1);
        toast({ title: "Kit adicionado ao carrinho!" });
        setIsModalOpen(false);
    };

    return (
        <div className="bg-muted rounded-2xl p-6 relative">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">Descubra o modelo certo</h3>
                <p className="text-sm text-muted-foreground">Encontre o catálogo 2025 para seu veículo.</p>
            </div>

            <div className="grid grid-cols-2 md:flex md:flex-wrap items-start justify-between gap-x-3 gap-y-4">
                {/* MARCA */}
                <div className="flex flex-col gap-2 min-w-[120px]">
                    <span className="text-sm font-medium">Carro</span>
                    <div className="relative">
                        <button onClick={() => { closeAllDropdowns(); setIsMarcaOpen(!isMarcaOpen); }} className="flex justify-between w-full px-3 py-2 bg-card border rounded-lg text-sm">
                            {marcasLoading ? '...' : (selectedMarca || 'Marca')}
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {isMarcaOpen && (
                            <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-card border rounded-lg shadow-elevated z-50 py-1">
                                {marcas.map(m => (
                                    <button key={m} onClick={() => handleMarcaSelect(m)} className="w-full px-3 py-2 text-left text-sm hover:bg-muted">{m}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* MODELO */}
                <div className="flex flex-col gap-2 min-w-[120px]">
                    <span className="text-sm font-medium">Modelo</span>
                    <div className="relative">
                        <button disabled={!selectedMarca} onClick={() => { closeAllDropdowns(); setIsModeloOpen(!isModeloOpen); }} className="flex justify-between w-full px-3 py-2 bg-card border rounded-lg text-sm disabled:opacity-50">
                            {modelosLoading ? '...' : (selectedModelo || 'Modelo')}
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {isModeloOpen && (
                            <div className="absolute top-full left-0 mt-1 w-56 max-h-60 overflow-y-auto bg-card border rounded-lg shadow-elevated z-50 py-1">
                                {modelos.map(m => (
                                    <button key={m} onClick={() => handleModeloSelect(m)} className="w-full px-3 py-2 text-left text-sm hover:bg-muted">{m}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ANO */}
                <div className="flex flex-col gap-2 min-w-[100px]">
                    <span className="text-sm font-medium">Ano</span>
                    <div className="relative">
                        <button disabled={!selectedModelo} onClick={() => { closeAllDropdowns(); setIsAnoOpen(!isAnoOpen); }} className="flex justify-between w-full px-3 py-2 bg-card border rounded-lg text-sm disabled:opacity-50">
                            {anosLoading ? '...' : (selectedAno || 'Ano')}
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {isAnoOpen && (
                            <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-card border rounded-lg shadow-elevated z-50 py-1">
                                {anos.map(a => (
                                    <button key={a} onClick={() => handleAnoSelect(a)} className="w-full px-3 py-2 text-left text-sm hover:bg-muted">{a}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Premium Compatibility Modal */}
            {isModalOpen && compatibilidade && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-[92vw] sm:max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-5 sm:p-8 text-center animate-in zoom-in-95 duration-500 relative overflow-y-auto max-h-[95vh]">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                            </div>
                        </div>

                        <h3 className="text-lg sm:text-2xl font-black text-foreground mb-1 sm:mb-2 uppercase tracking-tight">
                            KIT COMPATÍVEL ENCONTRADO!
                        </h3>
                        <p className="text-muted-foreground text-[10px] sm:text-sm mb-4 sm:mb-6 uppercase tracking-widest font-medium">
                            {selectedMarca} {selectedModelo} ({selectedAno})
                        </p>

                        {/* Kit Visual Representation */}
                        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
                            <div className="flex items-center justify-center gap-6 bg-muted/30 p-6 rounded-2xl mb-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-white p-2 rounded-xl border">
                                        {compatibilidade.conectores?.imagem_url ? (
                                            <img src={compatibilidade.conectores.imagem_url} alt="Conector" className="h-16 w-auto" />
                                        ) : (
                                            <div className="h-16 w-16 bg-muted flex items-center justify-center text-xs font-bold">{compatibilidade.conector}</div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Conector</span>
                                </div>

                                <div className="text-2xl font-light text-primary animate-pulse">=</div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-white p-2 rounded-xl border">
                                        {compatibilidade.conectores?.imagem_braco ? (
                                            <img src={compatibilidade.conectores.imagem_braco} alt="Braço" className="h-20 w-auto" />
                                        ) : (
                                            <img src={palhetaImg} alt="Braço" className="h-20 w-auto opacity-20" />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Braço/Palheta</span>
                                </div>
                            </div>

                            {/* Technical Details */}
                            <div className="text-left bg-muted/20 p-3 sm:p-4 rounded-xl border border-border/30">
                                <h4 className="text-[10px] sm:text-xs font-bold text-foreground mb-2 sm:mb-3 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-3 bg-primary rounded-full" />
                                    Especificações do Kit
                                </h4>
                                <ul className="space-y-1.5 sm:space-y-2.5 text-[11px] sm:text-sm">
                                    <li className="flex items-center justify-between text-muted-foreground">
                                        <span className="font-medium">Lado Motorista:</span>
                                        <span className="font-bold text-foreground">{compatibilidade.tamanho_motorista}"</span>
                                    </li>
                                    {compatibilidade.tamanho_passageiro && (
                                        <li className="flex items-center justify-between text-muted-foreground">
                                            <span className="font-medium">Lado Passageiro:</span>
                                            <span className="font-bold text-foreground">{compatibilidade.tamanho_passageiro}"</span>
                                        </li>
                                    )}
                                    <li className="flex items-center justify-between text-muted-foreground">
                                        <span className="font-medium">Tipo de Conexão:</span>
                                        <span className="font-bold text-primary bg-primary/5 px-2 py-0.5 rounded text-[10px] sm:text-xs">{compatibilidade.conector}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="text-[8.5px] sm:text-xs text-muted-foreground bg-primary/5 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg border border-primary/20 mb-4 font-medium flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap overflow-hidden">
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
                            <span className="truncate">Verifique se o braço compatível é o mesmo do seu veículo.</span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 sm:gap-3">
                            <Button
                                className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold bg-primary hover:bg-primary/90 text-white transition-all transform hover:scale-[1.02] shadow-xl rounded-xl"
                                onClick={handleAddToCart}
                            >
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> ADICIONAR AO CARRINHO
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Continuar navegando
                            </Button>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">
                            <div className="flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-green-500" /> Original
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-primary" /> Envio Imediato
                            </div>
                            <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-blue-500" /> Garantia
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
