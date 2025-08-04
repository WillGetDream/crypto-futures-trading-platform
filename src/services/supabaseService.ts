import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

// 检查是否配置了真实的Supabase
const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
};

type Portfolio = Database['public']['Tables']['portfolios']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type PriceAlert = Database['public']['Tables']['price_alerts']['Row'];

export class SupabaseService {
  // 用户相关操作
  static async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async signUp(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      // 模拟注册成功
      console.log('Mock signup successful for:', email);
      return { user: { id: 'mock-user-id', email } };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      // 模拟登录成功
      console.log('Mock signin successful for:', email);
      return { user: { id: 'mock-user-id', email } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  static async signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      // 模拟Google登录成功
      console.log('Mock Google signin successful');
      return { user: { id: 'mock-google-user-id', email: 'user@gmail.com' } };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      // 如果Google提供商未启用，使用模拟模式
      if (error.message?.includes('provider is not enabled')) {
        console.log('Google provider not enabled, using mock mode');
        return { user: { id: 'mock-google-user-id', email: 'user@gmail.com' } };
      }
      throw error;
    }
  }

  static async signOut() {
    if (!isSupabaseConfigured()) {
      console.log('Mock signout successful');
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // 投资组合相关操作
  static async getPortfolio(userId: string): Promise<Portfolio[]> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  static async addToPortfolio(
    userId: string,
    symbol: string,
    amount: number,
    averagePrice: number
  ): Promise<Portfolio> {
    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: userId,
        symbol,
        amount,
        average_price: averagePrice,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updatePortfolio(
    id: string,
    updates: Partial<Portfolio>
  ): Promise<Portfolio> {
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteFromPortfolio(id: string): Promise<void> {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // 订单相关操作
  static async getOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createOrder(
    userId: string,
    symbol: string,
    side: 'buy' | 'sell',
    orderType: 'market' | 'limit',
    quantity: number,
    price: number
  ): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        symbol,
        side,
        order_type: orderType,
        quantity,
        price,
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateOrderStatus(
    id: string,
    status: 'pending' | 'filled' | 'cancelled'
  ): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // 价格提醒相关操作
  static async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createPriceAlert(
    userId: string,
    symbol: string,
    targetPrice: number,
    alertType: 'above' | 'below'
  ): Promise<PriceAlert> {
    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id: userId,
        symbol,
        target_price: targetPrice,
        alert_type: alertType,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updatePriceAlert(
    id: string,
    updates: Partial<PriceAlert>
  ): Promise<PriceAlert> {
    const { data, error } = await supabase
      .from('price_alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePriceAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // 实时订阅
  static subscribeToPortfolio(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('portfolio_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  static subscribeToOrders(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('order_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  static subscribeToPriceAlerts(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('price_alert_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'price_alerts',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }
} 