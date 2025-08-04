# Clerk 认证设置指南

## 1. 创建 Clerk 账户

1. 访问 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 点击 "Sign up" 创建账户
3. 使用 GitHub 或邮箱注册

## 2. 创建新应用

1. 登录后点击 "Add application"
2. 选择应用名称（例如：`cryptotrade-pro`）
3. 选择 "React" 框架
4. 点击 "Create application"

## 3. 获取 API 密钥

1. 在应用仪表板中，找到 "API Keys" 部分
2. 复制 **Publishable Key**（以 `pk_test_` 或 `pk_live_` 开头）

## 4. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## 5. 配置认证设置

### 5.1 启用认证方式
在 Clerk Dashboard 中：
1. 进入 "User & Authentication" → "Email, Phone, Username"
2. 启用 "Email address"
3. 可选择启用 "Username"

### 5.2 配置社交登录（可选）
1. 进入 "User & Authentication" → "Social Connections"
2. 启用 Google、GitHub 等社交登录

### 5.3 自定义外观
1. 进入 "User & Authentication" → "Appearance"
2. 自定义登录页面的颜色、字体等

## 6. 配置域名

### 开发环境
1. 在 "Paths" 部分添加：
   - **Sign-in URL**: `http://localhost:5173/sign-in`
   - **Sign-up URL**: `http://localhost:5173/sign-up`
   - **After sign-in URL**: `http://localhost:5173/`
   - **After sign-up URL**: `http://localhost:5173/`

### 生产环境
部署时更新为你的实际域名：
- `https://yourdomain.com/sign-in`
- `https://yourdomain.com/sign-up`
- `https://yourdomain.com/`

## 7. 测试认证

1. 启动开发服务器：`npm run dev`
2. 访问 `http://localhost:5173`
3. 应该看到 Clerk 登录页面
4. 测试注册和登录功能

## 8. 高级配置

### 8.1 用户角色和权限
1. 进入 "User & Authentication" → "Roles & Permissions"
2. 创建自定义角色（如：`trader`, `admin`）
3. 设置相应的权限

### 8.2 Webhooks（可选）
1. 进入 "Webhooks"
2. 配置用户创建、更新等事件的回调

### 8.3 多租户（可选）
1. 进入 "Organizations"
2. 启用组织功能

## 9. 安全设置

### 9.1 密码策略
1. 进入 "User & Authentication" → "Password"
2. 设置最小长度、复杂度要求

### 9.2 会话管理
1. 进入 "User & Authentication" → "Sessions"
2. 配置会话超时时间

### 9.3 双因素认证
1. 进入 "User & Authentication" → "Multi-factor"
2. 启用 TOTP 或 SMS 验证

## 10. 故障排除

### 常见问题

**问题**: "Missing Publishable Key" 错误
**解决**: 确保 `.env.local` 文件中有正确的 `VITE_CLERK_PUBLISHABLE_KEY`

**问题**: 登录页面不显示
**解决**: 检查域名配置是否正确

**问题**: 社交登录不工作
**解决**: 确保在 Clerk Dashboard 中正确配置了社交登录提供商

**问题**: 用户无法注册
**解决**: 检查是否启用了邮箱注册，以及域名是否在允许列表中

## 11. 部署注意事项

1. **环境变量**: 确保生产环境设置了正确的 `VITE_CLERK_PUBLISHABLE_KEY`
2. **域名**: 更新 Clerk Dashboard 中的域名配置
3. **HTTPS**: 生产环境必须使用 HTTPS
4. **CORS**: 确保域名在 Clerk 的允许列表中

## 12. 有用的链接

- [Clerk 文档](https://clerk.com/docs)
- [React 集成指南](https://clerk.com/docs/quickstarts/get-started-with-react)
- [API 参考](https://clerk.com/docs/reference)
- [社区支持](https://clerk.com/community)

## 13. 下一步

设置完成后，你的应用将具有：
- ✅ 用户注册和登录
- ✅ 社交登录（如果配置）
- ✅ 安全的会话管理
- ✅ 用户资料管理
- ✅ 响应式登录界面

需要帮助配置任何特定功能吗？ 