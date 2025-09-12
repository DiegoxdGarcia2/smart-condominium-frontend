import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

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
  isInitialized: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  initialize: () => Promise<void>;
}

// Forma de los valores del contexto
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isInitialized: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: true,
  setUser: () => {},
  login: async (_credentials) => false,
  logout: () => {},
  initialize: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const logout = useCallback(() => {
    console.log('[AuthContext] Logging out...');
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.log('[AuthContext] Tokens removed from localStorage');
    } catch (error) {
      console.error('[AuthContext] Error removing tokens from localStorage:', error);
    }
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    console.log('[AuthContext] State cleared');
  }, []);

  const refreshAccessToken = useCallback(async (currentRefreshToken: string) => {
    console.log('[AuthContext] Attempting to refresh token...');
    try {
      const response = await api.post('/token/refresh/', { refresh: currentRefreshToken });
      console.log('[AuthContext] Refresh response:', response.status);
      const newAccessToken = response.data?.access;
      const newRefreshToken = response.data?.refresh;
      
      if (newAccessToken) {
        console.log('[AuthContext] Got new access token, updating state...');
        localStorage.setItem('accessToken', newAccessToken);
        setAccessToken(newAccessToken);
        
        if (newRefreshToken) {
          console.log('[AuthContext] Got new refresh token, updating state...');
          localStorage.setItem('refreshToken', newRefreshToken);
          setRefreshToken(newRefreshToken);
        }
        
        return newAccessToken;
      }
      console.warn('[AuthContext] No access token in refresh response');
      return null;
    } catch (error: any) {
      console.error('[AuthContext] Error refreshing token:', error.response?.status, error.response?.data);
      // Si hay un error al refrescar, limpiamos todo
      logout();
      return null;
    }
  }, [logout]);

  const fetchMe = useCallback(async (retryWithRefresh = true) => {
    console.log('%c[DEBUG] Fetching user data...', 'color: #2196F3');
    try {
      console.log('%c[DEBUG] Making /me request with token:', 'color: #2196F3', 
        localStorage.getItem('accessToken')?.substring(0, 10) + '...');
      
      const response = await api.get('/administration/users/me/');
      
      console.log('%c[DEBUG] User data received:', 'color: #4CAF50', {
        status: response.status,
        hasData: !!response.data,
        userData: response.data
      });
      
      setUser(response.data);
      return response.data;
    } catch (error: any) {
      console.error('%c[DEBUG] Error fetching user:', 'color: #f44336', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      if (retryWithRefresh && refreshToken) {
        console.log('[AuthContext] Attempting token refresh...');
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) {
          console.log('[AuthContext] Token refreshed, retrying fetch...');
          return await fetchMe(false);
        }
      }
      throw error;
    }
  }, [refreshToken, refreshAccessToken]);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const payload = { email, password };
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
    const controller = new AbortController();
    let initialized = false;

    const initializeAuth = async () => {
      if (initialized) {
        console.log('%c[DEBUG] Auth already initialized, skipping...', 'color: #FFA500');
        return;
      }
      initialized = true;
      console.log('%c[DEBUG] Starting auth initialization...', 'color: #2196F3; font-weight: bold');

      setIsLoading(true);
      
      try {
        const access = localStorage.getItem('accessToken');
        const refresh = localStorage.getItem('refreshToken');
        
        console.log('[AuthContext] Tokens in localStorage:', { hasAccess: !!access, hasRefresh: !!refresh });
        
        if (!access && !refresh) {
          console.log('[AuthContext] No tokens found, clearing state...');
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          setIsLoading(false);
          return;
        }

        // Establecer tokens en estado
        setAccessToken(access);
        if (refresh) setRefreshToken(refresh);
        
        try {
          console.log('[AuthContext] Validating session with /me endpoint...');
          const response = await api.get('/administration/users/me/');
          const userData = response.data;
          
          if (!controller.signal.aborted) {
            console.log('[AuthContext] Session validated successfully, updating state...');
            // Actualización crítica del estado
            setUser(userData);
            setAccessToken(access); // Re-confirmar el token
            if (refresh) setRefreshToken(refresh); // Re-confirmar el refresh token
          }
        } catch (error) {
          if (controller.signal.aborted) return;
          
          console.log('[AuthContext] Error validating session, attempting refresh...');
          if (refresh) {
            const newToken = await refreshAccessToken(refresh);
            if (newToken && !controller.signal.aborted) {
              try {
                const response = await api.get('/administration/users/me/');
                const userData = response.data;
                
                if (!controller.signal.aborted) {
                  console.log('[AuthContext] Session restored with new token');
                  // Actualización crítica del estado después del refresh
                  setUser(userData);
                  setAccessToken(newToken);
                }
              } catch (retryError) {
                if (!controller.signal.aborted) {
                  console.error('[AuthContext] Session restoration failed');
                  logout();
                }
              }
            } else if (!controller.signal.aborted) {
              console.error('[AuthContext] Token refresh failed');
              logout();
            }
          } else if (!controller.signal.aborted) {
            console.error('[AuthContext] No refresh token available');
            logout();
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('[AuthContext] Fatal initialization error');
          logout();
        }
      } finally {
        if (!controller.signal.aborted) {
          console.log('[AuthContext] Initialization complete');
          setIsLoading(false);
          setIsInitialized(true); // Marcar la inicialización como completada
        }
      }
    };

    initializeAuth();

    return () => {
      controller.abort();
      initialized = false;
    };
  }, []); // Mantener dependencias vacías para una única inicialización

  const initialize = useCallback(async () => {
    console.log('%c[DEBUG] Starting auth initialization...', 'color: #2196F3; font-weight: bold');
    setIsLoading(true);

    try {
      const access = localStorage.getItem('accessToken');
      const refresh = localStorage.getItem('refreshToken');
      
      console.log('%c[DEBUG] Tokens found:', 'color: #2196F3', { hasAccess: !!access, hasRefresh: !!refresh });
      
      if (!access && !refresh) {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        setIsInitialized(true);
        return;
      }

      setAccessToken(access);
      if (refresh) setRefreshToken(refresh);
      
      try {
        const response = await api.get('/administration/users/me/');
        console.log('%c[DEBUG] User data fetched successfully', 'color: #4CAF50');
        setUser(response.data);
      } catch (error) {
        console.error('%c[DEBUG] Error fetching user data', 'color: #f44336', error);
        if (refresh) {
          try {
            const newToken = await refreshAccessToken(refresh);
            if (newToken) {
              const retryResponse = await api.get('/administration/users/me/');
              setUser(retryResponse.data);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            console.error('%c[DEBUG] Error after token refresh', 'color: #f44336', refreshError);
            logout();
          }
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('%c[DEBUG] Fatal initialization error', 'color: #f44336', error);
      logout();
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      console.log('%c[DEBUG] Auth initialization complete', 'color: #4CAF50; font-weight: bold');
    }
  }, [logout, refreshAccessToken]);

  const value = useMemo(() => {
    const contextValue = {
      isAuthenticated: !!accessToken,
      isInitialized,
      accessToken,
      refreshToken,
      user,
      isLoading,
      setUser,
      login,
      logout,
      initialize,
    };

    console.log('%c[DEBUG] AuthContext state update:', 'color: #4CAF50; font-weight: bold;', {
      isAuthenticated: contextValue.isAuthenticated,
      isInitialized: contextValue.isInitialized,
      hasAccessToken: !!contextValue.accessToken,
      hasRefreshToken: !!contextValue.refreshToken,
      hasUser: !!contextValue.user,
      isLoading: contextValue.isLoading
    });

    return contextValue;
  }, [accessToken, refreshToken, user, isLoading, isInitialized, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
