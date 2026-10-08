 import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.js';
import { branchContext } from '../api/client.js';

const AuthContext = createContext(null);

const ROLE_ROUTES = {
  SUPER_ADMIN:  '/superadmin',
  ADMIN:        '/admin',
  SALES_AGENT:  '/sales-agent',
  BRANCH_ADMIN: '/branch-admin',
  BILLING:      '/billing',
  SALE:         '/sale',
  PURCHASE:     '/purchase',
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getMe()
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    branchContext.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, ROLE_ROUTES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
