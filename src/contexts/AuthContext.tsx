import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查初始用户状态
    const checkUser = async () => {
      try {
        const currentUser = await SupabaseService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.log('No user logged in or Supabase not configured');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // 监听认证状态变化
    try {
      const { data: { subscription } } = SupabaseService.supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.log('Supabase not configured, using mock auth');
      setLoading(false);
      return () => {};
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await SupabaseService.signIn(email, password);
      if (result?.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await SupabaseService.signUp(email, password);
      if (result?.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await SupabaseService.signInWithGoogle();
      if (result?.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SupabaseService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 