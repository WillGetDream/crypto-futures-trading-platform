# Google OAuth 设置指南

## 1. 创建Google Cloud项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API

## 2. 配置OAuth同意屏幕

1. 在Google Cloud Console中，进入 **APIs & Services** → **OAuth consent screen**
2. 选择用户类型：
   - **External**: 任何人都可以使用
   - **Internal**: 仅限组织内用户
3. 填写应用信息：
   - **App name**: 你的应用名称
   - **User support email**: 你的邮箱
   - **Developer contact information**: 你的邮箱
4. 添加授权域名：
   - 开发环境: `localhost`
   - 生产环境: 你的域名

## 3. 创建OAuth 2.0客户端ID

1. 进入 **APIs & Services** → **Credentials**
2. 点击 **Create Credentials** → **OAuth 2.0 Client IDs**
3. 选择应用类型: **Web application**
4. 配置授权重定向URI:
   - 开发环境: `http://localhost:5173/auth/callback`
   - 生产环境: `https://yourdomain.com/auth/callback`
5. 复制生成的 **Client ID** 和 **Client Secret**

## 4. 配置Supabase

1. 登录你的Supabase项目
2. 进入 **Authentication** → **Providers**
3. 找到 **Google** 并启用
4. 填入Google OAuth凭据:
   - **Client ID**: 从Google Cloud Console获取
   - **Client Secret**: 从Google Cloud Console获取
5. 保存设置

## 5. 更新环境变量

在 `.env.local` 文件中添加：

```env
# Google OAuth配置
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 6. 测试Google登录

1. 重启开发服务器
2. 访问应用登录页面
3. 点击 "使用Google账户登录" 按钮
4. 完成Google授权流程

## 7. 处理回调

创建回调处理页面 `src/pages/AuthCallback.tsx`:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      } else {
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">处理登录中...</div>
    </div>
  );
};
```

## 8. 添加路由

如果使用React Router，添加回调路由：

```tsx
import { AuthCallback } from './pages/AuthCallback';

// 在路由配置中添加
<Route path="/auth/callback" element={<AuthCallback />} />
```

## 9. 安全注意事项

1. **保护Client Secret**: 永远不要在前端代码中暴露Client Secret
2. **限制重定向URI**: 只允许你的域名
3. **HTTPS**: 生产环境必须使用HTTPS
4. **域名验证**: 验证你的域名所有权

## 10. 故障排除

### 常见问题

1. **"redirect_uri_mismatch"错误**
   - 检查Google Cloud Console中的重定向URI配置
   - 确保与Supabase中的配置一致

2. **"invalid_client"错误**
   - 检查Client ID和Client Secret是否正确
   - 确认OAuth同意屏幕已配置

3. **"access_denied"错误**
   - 用户取消了授权
   - 检查OAuth同意屏幕设置

4. **回调页面404错误**
   - 确保回调路由已正确配置
   - 检查路由路径是否匹配

## 11. 生产环境部署

部署到生产环境时：

1. 更新Google Cloud Console中的重定向URI
2. 配置生产环境的域名
3. 更新Supabase中的重定向URL
4. 确保使用HTTPS

## 12. 高级配置

### 自定义范围
可以请求额外的Google API权限：

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'email profile',
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

### 自定义样式
可以自定义Google登录按钮的样式和文本。

## 13. 测试清单

- [ ] Google Cloud项目已创建
- [ ] OAuth同意屏幕已配置
- [ ] OAuth 2.0客户端ID已创建
- [ ] 重定向URI已正确配置
- [ ] Supabase Google提供商已启用
- [ ] 环境变量已设置
- [ ] 回调路由已配置
- [ ] 登录流程测试通过
- [ ] 用户数据正确保存
- [ ] 登出功能正常 