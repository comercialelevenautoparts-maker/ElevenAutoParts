import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useFavorites } from '@/hooks/useFavorites';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: { user: User | null; session: Session | null } | null; error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome: string, referralCode?: string | null) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializa estados com dados do localStorage para velocidade instantânea
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eleven_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('eleven_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('eleven_isAdmin') === 'true';
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    // 1. Fetch Profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profileError && profileData) {
      const currentProfile = profileData as Profile;
      setProfile(currentProfile);

      // Salva no cache para o próximo refresh ser instantâneo
      localStorage.setItem('eleven_profile', JSON.stringify(currentProfile));

      // Lógica de Vínculo de Indicação (Dynamic link to database)
      const referrerCode = currentUser?.user_metadata?.referral_code;
      if (!currentProfile.referred_by && referrerCode) {
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referrerCode)
          .maybeSingle();

        if (referrerProfile) {
          await supabase
            .from('profiles')
            .update({ referred_by: referrerProfile.id })
            .eq('id', currentProfile.id);

          const updatedProfile = { ...currentProfile, referred_by: referrerProfile.id } as Profile;
          setProfile(updatedProfile);
          localStorage.setItem('eleven_profile', JSON.stringify(updatedProfile));
        }
      }
    }

    // 2. Check Admin Role
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    const isUserAdmin = !!(!rolesError && rolesData);
    setIsAdmin(isUserAdmin);
    localStorage.setItem('eleven_isAdmin', String(isUserAdmin));
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          localStorage.setItem('eleven_user', JSON.stringify(currentUser));
          setTimeout(() => {
            fetchProfile(currentUser.id, currentUser);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          localStorage.removeItem('eleven_user');
          localStorage.removeItem('eleven_profile');
          localStorage.removeItem('eleven_isAdmin');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        localStorage.setItem('eleven_user', JSON.stringify(currentUser));
        fetchProfile(currentUser.id, currentUser);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    console.log('Google Auth Redirecting to:', redirectUrl);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      }
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, nome: string, referralCode?: string | null) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome,
          referral_code: referralCode, // Metadata para o trigger ou armazenamento futuro
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', user.id);

    if (!error) {
      // Forçar atualização do perfil para garantir que os dados mais recentes sejam carregados
      await fetchProfile(user.id);
    }

    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
