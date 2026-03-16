import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Componente responsável por capturar redirecionamentos pendentes após login social.
 */
export const AuthRedirectHandler = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Só processa se o loading da auth terminou e temos um usuário
    if (!loading && user) {
      const returnTo = sessionStorage.getItem('eleven_return_to');
      if (returnTo) {
        console.log('AuthRedirectHandler: Redirecionando para rota pendente:', returnTo);
        sessionStorage.removeItem('eleven_return_to');
        navigate(returnTo, { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return null; // Não renderiza nada visualmente
};
