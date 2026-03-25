import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, ChevronLeft, Star, Minus, Plus, ArrowLeft, Check, ChevronDown, Rocket, X, ShieldCheck, MapPin, AlertTriangle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PaymentMethods from '@/components/products/PaymentMethods';
import { useStripeProduct } from '@/hooks/useStripeProducts';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMarcas, useModelos, useAnos, useCompatibilidade } from '@/hooks/useVehicles';

// Debug flag
const DEBUG_FILTERS = true;

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { favorites, isFavorite, toggleFavorite, loadFavorites } = useFavorites();
  const { user } = useAuth();
  
  const { data: product, isLoading, error, isError } = useStripeProduct(id || '');

  useEffect(() => {
    console.log('📦 ProductDetail Debug:', {
      id_da_url: id,
      carregando: isLoading,
      erro_objeto: error,
      produto_carregado: !!product,
      nome_produto: product?.name
    });
  }, [id, isLoading, error, product]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  const isProductFavorite = product ? isFavorite(product.id) : false;

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Vehicle filter states
  const [selectedMarca, setSelectedMarca] = useState<string>('');
  const [selectedModelo, setSelectedModelo] = useState<string>('');
  const [selectedAno, setSelectedAno] = useState<number | null>(null);

  // Dropdown open states
  const [isMarcaOpen, setIsMarcaOpen] = useState(false);
  const [isModeloOpen, setIsModeloOpen] = useState(false);
  const [isAnoOpen, setIsAnoOpen] = useState(false);

  const { data: marcas = [] } = useMarcas();
  const { data: modelos = [] } = useModelos(selectedMarca);
  const { data: anos = [] } = useAnos(selectedMarca, selectedModelo);
  const { data: compatibilidade } = useCompatibilidade(selectedMarca, selectedModelo, selectedAno || 0);

  if (DEBUG_FILTERS && marcas.length > 0) {
    console.warn('🔍 [UI DEBUG] Marcas no Dropdown:', marcas.length, {
      contem_toyota: marcas.includes('TOYOTA'),
      contem_byd: marcas.includes('BYD'),
      primeira: marcas[0]
    });
  }

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal when compatibility is found
  useEffect(() => {
    if (compatibilidade && selectedMarca && selectedModelo && selectedAno) {
      setIsModalOpen(true);
    }
  }, [compatibilidade, selectedMarca, selectedModelo, selectedAno]);

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

  // Obter imagens: mostra apenas a principal por padrão (ex: se tiver apenas 2 imagens
  // que costumam ser duplicatas ou variações simples da principal).
  // Mostra a galeria completa apenas se houver mais de 2 imagens (indicando que possui extras).
  const allImagesRaw = product?.produto_imagens || [];
  const allImages = allImagesRaw.length > 2
    ? allImagesRaw
    : (product?.image ? [{ url_imagem: product.image, principal: true }] : []);
  const [selectedSize, setSelectedSize] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground">Produto não encontrado</h2>
            <div className="max-w-md mx-auto mt-4 text-left p-6 bg-red-50 border border-red-200 rounded-xl space-y-4">
               <div>
                  <h3 className="font-bold text-red-800">Detalhes do Erro:</h3>
                  <p className="text-sm text-red-600">
                    {error instanceof Error ? error.message : "Desculpe, não conseguimos localizar este produto em nosso catálogo."}
                  </p>
               </div>
               <div className="text-[10px] font-mono bg-red-100 p-2 rounded text-red-700 overflow-auto max-h-40">
                  <p>Intent ID: {id}</p>
                  <p>Product: {JSON.stringify(product || 'null')}</p>
                  <p>Raw Error: {JSON.stringify(error || 'null')}</p>
               </div>
            </div>
            <Button
              onClick={() => navigate('/produtos')}
              className="mt-8 bg-primary hover:bg-primary/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver todos os produtos
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = (redirect = false) => {
    // Permite adicionar ao carrinho sem estar logado

    // Se for palheta ou o produto exigir seleção de veículo
    const isWiper = product.name.toLowerCase().includes('palheta');

    if (isWiper) {
      if (!selectedMarca || !selectedModelo || !selectedAno) {
        toast({
          title: "Selecione seu veículo",
          description: "Por favor, selecione marca, modelo e ano do seu carro para garantir a compatibilidade.",
          variant: "destructive",
        });
        return;
      }
    } else if (!selectedSize && product.produto_tamanhos && product.produto_tamanhos.length > 0) {
      toast({
        title: "Selecione um tamanho",
        description: "Por favor, selecione um tamanho antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    const itemSize = isWiper && compatibilidade
      ? `Kit: ${compatibilidade.tamanho_motorista}"/${compatibilidade.tamanho_passageiro}" (${compatibilidade.conector})`
      : selectedSize;

    const metadata = isWiper && compatibilidade ? {
      veiculo: {
        marca: selectedMarca,
        modelo: selectedModelo,
        ano: selectedAno,
        conector: compatibilidade.conector,
        medidas: {
          motorista: compatibilidade.tamanho_motorista,
          passageiro: compatibilidade.tamanho_passageiro
        }
      }
    } : {};

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_promotional || product.price,
      image: product.image || '',
      size: itemSize,
      metadata: metadata
    }, quantity);

    if (redirect) {
      navigate('/checkout');
    } else {
      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado ao seu carrinho.`,
      });
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product.stock_quantity || 0)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Identificação necessária",
        description: "Sua lista de favoritos será sincronizada assim que você se identificar no checkout.",
        variant: "default",
      });
      return;
    }

    if (!product) return;

    // Usar o estado derivado para garantir a mensagem correta
    const willBeFavorite = !isProductFavorite;

    try {
      await toggleFavorite(product.id);

      toast({
        title: willBeFavorite ? "Produto adicionado aos favoritos!" : "Produto removido dos favoritos!",
        description: `${product.name} ${willBeFavorite ? 'foi adicionado' : 'foi removido'} da sua lista de desejos.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar sua lista de favoritos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl aspect-square flex items-center justify-center overflow-hidden border border-border relative">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]?.url_imagem}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-500">Imagem indisponível</div>
              )}

              {/* Botão de Favoritar no Canto da Imagem */}
              <button
                onClick={handleFavoriteToggle}
                className={`absolute top-4 right-4 p-2.5 transition-all duration-300 hover:scale-110 z-10 ${isProductFavorite
                  ? 'text-red-500'
                  : 'text-muted-foreground hover:text-primary'
                  }`}
                title={isProductFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Heart className={`w-6 h-6 ${isProductFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-12 gap-2 mt-4">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    className={`bg-white rounded-lg aspect-square flex items-center justify-center overflow-hidden border transition-all duration-200 ${selectedImage === index
                      ? 'border-primary ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                      }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={img.url_imagem}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(42 avaliações)</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {product.price_promotional && product.price_promotional < product.price ? (
                <>
                  <span className="text-xl md:text-2xl font-bold text-foreground">
                    R$ {(product.price_promotional * quantity).toFixed(2)}
                  </span>
                  <span className="text-base md:text-lg text-muted-foreground line-through">
                    R$ {(product.price * quantity).toFixed(2)}
                  </span>
                  <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-medium">
                    {Math.round(((product.price - product.price_promotional) / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="text-xl md:text-2xl font-bold text-foreground">
                  R$ {(product.price * quantity).toFixed(2)}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {(() => {
                if (!product.description) return null;

                // 1. Pre-process to normalize bullets and ensure "Tamanhos disponíveis" is separated
                const normalizedText = product.description
                  .replace(/-\s+/g, '• ')
                  .replace(/(Tamanhos disponíveis:)/gi, '\n$1');

                // 2. Split into segments by bullets or sentences
                // We want to keep the bullet symbol to identify them
                const rawSegments = normalizedText.split('\n').filter(Boolean);
                const finalElements: React.ReactNode[] = [];

                rawSegments.forEach((segment, i) => {
                  if (segment.includes('•')) {
                    const parts = segment.split('•');
                    const prefix = parts[0].trim();
                    const bullets = parts.slice(1).map(b => b.trim()).filter(Boolean);

                    if (prefix) {
                      prefix.split(/(?<=\.)\s+/).forEach((s, idx) => {
                        if (s.trim()) {
                          finalElements.push(
                            <p key={`pref-${i}-${idx}`} className="text-[13px] md:text-sm text-foreground leading-relaxed text-left">
                              {s.trim()}
                            </p>
                          );
                        }
                      });
                    }

                    if (bullets.length > 0) {
                      // Use a sub-container for bullets to keep them tight
                      finalElements.push(
                        <div key={`bullet-group-${i}`} className="space-y-1">
                          {bullets.map((bullet, j) => {
                            const bulletSentences = bullet.split(/(?<=\.)\s+/);
                            return (
                              <div key={`bullet-block-${i}-${j}`} className="space-y-1">
                                {bulletSentences.map((sentence, k) => {
                                  const trimmedSentence = sentence.trim();
                                  if (!trimmedSentence) return null;

                                  if (k === 0) {
                                    return (
                                      <div key={`bullet-s-${i}-${j}-${k}`} className="flex items-start gap-3 text-[13px] md:text-sm text-foreground leading-relaxed ml-2">
                                        <div className="flex items-center h-5 shrink-0">
                                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        </div>
                                        <span className="flex-1">{trimmedSentence}</span>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <p key={`bullet-para-${i}-${j}-${k}`} className="text-[13px] md:text-sm text-foreground leading-relaxed text-left ml-2">
                                        {trimmedSentence}
                                      </p>
                                    );
                                  }
                                })}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                  } else {
                    // Pure text line - split by sentences
                    segment.split(/(?<=\.)\s+/).forEach((sentence, idx) => {
                      if (sentence.trim()) {
                        finalElements.push(
                          <p key={`para-${i}-${idx}`} className="text-[13px] md:text-sm text-foreground leading-relaxed text-left">
                            {sentence.trim()}
                          </p>
                        );
                      }
                    });
                  }
                });

                return finalElements;
              })()}
            </div>

            {/* Vehicle Selection Filters */}
            {product.name.toLowerCase().includes('palheta') && (
              <div>
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
                  {/* Marca Select */}
                  <div className="relative w-full sm:flex-1">
                    <label className="font-semibold text-foreground mb-1.5 block ml-1 text-xs uppercase tracking-wide">Carro</label>
                    <button
                      onClick={() => {
                        const next = !isMarcaOpen;
                        closeAllDropdowns();
                        setIsMarcaOpen(next);
                      }}
                      className="flex items-center justify-between w-full px-4 py-2 bg-background border border-border rounded-lg text-sm hover:border-primary/50 transition-colors h-[42px]"
                    >
                      <span className="truncate">{selectedMarca || 'Marca'}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isMarcaOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMarcaOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-card border border-border rounded-lg shadow-elevated z-50 py-1">
                        {marcas.map((marca) => (
                          <button
                            key={marca}
                            onClick={() => handleMarcaSelect(marca)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between ${marca === selectedMarca ? 'text-primary bg-primary/5' : ''}`}
                          >
                            {marca}
                            {marca === selectedMarca && <Check className="w-3 h-3 text-primary" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Modelo Select */}
                  <div className="relative w-full sm:flex-1">
                    <label className="font-semibold text-foreground mb-1.5 block ml-1 text-xs uppercase tracking-wide">Modelo</label>
                    <button
                      disabled={!selectedMarca}
                      onClick={() => {
                        const next = !isModeloOpen;
                        closeAllDropdowns();
                        setIsModeloOpen(next);
                      }}
                      className={`flex items-center justify-between w-full px-4 py-2 border rounded-lg text-sm transition-colors h-[42px] ${selectedMarca ? 'bg-background border-border hover:border-primary/50' : 'bg-muted/30 text-muted-foreground border-border cursor-not-allowed'}`}
                    >
                      <span className="truncate">{selectedModelo || 'Modelo'}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isModeloOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isModeloOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-card border border-border rounded-lg shadow-elevated z-50 py-1">
                        {modelos.map((modeloNome) => (
                          <button
                            key={modeloNome}
                            onClick={() => handleModeloSelect(modeloNome)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between ${modeloNome === selectedModelo ? 'text-primary bg-primary/5' : ''}`}
                          >
                            {modeloNome}
                            {modeloNome === selectedModelo && <Check className="w-3 h-3 text-primary" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ano Select */}
                  <div className="relative w-full sm:w-[100px]">
                    <label className="font-semibold text-foreground mb-1.5 block ml-1 text-xs uppercase tracking-wide">Ano</label>
                    <button
                      disabled={!selectedModelo}
                      onClick={() => {
                        const next = !isAnoOpen;
                        closeAllDropdowns();
                        setIsAnoOpen(next);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg text-sm transition-colors h-[42px] ${selectedModelo ? 'bg-background border-border hover:border-primary/50' : 'bg-muted/30 text-muted-foreground border-border cursor-not-allowed'}`}
                    >
                      <span className="truncate">{selectedAno || 'Ano'}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isAnoOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isAnoOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-card border border-border rounded-lg shadow-elevated z-50 py-1">
                        {anos.map((ano) => (
                          <button
                            key={ano}
                            onClick={() => handleAnoSelect(ano)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between ${ano === selectedAno ? 'text-primary bg-primary/5' : ''}`}
                          >
                            {ano}
                            {ano === selectedAno && <Check className="w-3 h-3 text-primary" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity Selector Inline */}
                  <div className="w-full sm:w-auto ">
                    <label className="font-semibold text-foreground mb-1.5 block ml-1 text-xs uppercase tracking-wide">Quantidade</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-lg h-[42px] bg-background">
                        <button
                          onClick={decrementQuantity}
                          className="px-2 h-full hover:bg-muted rounded-l-lg transition-colors"
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <button
                          onClick={incrementQuantity}
                          className="px-2 h-full hover:bg-muted rounded-r-lg transition-colors"
                          disabled={quantity >= (product.stock_quantity || 0)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Size Selection */}
            {(!product.name.toLowerCase().includes('palheta')) && product.produto_tamanhos && product.produto_tamanhos.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tamanho</h3>
                <div className="flex flex-wrap gap-2">
                  {product.produto_tamanhos.map((tamanho, index) => (
                    <button
                      key={tamanho.id}
                      className={`px-4 py-2 border rounded-lg ${selectedSize === tamanho.tamanho
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setSelectedSize(tamanho.tamanho)}
                    >
                      {tamanho.tamanho}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Separate Quantity Selector for Non-Palheta Products */}
            {!product.name.toLowerCase().includes('palheta') && (
              <div>
                <h3 className="font-semibold text-foreground mb-1.5 block ml-1 text-xs uppercase tracking-wide">Quantidade</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      className="p-2 hover:bg-muted rounded-l-lg"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="p-2 hover:bg-muted rounded-r-lg"
                      disabled={quantity >= (product.stock_quantity || 0)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Button
                onClick={() => handleAddToCart(true)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
                disabled={(product.stock_quantity || 0) <= 0}
              >
                <Rocket className="w-4 h-4 mr-2" />
                {(product.stock_quantity || 0) <= 0 ? 'Produto Indisponível' : 'Comprar agora'}
              </Button>

              <Button
                onClick={() => handleAddToCart(false)}
                variant="outline"
                className="flex-1 border-border hover:border-primary hover:text-primary hover:bg-primary/5 py-6 text-sm font-semibold transition-all"
                disabled={(product.stock_quantity || 0) <= 0}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="w-4 h-4" />
                <span className="font-semibold text-foreground">Envio garantido para todo o Brasil</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Calcule o frete e prazo na próxima etapa
              </p>
              <PaymentMethods className="mt-4 pt-4" />
            </div>

          </div>
        </div>
      </main>
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
                      <img src="/placeholder.svg" alt="Braço" className="h-20 w-auto opacity-20" />
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
                onClick={() => {
                  handleAddToCart();
                  setIsModalOpen(false);
                }}
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
      <Footer />
    </div>
  );
};

export default ProductDetail;