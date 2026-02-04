import { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useMarcas, useModelos, useAnos, useCompatibilidade } from '@/hooks/useVehicles';
import palhetaImg from '@/assets/palheta.png';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
                    Encontre o produto ideal
                </h3>
                <p className="text-sm text-muted-foreground">
                    Selecione seu veículo para buscar a peça compatível
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

            {/* Compatibility Result */}
            {compatibilidade && (
                <div className="mt-6 p-5 bg-card border border-border rounded-xl shadow-lg animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                        <Check className="w-5 h-5 text-primary" />
                        <h4 className="font-bold text-lg text-foreground">
                            Kit compatível encontrado
                        </h4>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Kit Visual Representation */}
                        <div className="flex gap-4 items-center justify-center bg-muted/30 p-4 rounded-lg">
                            <div className="relative group">
                                <img
                                    src={palhetaImg}
                                    alt="Palheta Premium"
                                    className="h-24 w-auto object-contain transition-transform group-hover:scale-105"
                                />
                            </div>
                            <span className="text-xl text-[#DFB956] font-light">+</span>
                            <div className="relative group">
                                {compatibilidade.imagem_conector ? (
                                    <img
                                        src={compatibilidade.imagem_conector}
                                        alt={`Conector ${compatibilidade.conector}`}
                                        className="h-20 w-auto object-contain bg-white rounded p-1 shadow-sm transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="h-20 w-20 flex items-center justify-center bg-muted rounded border border-dashed text-xs text-muted-foreground">
                                        {compatibilidade.conector}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Kit Details */}
                        <div>
                            <h5 className="font-semibold text-foreground mb-2">
                                Kit limpador para {selectedMarca} {selectedModelo} {selectedAno}
                            </h5>
                            <ul className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    1x Palheta limpador para-brisa premium {compatibilidade.tamanho_motorista}" (Motorista)
                                </li>
                                {compatibilidade.tamanho_passageiro && (
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                        1x Palheta limpador para-brisa premium {compatibilidade.tamanho_passageiro}" (Passageiro)
                                    </li>
                                )}
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    1x Adaptador/conector específico ({compatibilidade.conector})
                                </li>
                            </ul>
                        </div>

                        {/* Action */}
                        <button
                            className="w-full btn-primary py-3 font-semibold shadow-md active:scale-95 transition-all text-base flex justify-center items-center gap-2"
                            onClick={handleAddToCart}
                        >
                            Adicionar ao carrinho
                        </button>
                        <p className="text-xs text-center text-muted-foreground">
                            Entrega garantida para todo o Brasil
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
