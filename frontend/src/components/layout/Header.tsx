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
import { LogOut, Package, User as UserIcon, Truck, Heart, Gift, Ticket } from 'lucide-react';

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
    const newsletterSection = document.getElementById('newsletter-section');
    const newsletterInput = document.getElementById('newsletter-input');

    if (newsletterSection) {
      newsletterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Pequeno delay para esperar o scroll terminar antes de focar
      setTimeout(() => {
        newsletterInput?.focus();
      }, 800);
    } else {
      const footer = document.querySelector('footer');
      footer?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="bg-primary text-primary-foreground py-2 md:py-2 px-2 text-center font-medium leading-none whitespace-nowrap overflow-hidden">
        <button
          onClick={scrollToFooter}
          className="hover:underline focus:outline-none bg-transparent border-none text-inherit cursor-pointer inline-flex items-center justify-center gap-1 w-full"
          style={{ fontSize: 'clamp(8px, 3.2vw, 14px)' }}
        >
          <span>Assine nossa newsletter para receber as últimas coleções.</span>
          <ArrowUpRight className="w-[1em] h-[1em] flex-shrink-0" />
        </button>
      </div>

      {/* Main Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between w-full">
            {/* Left Section: Responsive Spacer/Desktop Nav */}
            <div className="flex-1 md:flex-initial">
              {/* Navigation - Desktop (Hidden on Mobile) */}
              <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-primary hover:text-primary-foreground'
                      }`}
                    onClick={() => {
                      scrollToTop();
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center Section: Logo */}
            <div className="flex-shrink-0 flex justify-center">
              <Link
                to="/"
                className="flex items-center"
                onClick={scrollToTop}
              >
                <img src={logoImage} alt="Eleven Auto Parts" className="h-10 md:h-14 object-contain" />
              </Link>
            </div>

            {/* Right Section: Mobile Menu / Desktop Icons */}
            <div className="flex-1 flex justify-end md:flex-initial">
              <div className="hidden md:flex items-center gap-2">
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
                      <div className="flex flex-col gap-6 py-6 font-sans">
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
                              navigate('/pedidos');
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
                              navigate('/meus-cupons');
                            }}
                          >
                            <Ticket className="w-5 h-5" />
                            Meus cupons
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

              {/* Mobile Menu Trigger & Right Icons Container */}
              <div className="flex md:hidden items-center gap-2">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <button className="icon-button icon-button-outline">
                      <Menu className="w-5 h-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] flex flex-col p-0 border-l-0">
                    <div className="p-5 border-b border-border bg-muted/30">
                      <img src={logoImage} alt="Eleven Auto Parts" className="h-8 object-contain" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                      {/* Primary Nav */}
                      <div className="space-y-0.5">
                        <p className="px-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-70">Navegação</p>
                        {navItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-sm transition-all ${isActive(item.path)
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-foreground hover:bg-muted'
                              }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Actions & Account */}
                      <div className="space-y-0.5">
                        <p className="px-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-70">Sua Experiência</p>
                        <button
                          className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-sm group transition-all ${isActive('/carrinho') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'}`}
                          onClick={() => { setIsMobileMenuOpen(false); navigate('/carrinho'); }}
                        >
                          <div className="flex items-center gap-2.5">
                            <ShoppingCart className="w-4 h-4 text-primary" />
                            <span>Carrinho</span>
                          </div>
                          {getTotalItems() > 0 && (
                            <span className={`${isActive('/carrinho') ? 'bg-white text-primary' : 'bg-primary text-primary-foreground'} w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black shadow-sm aspect-square leading-none`}>
                              {getTotalItems()}
                            </span>
                          )}
                        </button>

                        {user && (
                          <button
                            className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-sm transition-all ${isActive('/perfil') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'}`}
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/perfil'); }}
                          >
                            <UserIcon className={`w-4 h-4 ${isActive('/perfil') ? 'text-primary-foreground' : 'text-primary'}`} />
                            <span>Minha conta</span>
                          </button>
                        )}

                        <button
                          className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-sm transition-all ${isActive('/suporte') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'}`}
                          onClick={() => { setIsMobileMenuOpen(false); navigate('/suporte'); }}
                        >
                          <Headphones className={`w-4 h-4 ${isActive('/suporte') ? 'text-primary-foreground' : 'text-primary'}`} />
                          <span>Suporte</span>
                        </button>

                        {!user ? (
                          <button
                            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-foreground hover:bg-muted text-sm font-sm group text-left"
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                          >
                            <User className="w-4 h-4 text-primary" />
                            <span>Login / Cadastro</span>
                          </button>
                        ) : (
                          <>
                            <div className="pt-2 pb-0.5">
                              <p className="px-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-70">Painel do Cliente</p>
                            </div>
                            <button
                              className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-sm transition-all ${isActive('/pedidos') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'}`}
                              onClick={() => { setIsMobileMenuOpen(false); navigate('/pedidos'); }}
                            >
                              <Package className={`w-4 h-4 ${isActive('/pedidos') ? 'text-primary-foreground' : 'text-primary'}`} />
                              <span>Meus pedidos</span>
                            </button>
                            <button
                              className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-sm transition-all ${isActive('/favoritos') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'}`}
                              onClick={() => { setIsMobileMenuOpen(false); navigate('/favoritos'); }}
                            >
                              <Heart className={`w-4 h-4 ${isActive('/favoritos') ? 'text-primary-foreground' : 'text-primary'}`} />
                              <span>Lista de desejos</span>
                            </button>
                            <button
                              className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-sm transition-all ${isActive('/meus-cupons') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'}`}
                              onClick={() => { setIsMobileMenuOpen(false); navigate('/meus-cupons'); }}
                            >
                              <Ticket className={`w-4 h-4 ${isActive('/meus-cupons') ? 'text-primary-foreground' : 'text-primary'}`} />
                              <span>Meus cupons</span>
                            </button>
                            <button
                              className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-sm transition-all ${isActive('/indique-e-ganhe') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'}`}
                              onClick={() => { setIsMobileMenuOpen(false); navigate('/indique-e-ganhe'); }}
                            >
                              <Gift className={`w-4 h-4 ${isActive('/indique-e-ganhe') ? 'text-primary-foreground' : 'text-primary'}`} />
                              <span>Indique e ganhe</span>
                            </button>
                            <button
                              className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-sm transition-all ${isActive('/rastreio') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'}`}
                              onClick={() => { setIsMobileMenuOpen(false); navigate('/rastreio'); }}
                            >
                              <Truck className={`w-4 h-4 ${isActive('/rastreio') ? 'text-primary-foreground' : 'text-primary'}`} />
                              <span>Rastreamento</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {user && (
                      <div className="p-3 border-t border-border mt-auto">
                        <Button
                          variant="destructive"
                          className="w-full justify-start gap-2.5 h-9 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sair da conta
                        </Button>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

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
                items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="p-4 border-b border-border flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.size, item.metadata)}
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
      </header >
    </>
  );
};

export default Header;
