import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL } from '../App';

interface User {
  id: number;
  username: string;
  is_admin: boolean;
  is_guest: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('progress_tracker_token');
      const storedUser = localStorage.getItem('progress_tracker_user');

      if (storedToken && storedUser) {
        // Validate token with the API
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (response.ok) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token expired or invalid - clear and auto-login as guest
            localStorage.removeItem('progress_tracker_token');
            localStorage.removeItem('progress_tracker_user');
            await performGuestLogin();
          }
        } catch {
          // Network error - still set cached user for offline resilience
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } else {
        // No stored session - auto-login as guest
        await performGuestLogin();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const performGuestLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('progress_tracker_token', data.access_token);
        localStorage.setItem('progress_tracker_user', JSON.stringify(data.user));
      }
    } catch {
      // Guest login failed - user will see login page
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('progress_tracker_token', data.access_token);
    localStorage.setItem('progress_tracker_user', JSON.stringify(data.user));
  };

  const loginAsGuest = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Guest login failed');
    }

    const data = await response.json();
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('progress_tracker_token', data.access_token);
    localStorage.setItem('progress_tracker_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('progress_tracker_token');
    localStorage.removeItem('progress_tracker_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginAsGuest, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
