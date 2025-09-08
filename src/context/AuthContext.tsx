import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import api from '../services/api';

// Tipos
interface User {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

// Forma de los valores del contexto
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: true,
  setUser: () => {},
  login: async (_credentials) => false,
  logout: () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch {
      // Ignorar errores de localStorage
    }
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const fetchMe = useCallback(async () => {
    const { data } = await api.get('/administration/users/me/');
    setUser(data);
    return data;
  }, []);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const payload = { email: email, password };
    const { data } = await api.post('/token/', payload);
    const access = data?.access;
    const refresh = data?.refresh;
    if (!access) throw new Error('No se recibió access token');
    try {
      localStorage.setItem('accessToken', access);
      if (refresh) localStorage.setItem('refreshToken', refresh);
    } catch {
      // Ignorar errores de localStorage
    }
    setAccessToken(access);
    if (refresh) setRefreshToken(refresh);

    try {
      await fetchMe();
    } catch (err) {
      // Si /me falla, limpiar sesión para evitar estado inconsistente
      logout();
      throw err;
    }
    return true;
  }, [fetchMe, logout]);

  // Persistencia de sesión al recargar
  useEffect(() => {
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    
    if (access) {
      setAccessToken(access);
      if (refresh) setRefreshToken(refresh);
      
      fetchMe()
        .then(() => {
          // Usuario autenticado exitosamente
          setIsLoading(false);
        })
        .catch(() => {
          // Token inválido/expirado
          logout();
          setIsLoading(false);
        });
    } else {
      // No hay token, usuario no autenticado
      setIsLoading(false);
    }
  }, [fetchMe, logout]);

  const value = useMemo(() => ({
    isAuthenticated: !!accessToken,
    accessToken,
    refreshToken,
    user,
    isLoading,
    setUser,
    login,
    logout,
  }), [accessToken, refreshToken, user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
