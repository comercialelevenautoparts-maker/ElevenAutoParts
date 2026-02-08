import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User, Lock, Eye, EyeOff, Phone, Calendar, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type Step = 'email' | 'info';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Lógica de Rastreamento de Indicação (Persistência)
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      // Se veio pela URL, salva no LocalStorage (prioridade)
      localStorage.setItem('eleven_referral_code', refParam);
      setReferralCode(refParam);
    } else {
      // Se não tem na URL, tenta recuperar do LocalStorage (caso tenha fechado a aba)
      const storedRef = localStorage.getItem('eleven_referral_code');
      if (storedRef) {
        setReferralCode(storedRef);
      }
    }
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const steps = [
    { id: 'email', label: 'Inscreva-se', icon: User },
    { id: 'info', label: 'Adicionar informações', icon: Check },
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('info');
  };

  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não conferem",
        description: "As senhas digitadas não são iguais.",
      });
      return;
    }

    setLoading(true);
    try {
      // Combine firstName and lastName for 'nome' as expected by AuthContext
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const { error } = await signUp(email, formData.password, fullName, referralCode);

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

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-6 md:py-12 px-4">
        <div className="w-full max-w-lg">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6 md:mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${currentStep === step.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : steps.findIndex(s => s.id === currentStep) > index
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-border text-muted-foreground'
                    }`}>
                    <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-[10px] md:text-xs mt-1.5 md:mt-2 text-muted-foreground font-medium uppercase tracking-tighter">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 md:w-24 h-0.5 mx-1.5 md:mx-2 mb-4 md:mb-6 ${steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-primary'
                    : 'bg-border'
                    }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Email */}
          {currentStep === 'email' && (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card mx-auto">
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1 md:mb-2">
                Criar uma conta
              </h1>

              {referralCode && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-xs md:text-sm animate-in fade-in slide-in-from-top-2">
                  <Check className="w-4 h-4" />
                  <span>Código de indicação <strong>{referralCode}</strong> aplicado com sucesso!</span>
                </div>
              )}

              <p className="text-xs md:text-sm text-muted-foreground mb-6 leading-relaxed">
                Insira seu e-mail abaixo. Enviaremos um código para verificar e proteger sua conta.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-3 md:space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Endereço de E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11 md:pl-12 text-sm md:text-base h-11 md:h-12"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary w-full h-11 md:h-12 text-sm md:text-base font-bold">
                  Continuar
                </button>

                <div className="text-center mt-4">
                  <span className="text-muted-foreground text-xs md:text-sm">Você já criou uma conta? </span>
                  <Link to="/login" className="text-primary text-xs md:text-sm font-black tracking-tight hover:underline">
                    Login
                  </Link>
                </div>
              </form>
            </div>
          )}


          {/* Step 3: Additional Info */}
          {currentStep === 'info' && (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card mx-auto">
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                Conclua seu cadastro
              </h1>
              <div className="h-1 w-24 md:w-32 bg-primary rounded-full mb-6"></div>

              <form onSubmit={handleInfoSubmit} className="space-y-3 md:space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Primeiro nome"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-field pl-11 md:pl-12 text-sm md:text-base h-11 md:h-12"
                    required
                  />
                </div>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Sobrenome"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-field pl-11 md:pl-12 text-sm md:text-base h-11 md:h-12"
                    required
                  />
                </div>

                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-1.5 md:mb-2 font-medium">
                    Você precisa ter pelo menos 18 anos para se cadastrar.
                  </p>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    <input
                      type="date"
                      placeholder="Data de aniversário"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="input-field pl-11 md:pl-12 text-sm md:text-base h-11 md:h-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-1.5 md:mb-2 font-medium">
                    Esta é a melhor forma de entrar em contato comigo.
                  </p>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="Número de Telefone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field pl-11 md:pl-12 text-sm md:text-base h-11 md:h-12"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-11 md:pl-12 pr-11 md:pr-12 text-sm md:text-base h-11 md:h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input-field pl-11 md:pl-12 text-sm md:text-base h-11 md:h-12"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary w-full h-11 md:h-12 text-sm md:text-base font-bold mt-2">
                  Cadastre-se
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
