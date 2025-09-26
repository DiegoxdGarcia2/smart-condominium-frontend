import { useCallback } from 'react';
// Minimal hook for getting access token. Integrate with your AuthContext if present.

export default function useAuth() {
  const getAccessToken = useCallback(() => localStorage.getItem('access_token'), []);

  const getUser = useCallback(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }, []);

  return { getAccessToken, getUser };
}
