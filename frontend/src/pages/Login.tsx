import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Preencha e-mail e senha para entrar.",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message === "Invalid login credentials"
            ? "E-mail ou senha incorretos."
            : error.message === "Email not confirmed"
              ? "Seu e-mail ainda não foi verificado. Por favor, verifique sua caixa de entrada e spam."
              : error.message,
        });
      } else {
        const userName = data?.user?.user_metadata?.nome || "User";
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo de volta, ${userName}.`,
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar fazer login.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login com Google",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar fazer login com Google.",
      });
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
                <button
                  type="button"
                  className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-md bg-background shadow-sm text-primary"
                >
                  Já Tenho Conta
                </button>
                <Link
                  to="/registro"
                  className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-md text-muted-foreground hover:text-foreground text-center"
                >
                  Sou Novo Cliente
                </Link>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Endereço de E-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 text-sm bg-background/50 border-border"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 text-sm bg-background/50 border-border"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Esqueceu sua senha?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 font-bold uppercase tracking-widest mt-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                  Acessar Minha Conta
                </Button>

                {/* Divider Line */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs md:text-sm">
                    <span className="px-4 bg-card text-muted-foreground font-medium uppercase">OU</span>
                  </div>
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-12 flex items-center justify-center gap-3 px-4 border border-border rounded-xl hover:bg-muted transition-all active:scale-[0.98] bg-background shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-xs md:text-sm font-semibold text-foreground/80">Faça login com sua conta do Google</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
