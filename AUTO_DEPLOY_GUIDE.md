# 🚀 Vercel 自动部署完整指南

## 方法1：使用 Vercel API Token（推荐）

### 1. 获取 Vercel API Token

1. **访问**: https://vercel.com/account/tokens
2. **点击**: "Create Token"
3. **输入名称**: `crypto-trading-auto-deploy`
4. **选择权限**: Full Account
5. **复制生成的 Token**

### 2. 获取项目信息

#### 方法A：使用脚本获取
```bash
node get-vercel-info.js
```

#### 方法B：手动获取
1. **访问**: https://vercel.com/dashboard
2. **找到你的项目**
3. **点击项目设置**
4. **复制以下信息**：
   - **Project ID**: 在 General 标签页
   - **Organization ID**: 在 General 标签页

### 3. 设置环境变量

#### 本地部署
```bash
export VERCEL_TOKEN=your_token_here
export VERCEL_ORG_ID=your_org_id_here
export VERCEL_PROJECT_ID=your_project_id_here
```

#### GitHub Actions 部署
1. **访问**: https://github.com/WillGetDream/crypto-futures-trading-platform/settings/secrets/actions
2. **添加以下 Secrets**：
   - `VERCEL_TOKEN`: 你的 Vercel Token
   - `VERCEL_ORG_ID`: 你的 Organization ID
   - `VERCEL_PROJECT_ID`: 你的 Project ID

### 4. 自动部署

#### 本地自动部署
```bash
node auto-deploy.js
```

#### GitHub Actions 自动部署
每次推送代码到 `main` 分支会自动触发部署。

## 方法2：一键部署（最简单）

### 直接点击部署
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWillGetDream%2Fcrypto-futures-trading-platform)

### 手动部署
1. **访问**: https://vercel.com/new
2. **搜索**: `WillGetDream/crypto-futures-trading-platform`
3. **点击**: "Import"
4. **点击**: "Deploy"

## 方法3：CLI 交互式部署

```bash
# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

## 部署配置

### 自动检测的配置
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 环境变量（可选）
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 部署后功能

### ✅ 完全可用
- 完整用户界面
- 响应式设计
- 模拟数据展示
- 交易功能演示

### ⚠️ 需要配置
- Clerk 认证（显示设置指南）
- 实时数据 API（使用模拟数据）
- IBKR 连接（显示诊断工具）

## 故障排除

### 常见问题

**问题**: Token 无效
**解决**: 重新生成 Token，确保有 Full Account 权限

**问题**: 项目不存在
**解决**: 先手动部署一次，然后获取项目信息

**问题**: 构建失败
**解决**: 检查 `npm run build` 是否成功

**问题**: 环境变量未生效
**解决**: 在 Vercel Dashboard 中重新设置环境变量

## 自动化优势

- ✅ **零配置部署** - 无需手动设置
- ✅ **自动重新部署** - 每次代码更新自动部署
- ✅ **全球 CDN** - 快速访问
- ✅ **HTTPS 支持** - 安全连接
- ✅ **版本控制** - 自动回滚

## 下一步

1. **选择部署方法**
2. **获取必要的 Token 和信息**
3. **运行部署脚本**
4. **测试应用功能**
5. **配置自定义域名（可选）**

---
**现在就开始自动部署吧！** 🚀 