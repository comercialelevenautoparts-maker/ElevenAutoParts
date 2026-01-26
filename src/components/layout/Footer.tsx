import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import logoImage from '@/assets/logo-eleven.png';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    // Regex simples para validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "E-mail inválido",
        description: "Por favor, insira um endereço de e-mail válido.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Código de erro para violação de unicidade no Postgres
          toast({
            title: "Já cadastrado!",
            description: "Este e-mail já faz parte da nossa newsletter.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Inscrição confirmada!",
          description: "Obrigado por se inscrever na nossa newsletter!",
        });
        setEmail('');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao se inscrever",
        description: "Ocorreu um problema Técnico. Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  const footerLinks = {
    inicio: [
      { label: 'Início', href: '/' },
      { label: 'Produtos', href: '/produtos' },
    ],
    produtos: [
      { label: 'Palheta', href: '/produtos' },
      { label: 'Borracha', href: '/produtos' },
    ],
    minha_conta: [
      { label: 'Informações pessoais', href: '/perfil' },
      { label: 'Meus pedidos', href: '/pedidos' },
      { label: 'Minha lista de desejos', href: '/favoritos' },
      { label: 'Indique e ganhe', href: '/indique-e-ganhe' },
      { label: 'Rastreamento', href: '/rastreio' },
    ],
    suporte: [
      { label: 'Termos e condições', href: '/terms$conditions' },
      { label: 'Política de privacidade', href: '/privacy$policy' },
      { label: 'Política de devolução', href: '/return-policy' },
      { label: 'Política de cancelamento', href: '/cancellation-policy' },
    ],
  };

  return (
    <footer className="bg-white border-t border-border mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and Newsletter */}
          <div className="lg:col-span-2 pr-10">
            <Link to="/">
              <img src={logoImage} alt="Eleven Auto Parts" className="h-16 mb-6" />
            </Link>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                placeholder="Insira seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="input-field flex-1 bg-background"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary whitespace-nowrap min-w-[120px] flex justify-center items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Inscreva-se'
                )}
              </button>
            </form>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-base md:text-lg">Início</h4>
            <ul className="space-y-2">
              {footerLinks.inicio.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-base md:text-lg">Produtos</h4>
            <ul className="space-y-2">
              {footerLinks.produtos.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-base md:text-lg">Minha Conta</h4>
            <ul className="space-y-2">
              {footerLinks.minha_conta.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-base md:text-lg">Suporte</h4>
            <ul className="space-y-2">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-muted-foreground justify-center md:justify-start">
            <Link to="/terms$conditions" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-foreground">Termos &amp; Condições</Link>
            <span>|</span>
            <Link to="/privacy$policy" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-foreground">Política de Privacidade</Link>
            <span>|</span>
            <Link to="/return-policy" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-foreground">Política de Devolução</Link>
            <span>|</span>
            <Link to="/cancellation-policy" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-foreground">Política de Cancelamento</Link>
          </div>

          <div className="flex items-center gap-3">
            <a href="#" className="icon-button bg-primary text-primary-foreground hover:bg-primary/90 w-8 h-8 md:w-10 md:h-10">
              <FontAwesomeIcon icon={faFacebook} className="w-3 h-3 md:w-4 md:h-4" />
            </a>
            <a href="#" className="icon-button bg-primary text-primary-foreground hover:bg-primary/90 w-8 h-8 md:w-10 md:h-10">
              <FontAwesomeIcon icon={faInstagram} className="w-3 h-3 md:w-4 md:h-4" />
            </a>
            <a href="#" className="icon-button bg-primary text-primary-foreground hover:bg-primary/90 w-8 h-8 md:w-10 md:h-10">
              <FontAwesomeIcon icon={faLinkedin} className="w-3 h-3 md:w-4 md:h-4" />
            </a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
            <p className="text-xs md:text-sm text-muted-foreground">
              © 2025 Eleven Auto Parts. Todos os direitos reservados.
            </p>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
              Desenvolvido por <a href="https://tglsolutions.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-semibold text-[#0095C8]">TGL Solutions</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
