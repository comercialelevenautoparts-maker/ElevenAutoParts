import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Gift, Package, Heart, LogOut, ChevronRight, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Profile = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  // Função para formatar CPF com máscara
  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    // Remove tudo que não é número
    const cleaned = cpf.replace(/\D/g, '');
    // Aplica a máscara: 000.000.000-00
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
      .substring(0, 14);
  };

  const [formData, setFormData] = useState({
    nome: profile?.nome || '',
    sobrenome: profile?.sobrenome || '',
    email: profile?.email || user?.email || '',
    telefone: profile?.telefone || '',
    cpf: profile?.cpf ? formatCPF(profile?.cpf) : '',
    data_nascimento: profile?.data_nascimento || '',
    foto_url: profile?.foto_url || '',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const menuItems = [
    { icon: User, label: 'Informações pessoais', href: '/perfil', active: true },
    { icon: Gift, label: 'Indique e ganhe', href: '#' },
    { icon: Package, label: 'Meus pedidos', href: '/pedidos' },
    { icon: Heart, label: 'Minha lista de desejos', href: '#' },
  ];

  const handleSave = async () => {
    // Remover máscara do CPF antes de salvar
    const updatedFormData = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''), // Remove pontos e traços do CPF
      data_nascimento: formData.data_nascimento, // Atualiza o campo data_nascimento
      foto_url: formData.foto_url // Atualiza o campo foto_url com o valor do campo foto_url
    };

    const { error } = await updateProfile(updatedFormData);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
      // Atualizar o estado local para refletir as mudanças imediatamente
      setFormData(prev => ({
        ...prev,
        cpf: formatCPF(updatedFormData.cpf), // Aplicar máscara novamente para exibição
        data_nascimento: updatedFormData.data_nascimento,
        foto_url: updatedFormData.foto_url
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Informações pessoais</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${item.active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Informações pessoais</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    {formData.foto_url ? (
                      <img
                        src={formData.foto_url}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-2xl font-bold">{formData.nome?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary rounded-full p-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, foto_url: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </label>
                </div>
                <div>
                  <p className="font-semibold">{formData.nome} {formData.sobrenome}</p>
                  <p className="text-muted-foreground text-sm">{formData.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Primeiro nome</Label>
                  <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                </div>
                <div>
                  <Label>Sobrenome</Label>
                  <Input value={formData.sobrenome} onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })} />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input value={formData.email} disabled />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Remove tudo que não é número
                      value = value.replace(/\D/g, '');
                      // Aplica a máscara: 000.000.000-00
                      value = value.replace(/(\d{3})(\d)/, '$1.$2');
                      value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                      value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
                      value = value.substring(0, 14);
                      setFormData({ ...formData, cpf: value });
                    }}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="data_nascimento">Data de nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleSave} variant="outline" className="mt-4 border-primary text-primary">Salvar</Button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Alterar a senha</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label>Senha atual</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="relative">
                  <Label>Nova senha</Label>
                  <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div>
                  <Label>Confirmar nova senha</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button className="btn-primary mt-4">Salvar alterações</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
