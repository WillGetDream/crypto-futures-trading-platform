import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 如果没有配置Supabase，创建一个模拟客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: null, error: null }),
        signInWithPassword: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({ eq: () => ({ data: [], error: null }) }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
        delete: () => ({ eq: () => ({ error: null }) })
      }),
      channel: () => ({
        on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) })
      })
    };

// 数据库表类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          amount: number;
          average_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          amount: number;
          average_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          amount?: number;
          average_price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          side: 'buy' | 'sell';
          order_type: 'market' | 'limit';
          quantity: number;
          price: number;
          status: 'pending' | 'filled' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          side: 'buy' | 'sell';
          order_type: 'market' | 'limit';
          quantity: number;
          price: number;
          status?: 'pending' | 'filled' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          side?: 'buy' | 'sell';
          order_type?: 'market' | 'limit';
          quantity?: number;
          price?: number;
          status?: 'pending' | 'filled' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      price_alerts: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          target_price: number;
          alert_type: 'above' | 'below';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          target_price: number;
          alert_type: 'above' | 'below';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          target_price?: number;
          alert_type?: 'above' | 'below';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 