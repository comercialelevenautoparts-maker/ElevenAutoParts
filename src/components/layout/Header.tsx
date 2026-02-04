import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Headphones, Menu, X, ChevronRight, ArrowUpRight } from 'lucide-react';
import logoImage from '@/assets/logo-eleven.png';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Package, User as UserIcon, Truck, Heart, Gift } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { items, removeItem, getTotalPrice, getTotalItems } = useCart();
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setIsProfileOpen(false);
    navigate('/');
  };

  const navItems = [
    { path: '/', label: 'Início' },
    { path: '/produtos', label: 'Produtos' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToFooter = () => {
    const footerElement = document.getElementById('newsletter-section');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Se não encontrar o elemento específico da newsletter, tenta encontrar o footer geral
      const footer = document.querySelector('footer');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm font-medium">
        <button
          onClick={scrollToFooter}
          className="hover:underline focus:outline-none bg-transparent border-none text-inherit cursor-pointer"
        >
          <span>Assine nossa newsletter para receber as últimas coleções.</span>
        </button>
        <ArrowUpRight className="inline-block w-4 h-4 ml-1" />
      </div>

      {/* Main Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive(item.path)
                    ? 'bg-[#DFB956] text-white'
                    : 'text-foreground hover:bg-[#DFB956]/100 hover:text-white'
                    }`}
                  onClick={() => {
                    scrollToTop();
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden icon-button icon-button-outline"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center"
              onClick={scrollToTop}
            >
              <img src={logoImage} alt="Eleven Auto Parts" className="h-10 md:h-14 object-contain" />
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              <button
                className="icon-button icon-button-primary relative"
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-foreground text-background text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              {user ? (
                <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <SheetTrigger asChild>
                    <button className="icon-button icon-button-outline">
                      <User className="w-5 h-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                    <SheetHeader>
                      <SheetTitle className="text-left">Minha Conta</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-6 py-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 cursor-pointer transition-opacity hover:opacity-90">
                          <AvatarImage src={profile?.foto_url || ''} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                            {profile?.nome ? profile.nome.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg">{profile?.nome || 'Usuário'}</span>
                          <span className="text-sm text-muted-foreground break-all line-clamp-1">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          className="justify-start gap-3 h-12 text-base font-normal"
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate('/perfil');
                          }}
                        >
                          <UserIcon className="w-5 h-5" />
                          Informações pessoais
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-3 h-12 text-base font-normal"
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate('/pedidos'); // Assumed route
                          }}
                        >
                          <Package className="w-5 h-5" />
                          Meus pedidos
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-3 h-12 text-base font-normal"
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate('/favoritos');
                          }}
                        >
                          <Heart className="w-5 h-5" />
                          Minha lista de desejos
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-3 h-12 text-base font-normal"
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate('/indique-e-ganhe');
                          }}
                        >
                          <Gift className="w-5 h-5" />
                          Indique e ganhe
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-3 h-12 text-base font-normal"
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate('/rastreio');
                          }}
                        >
                          <Truck className="w-5 h-5" />
                          Rastreamento
                        </Button>
                      </div>

                      <div className="mt-auto border-t border-border pt-4">
                        <Button
                          variant="destructive"
                          className="w-full justify-start gap-3"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-5 h-5" />
                          Sair da conta
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Link to="/login" className="icon-button icon-button-outline">
                  <User className="w-5 h-5" />
                </Link>
              )}
              <button className="icon-button icon-button-outline" onClick={() => navigate('/suporte')}>
                <Headphones className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background animate-fade-in">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 rounded-lg text-center text-sm font-medium transition-colors ${isActive(item.path)
                    ? 'bg-[#DFB956] text-white'
                    : 'text-foreground hover:bg-[#DFB956]/80 hover:text-white'
                    }`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToTop();
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Cart Dropdown */}
        {isCartOpen && (
          <div className="absolute right-0 sm:right-4 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] bg-card border border-border rounded-lg shadow-elevated z-50 animate-slide-in-right mx-4 sm:mx-0">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Carrinho de compras ({getTotalItems()})</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {items.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground">Seu carrinho está vazio</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-4 border-b border-border flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            {items.length > 0 && (
              <div className="p-4 border-t border-border">
                <div className="flex justify-between mb-4">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-bold">R$ {getTotalPrice().toFixed(2)}</span>
                </div>
                <Link
                  to="/checkout"
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                  onClick={() => setIsCartOpen(false)}
                >
                  FINALIZAR COMPRA
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <button
                  className="w-full text-center text-primary font-medium mt-2 hover:underline text-sm"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/carrinho');
                  }}
                >
                  VER CARRINHO
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
