import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authClient } from '@lib/auth-client';

// Properly type the user object
type User = {
  id: string;
  email: string;
  name?: string;
  [key: string]: any; // For any additional properties
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await authClient.getSession();
        
        if (error || !data) {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          setIsAuthenticated(true);
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      
      if (error) {
        return { 
          success: false, 
          error: typeof error.message === 'string' ? error.message : 'Login failed' 
        };
      }
      
      // Get updated session after login
      const { data, error: sessionError } = await authClient.getSession();
      
      if (sessionError || !data) {
        return { success: false, error: 'Failed to retrieve session' };
      }
      
      setIsAuthenticated(true);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { 
        success: false, 
        error: typeof err.message === 'string' ? err.message : 'An unexpected error occurred' 
      };
    }
  };

  const signup = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: name || '',
      });
      
      if (error) {
        return { 
          success: false, 
          error: typeof error.message === 'string' ? error.message : 'Signup failed' 
        };
      }
      
      // Auto-login after signup
      return login(email, password);
    } catch (err: any) {
      console.error('Signup error:', err);
      return { 
        success: false, 
        error: typeof err.message === 'string' ? err.message : 'An unexpected error occurred' 
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authClient.signOut();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    logout,
    login,
    signup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 