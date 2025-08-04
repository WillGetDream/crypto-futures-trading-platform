# Vercel 部署指南

## 1. 准备工作

### 1.1 确保项目可以正常构建
```bash
npm run build
```

### 1.2 检查环境变量
确保 `.env.local` 文件包含必要的环境变量：
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. 部署到 Vercel

### 方法1: 使用 Vercel CLI（推荐）

1. **登录 Vercel**：
   ```bash
   vercel login
   ```

2. **部署项目**：
   ```bash
   vercel
   ```

3. **按照提示操作**：
   - 选择 "Y" 链接到现有项目或创建新项目
   - 选择项目名称
   - 确认部署设置

### 方法2: 使用 GitHub 集成

1. **推送代码到 GitHub**：
   ```bash
   git add .
   git commit -m "Add Vercel deployment config"
   git push origin main
   ```

2. **在 Vercel Dashboard 中**：
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入 GitHub 仓库
   - 配置环境变量

## 3. 配置环境变量

### 3.1 在 Vercel Dashboard 中设置

1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加以下变量：

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_POLYGON_API_KEY=your_polygon_key
VITE_FINNHUB_API_KEY=your_finnhub_key
VITE_IBKR_HOST=127.0.0.1
VITE_IBKR_PORT=4002
VITE_IBKR_CLIENT_ID=0
```

### 3.2 使用 Vercel CLI 设置

```bash
vercel env add VITE_CLERK_PUBLISHABLE_KEY
vercel env add VITE_ALPHA_VANTAGE_API_KEY
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

## 4. 更新 Clerk 配置

### 4.1 更新 Clerk Dashboard

1. 登录 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 进入你的应用设置
3. 更新域名配置：

**生产环境域名**：
- Sign-in URL: `https://your-app.vercel.app/sign-in`
- Sign-up URL: `https://your-app.vercel.app/sign-up`
- After sign-in URL: `https://your-app.vercel.app/`
- After sign-up URL: `https://your-app.vercel.app/`

## 5. 自定义域名（可选）

### 5.1 添加自定义域名

1. 在 Vercel Dashboard 中：
   - 进入项目设置
   - 点击 "Domains"
   - 添加你的自定义域名

2. 更新 DNS 记录：
   - 添加 CNAME 记录指向 `cname.vercel-dns.com`

### 5.2 更新 Clerk 配置

将 Clerk Dashboard 中的域名更新为你的自定义域名。

## 6. 部署命令

### 6.1 开发环境部署
```bash
vercel --dev
```

### 6.2 生产环境部署
```bash
vercel --prod
```

### 6.3 预览部署
```bash
vercel
```

## 7. 监控和日志

### 7.1 查看部署日志
```bash
vercel logs
```

### 7.2 查看实时日志
```bash
vercel logs --follow
```

### 7.3 在 Dashboard 中查看
- 访问 Vercel Dashboard
- 进入项目
- 点击 "Functions" 查看函数日志

## 8. 性能优化

### 8.1 启用缓存
- 静态资源已配置缓存头
- 图片和字体文件会被缓存

### 8.2 代码分割
- Vite 自动进行代码分割
- 路由级别的懒加载

### 8.3 CDN
- Vercel 自动使用全球 CDN
- 边缘网络优化

## 9. 故障排除

### 常见问题

**问题**: 构建失败
**解决**: 
- 检查 `npm run build` 是否成功
- 查看构建日志中的错误信息

**问题**: 环境变量未生效
**解决**:
- 确保在 Vercel Dashboard 中正确设置
- 重新部署项目

**问题**: Clerk 认证失败
**解决**:
- 检查 Clerk Dashboard 中的域名配置
- 确保生产环境的 Publishable Key 正确

**问题**: 路由不工作
**解决**:
- 检查 `vercel.json` 中的 rewrites 配置
- 确保 SPA 路由正确配置

## 10. 有用的命令

```bash
# 查看项目信息
vercel ls

# 查看项目详情
vercel inspect

# 删除项目
vercel remove

# 查看环境变量
vercel env ls

# 拉取环境变量
vercel env pull .env.local

# 查看部署历史
vercel ls --all
```

## 11. 下一步

部署完成后：
1. ✅ 测试所有功能是否正常
2. ✅ 检查 Clerk 认证是否工作
3. ✅ 验证 API 调用是否成功
4. ✅ 测试移动端响应式设计
5. ✅ 配置自定义域名（如果需要）

需要帮助配置任何特定功能吗？ 