# Supabase 设置指南

## 1. 创建Supabase项目

1. 访问 [Supabase官网](https://supabase.com/)
2. 点击 "Start your project" 或 "Sign Up"
3. 使用GitHub或邮箱注册账户
4. 创建新项目

## 2. 获取项目配置

创建项目后，在项目仪表板中：

1. 进入 **Settings** → **API**
2. 复制以下信息：
   - **Project URL** (例如: `https://your-project.supabase.co`)
   - **anon public** key

## 3. 配置环境变量

在项目根目录的 `.env.local` 文件中更新：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. 创建数据库表

在Supabase仪表板中，进入 **SQL Editor** 并运行以下SQL：

### 用户表 (自动创建)
Supabase会自动创建 `auth.users` 表，无需手动创建。

### 投资组合表
```sql
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  average_price DECIMAL(20,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_symbol ON portfolios(symbol);
```

### 订单表
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT CHECK (side IN ('buy', 'sell')) NOT NULL,
  order_type TEXT CHECK (order_type IN ('market', 'limit')) NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'filled', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### 价格提醒表
```sql
CREATE TABLE price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  target_price DECIMAL(20,2) NOT NULL,
  alert_type TEXT CHECK (alert_type IN ('above', 'below')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_symbol ON price_alerts(symbol);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active);
```

## 5. 设置行级安全策略 (RLS)

### 启用RLS
```sql
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
```

### 创建策略
```sql
-- 投资组合策略
CREATE POLICY "Users can view own portfolios" ON portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- 订单策略
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- 价格提醒策略
CREATE POLICY "Users can view own price alerts" ON price_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own price alerts" ON price_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own price alerts" ON price_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own price alerts" ON price_alerts
  FOR DELETE USING (auth.uid() = user_id);
```

## 6. 配置认证设置

在Supabase仪表板中：

1. 进入 **Authentication** → **Settings**
2. 配置以下设置：
   - **Site URL**: `http://localhost:5173` (开发环境)
   - **Redirect URLs**: `http://localhost:5173/**`
   - 启用邮箱确认（可选）

## 7. 测试连接

重启开发服务器后，应用应该能够：

1. 显示登录/注册界面
2. 创建新用户账户
3. 登录现有账户
4. 访问受保护的功能

## 8. 实时功能

Supabase提供实时订阅功能：

- 投资组合变化实时更新
- 订单状态实时同步
- 价格提醒实时通知

## 故障排除

### 常见问题

1. **环境变量未加载**
   - 确保重启开发服务器
   - 检查 `.env.local` 文件格式

2. **认证失败**
   - 检查Supabase URL和密钥
   - 确认认证设置正确

3. **数据库权限错误**
   - 确认RLS策略已正确设置
   - 检查表结构是否正确

4. **实时订阅不工作**
   - 确认网络连接
   - 检查Supabase项目状态

## 生产环境部署

部署到生产环境时：

1. 更新环境变量中的URL
2. 配置生产环境的认证设置
3. 设置适当的CORS策略
4. 配置域名和SSL证书 