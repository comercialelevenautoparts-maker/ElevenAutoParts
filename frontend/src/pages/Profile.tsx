import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProfileSidebar from '@/components/account/ProfileSidebar';

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
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
    cpf: profile?.cpf ? formatCPF(profile.cpf) : '',
    data_nascimento: profile?.data_nascimento || '',
    foto_url: profile?.foto_url || '',
  });

  // Mantém a sincronização caso o perfil mude no background (ex: atualização do banco)
  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || '',
        sobrenome: profile.sobrenome || '',
        email: profile.email || user?.email || '',
        telefone: profile.telefone || '',
        cpf: profile.cpf ? formatCPF(profile.cpf) : '',
        data_nascimento: profile.data_nascimento || '',
        foto_url: profile.foto_url || '',
      });
    }
  }, [profile]);


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
      <main className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6 md:mb-8">Informações pessoais</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <ProfileSidebar />

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Informações pessoais</h2>
              <div className="flex items-center gap-3 md:gap-4 mb-6">
                <div className="relative">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden border border-border shadow-inner">
                    {formData.foto_url ? (
                      <img
                        src={formData.foto_url}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-xl md:text-2xl font-black text-primary/40 uppercase">{formData.nome?.charAt(0) || 'U'}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Primeiro nome</Label>
                  <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="h-10 md:h-11 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Sobrenome</Label>
                  <Input value={formData.sobrenome} onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })} className="h-10 md:h-11 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">E-mail</Label>
                  <Input value={formData.email} disabled className="h-10 md:h-11 rounded-lg bg-muted/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Telefone</Label>
                  <Input value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="h-10 md:h-11 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cpf" className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => {
                      let value = e.target.value;
                      value = value.replace(/\D/g, '');
                      value = value.replace(/(\d{3})(\d)/, '$1.$2');
                      value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                      value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
                      value = value.substring(0, 14);
                      setFormData({ ...formData, cpf: value });
                    }}
                    placeholder="000.000.000-00"
                    className="h-10 md:h-11 rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="data_nascimento" className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Data de nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    className="h-10 md:h-11 rounded-lg"
                  />
                </div>
              </div>
              <Button onClick={handleSave} variant="outline" className="mt-6 border-primary text-primary hover:bg-primary/5 h-10 md:h-11 rounded-xl px-8 font-bold text-xs uppercase tracking-widest transition-all">Salvar Alterações</Button>
            </div>

            {user?.app_metadata?.provider === 'email' && (
              <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Alterar a senha</h2>
                <div className="space-y-3 md:space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <Label className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Senha atual</Label>
                    <Input type="password" placeholder="••••••••" className="h-10 md:h-11 rounded-lg" />
                  </div>
                  <div className="relative space-y-1.5">
                    <Label className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Nova senha</Label>
                    <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="h-10 md:h-11 rounded-lg pr-12" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8.5 text-muted-foreground hover:text-foreground p-1 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Confirmar nova senha</Label>
                    <Input type="password" placeholder="••••••••" className="h-10 md:h-11 rounded-lg" />
                  </div>
                </div>
                <Button className="btn-primary mt-6 h-10 md:h-11 rounded-xl px-8 font-bold text-xs uppercase tracking-widest">Atualizar Senha</Button>
              </div>
            )}          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
