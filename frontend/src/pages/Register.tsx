import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User, Lock, Eye, EyeOff, Check, UserPlus, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      localStorage.setItem('eleven_referral_code', refParam);
      setReferralCode(refParam);
    } else {
      const storedRef = localStorage.getItem('eleven_referral_code');
      if (storedRef) {
        setReferralCode(storedRef);
      }
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cpf: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.fullName) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName, referralCode);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: error.message === "User already registered"
            ? "Este e-mail já está cadastrado. Tente fazer login."
            : error.message,
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu e-mail para confirmar a conta.",
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar criar sua conta.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-8 md:py-16 px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border/100 rounded-xl p-3.5 md:p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            {/* Header / Icon */}
            <div className="flex flex-col items-center text-center gap-2 mb-6 pb-3 border-b border-border/40">
              <User className="text-primary w-6 h-6 md:w-8 md:h-8" />
              <div className="flex-1">
                <h2 className="text-base md:text-xl font-bold uppercase tracking-widest text-foreground/80">Identificação</h2>
                <p className="text-muted-foreground text-[10px] md:text-sm font-medium uppercase tracking-tighter opacity-70">Como devemos identificar seu pedido?</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Tab Style Switcher */}
              <div className="flex bg-muted p-1 rounded-lg">
                <Link
                  to="/login"
                  className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-md text-muted-foreground hover:text-foreground text-center"
                >
                  Já Tenho Conta
                </Link>
                <button
                  type="button"
                  className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-md bg-background shadow-sm text-primary"
                >
                  Sou Novo Cliente
                </button>
              </div>

              {referralCode && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3 text-primary text-xs md:text-sm animate-in fade-in slide-in-from-top-2">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Código de indicação <strong>{referralCode}</strong> aplicado!</span>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Nome Completo"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="pl-11 h-12 text-sm bg-background/50 border-border"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Seu melhor e-mail"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-11 h-12 text-sm bg-background/50 border-border"
                      required
                    />
                  </div>

                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="CPF / CNPJ"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="pl-11 h-12 text-sm bg-background/50 border-border"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Crie uma Senha Forte"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-11 pr-11 h-12 text-sm bg-background/50 border-border"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 font-bold uppercase tracking-widest mt-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  Cadastrar e Continuar
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
