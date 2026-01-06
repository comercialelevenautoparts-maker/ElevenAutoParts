import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import logoImage from '@/assets/logo-eleven.png';

const Footer = () => {
  const footerLinks = {
    inicio: [
      { label: 'Destaques', href: '#' },
      { label: 'Promoções', href: '#' },
      { label: 'Novos Produtos', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
    minha_conta: [
      { label: 'Meu Perfil', href: '#' },
      { label: 'Meus Pedidos', href: '#' },
      { label: 'Carrinho', href: '#' },
      { label: 'Favoritos', href: '#' },
    ],
    produtos: [
      { label: 'Kit de Palhetas', href: '#' },
      { label: 'Acessórios', href: '#' },
      { label: 'Todos os Produtos', href: '#' },
    ],
    suporte: [
      { label: 'Rastreamento', href: '#' },
      { label: 'Trocas/Devoluções', href: '#' },
      { label: 'Contato', href: '#' },
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
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Insira seu e-mail"
                className="input-field flex-1 bg-background"
              />
              <button className="btn-primary whitespace-nowrap">
                Inscreva-se
              </button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Início</h4>
            <ul className="space-y-2">
              {footerLinks.inicio.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Minha Conta</h4>
            <ul className="space-y-2">
              {footerLinks.minha_conta.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Produtos</h4>
            <ul className="space-y-2">
              {footerLinks.produtos.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Termos & Condições</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground">Política de Privacidade</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="#" className="icon-button bg-primary text-primary-foreground hover:bg-primary/90">
              <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
            </a>
            <a href="#" className="icon-button bg-primary text-primary-foreground hover:bg-primary/90">
              <FontAwesomeIcon icon={faInstagram} className="w-4 h-4" />
            </a>
            <a href="#" className="icon-button bg-primary text-primary-foreground hover:bg-primary/90">
              <FontAwesomeIcon icon={faLinkedin} className="w-4 h-4" />
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2025 Eleven Auto Parts. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
