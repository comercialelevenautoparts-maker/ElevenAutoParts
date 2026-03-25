import { useState, useEffect } from 'react';
import { ChevronDown, Check, X, ShieldCheck, MapPin, AlertTriangle } from 'lucide-react';
import { useMarcas, useModelos, useAnos, useCompatibilidade } from '@/hooks/useVehicles';
import palhetaImg from '@/assets/palheta.png';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const VehicleFilter = () => {
    // Vehicle filter states
    const [selectedMarca, setSelectedMarca] = useState<string>('');
    const [selectedModelo, setSelectedModelo] = useState<string>('');
    const [selectedAno, setSelectedAno] = useState<number | null>(null);

    // Base product for cart
    const [baseProduct, setBaseProduct] = useState<any>(null);

    // Dropdown open states
    const [isMarcaOpen, setIsMarcaOpen] = useState(false);
    const [isModeloOpen, setIsModeloOpen] = useState(false);
    const [isAnoOpen, setIsAnoOpen] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { addToCart } = useCart();
    const { toast } = useToast();

    // Fetch vehicle data from hooks
    const { data: marcas = [], isLoading: marcasLoading, error: marcasError } = useMarcas();
    const { data: modelos = [], isLoading: modelosLoading, error: modelosError } = useModelos(selectedMarca);
    const { data: anos = [], isLoading: anosLoading, error: anosError } = useAnos(selectedMarca, selectedModelo);
    const { data: compatibilidade, error: compatibilidadeError } = useCompatibilidade(
        selectedMarca,
        selectedModelo,
        selectedAno || 0
    );

    // Auto-open modal when compatibility is found
    useEffect(() => {
        if (compatibilidade && selectedMarca && selectedModelo && selectedAno) {
            setIsModalOpen(true);
        }
    }, [compatibilidade, selectedMarca, selectedModelo, selectedAno]);

    // Fetch base product for cart
    useEffect(() => {
        const fetchBaseProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('produtos')
                    .select('*')
                    .eq('ativo', true)
                    .not('stripe_price_id', 'is', null)
                    .ilike('nome', '%Palheta%')
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    setBaseProduct(data);
                }
            } catch (error) {
                console.error('Error fetching base product:', error);
            }
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
        if (!compatibilidade) return;

        // Base product must be a real Stripe product to work with checkout
        const productToAdd = baseProduct;

        if (!productToAdd) {
            toast({
                title: "Produto não disponível",
                description: "Não foi possível encontrar o produto base para este kit na Stripe.",
                variant: "destructive"
            });
            return;
        }

        // Add Single Kit Item
        addToCart({
            id: productToAdd.id,
            name: productToAdd.nome, // Use the real Stripe product name
            price: productToAdd.preco_promocional || productToAdd.preco,
            image: productToAdd.imagem_principal || palhetaImg,
            size: `Mot: ${compatibilidade.tamanho_motorista}" ${compatibilidade.tamanho_passageiro ? `/ Pas: ${compatibilidade.tamanho_passageiro}"` : ''} (${compatibilidade.conector})`,
            metadata: {
                veiculo: {
                    marca: selectedMarca,
                    modelo: selectedModelo,
                    ano: selectedAno,
                    conector: compatibilidade.conector,
                    medidas: {
                        motorista: compatibilidade.tamanho_motorista,
                        passageiro: compatibilidade.tamanho_passageiro
                    }
                },
                tipo_kit: 'Premium'
            }
        }, 1);

        toast({
            title: "Kit adicionado ao carrinho!",
            description: `Kit para ${selectedMarca} ${selectedModelo} adicionado com sucesso.`,
        });
    };

    return (
        <div className="bg-muted rounded-2xl p-6 relative">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">
                    Descubra o modelo certo para seu veículo
                </h3>
                <p className="text-sm text-muted-foreground">
                    Selecione seu carro e encontre o modelo exato em segundos.
                </p>
            </div>

            {/* Vehicle Filter Options */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Debug information */}
                {marcasError && (
                    <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p>Erro ao carregar marcas: {marcasError.message}</p>
                    </div>
                )}
                {modelosError && (
                    <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p>Erro ao carregar modelos: {modelosError.message}</p>
                    </div>
                )}
                {anosError && (
                    <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p>Erro ao carregar anos: {anosError.message}</p>
                    </div>
                )}
                {compatibilidadeError && (
                    <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p>Erro ao carregar compatibilidade: {compatibilidadeError.message}</p>
                    </div>
                )}

                {/* Marca Dropdown */}
                <div className="flex flex-col gap-2 min-w-[100px]">
                    <span className="text-sm font-medium text-foreground">Carro</span>
                    <div className="relative">
                        <button
                            onClick={() => {
                                closeAllDropdowns();
                                setIsMarcaOpen(!isMarcaOpen);
                            }}
                            className="flex items-center justify-between gap-2 w-full px-3 py-2 bg-card text-foreground border border-border rounded-lg text-sm hover:border-foreground transition-colors min-w-[120px]"
                        >
                            <span className={selectedMarca ? 'text-foreground' : 'text-muted-foreground'}>
                                {marcasLoading ? 'Carregando...' : (selectedMarca || 'Selecione')}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isMarcaOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMarcaOpen && (
                            <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-elevated z-50 py-1">
                                {marcasLoading ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">Carregando marcas...</div>
                                ) : marcas.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">Nenhuma marca encontrada</div>
                                ) : (
                                    marcas.map((marca) => (
                                        <button
                                            key={marca}
                                            onClick={() => handleMarcaSelect(marca)}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between ${marca === selectedMarca ? 'text-primary font-medium bg-muted' : 'text-foreground'
                                                }`}
                                        >
                                            {marca}
                                            {marca === selectedMarca && <Check className="w-4 h-4" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    {selectedMarca && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            Marca selecionada
                        </span>
                    )}
                </div>

                {/* Modelo Dropdown */}
                <div className="flex flex-col gap-2 min-w-[100px]">
                    <span className="text-sm font-medium text-foreground">Modelo</span>
                    <div className="relative">
                        <button
                            onClick={() => {
                                if (selectedMarca) {
                                    closeAllDropdowns();
                                    setIsModeloOpen(!isModeloOpen);
                                }
                            }}
                            disabled={!selectedMarca || modelosLoading}
                            className={`flex items-center justify-between gap-2 w-full px-3 py-2 border rounded-lg text-sm min-w-[120px] transition-colors ${selectedMarca
                                ? 'bg-card text-foreground border-border hover:border-foreground'
                                : 'bg-muted/50 text-muted-foreground border-border/50 cursor-not-allowed'
                                }`}
                        >
                            <span className={selectedModelo ? 'text-foreground' : 'text-muted-foreground'}>
                                {modelosLoading ? 'Carregando...' : (selectedModelo || 'Selecione')}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isModeloOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isModeloOpen && (
                            <div className="absolute top-full left-0 mt-1 w-56 max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-elevated z-50 py-1">
                                {modelosLoading ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">Carregando modelos...</div>
                                ) : modelos.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum modelo encontrado</div>
                                ) : (
                                    modelos.map((modeloObj) => (
                                        <button
                                            key={modeloObj.modelo}
                                            onClick={() => handleModeloSelect(modeloObj.modelo)}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between ${modeloObj.modelo === selectedModelo ? 'text-primary font-medium bg-muted' : 'text-foreground'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span>{modeloObj.modelo}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {modeloObj.conector} • {modeloObj.tamanho_motorista}"/{modeloObj.tamanho_passageiro}"
                                                </span>
                                            </div>
                                            {modeloObj.modelo === selectedModelo && <Check className="w-4 h-4" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    {selectedModelo && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {(() => {
                                const m = modelos.find(obj => obj.modelo === selectedModelo);
                                return m ? `${m.conector} • ${m.tamanho_motorista}"/${m.tamanho_passageiro}"` : 'Modelo selecionado';
                            })()}
                        </span>
                    )}
                </div>

                {/* Ano Dropdown */}
                <div className="flex flex-col gap-2 min-w-[80px]">
                    <span className="text-sm font-medium text-foreground">Ano</span>
                    <div className="relative">
                        <button
                            onClick={() => {
                                if (selectedModelo) {
                                    closeAllDropdowns();
                                    setIsAnoOpen(!isAnoOpen);
                                }
                            }}
                            disabled={!selectedModelo || anosLoading}
                            className={`flex items-center justify-between gap-2 w-full px-3 py-2 border rounded-lg text-sm min-w-[100px] transition-colors ${selectedModelo
                                ? 'bg-card text-foreground border-border hover:border-foreground'
                                : 'bg-muted/50 text-muted-foreground border-border/50 cursor-not-allowed'
                                }`}
                        >
                            <span className={selectedAno ? 'text-foreground' : 'text-muted-foreground'}>
                                {anosLoading ? 'Carregando...' : (selectedAno || 'Selecione')}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isAnoOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isAnoOpen && (
                            <div className="absolute top-full left-0 mt-1 w-56 max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-elevated z-50 py-1">
                                {anosLoading ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">Carregando anos...</div>
                                ) : anos.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum ano encontrado</div>
                                ) : (
                                    anos.map((item) => (
                                        <button
                                            key={item.ano}
                                            onClick={() => handleAnoSelect(item.ano)}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between ${item.ano === selectedAno ? 'text-primary font-medium bg-muted' : 'text-foreground'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span>{item.ano}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {item.conector} • {item.tamanho_motorista}"/{item.tamanho_passageiro}"
                                                </span>
                                            </div>
                                            {item.ano === selectedAno && <Check className="w-4 h-4" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    {selectedAno && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                            {(() => {
                                const a = anos.find(obj => obj.ano === selectedAno);
                                return a ? `${a.conector} • ${a.tamanho_motorista}"/${a.tamanho_passageiro}"` : 'Ano selecionado';
                            })()}
                        </span>
                    )}
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
                                        {(compatibilidade as any)?.conectores?.imagem_url || compatibilidade.imagem_conector ? (
                                            <img src={(compatibilidade as any)?.conectores?.imagem_url || compatibilidade.imagem_conector} alt="Conector" className="h-16 w-auto" />
                                        ) : (
                                            <div className="h-16 w-16 bg-muted flex items-center justify-center text-xs font-bold">{compatibilidade.conector}</div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Conector</span>
                                </div>

                                <div className="text-2xl font-light text-primary animate-pulse">=</div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-white p-2 rounded-xl border">
                                        {(compatibilidade as any)?.conectores?.imagem_braco || (compatibilidade as any).imagem_braco ? (
                                            <img src={(compatibilidade as any)?.conectores?.imagem_braco || (compatibilidade as any).imagem_braco || palhetaImg} alt="Braço" className="h-20 w-auto" />
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
