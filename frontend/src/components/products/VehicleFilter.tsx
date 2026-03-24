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
                                    <button key={a} onClick={() => handleAnoSelect(parseInt(a))} className="w-full px-3 py-2 text-left text-sm hover:bg-muted">{a}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Compatibilidade */}
            {isModalOpen && compatibilidade && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-8 text-center relative overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4"><X /></button>
                        <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold uppercase mb-2">Compatível Encontrado!</h3>
                        <p className="text-muted-foreground mb-6">{selectedMarca} {selectedModelo} ({selectedAno})</p>
                        
                        <div className="flex items-center justify-center gap-6 bg-muted/30 p-6 rounded-2xl mb-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-white p-2 rounded-xl border">
                                    {compatibilidade.conectores?.imagem_url ? (
                                        <img src={compatibilidade.conectores.imagem_url} alt="Conector" className="h-16 w-auto" />
                                    ) : <div className="h-16 w-16 bg-muted flex items-center justify-center">{compatibilidade.conector}</div>}
                                </div>
                                <span className="text-[10px] font-bold">Conector</span>
                            </div>
                            <div className="text-2xl font-light">=</div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-white p-2 rounded-xl border">
                                    {compatibilidade.conectores?.imagem_braco ? (
                                        <img src={compatibilidade.conectores.imagem_braco} alt="Braço" className="h-16 w-auto" />
                                    ) : <img src={palhetaImg} alt="Palheta" className="h-16 w-auto" />}
                                </div>
                                <span className="text-[10px] font-bold">Braço</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                           <Button className="w-full h-14 font-bold" onClick={handleAddToCart}>ADICIONAR AO CARRINHO</Button>
                           <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
