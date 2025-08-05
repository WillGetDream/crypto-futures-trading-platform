import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();

// 启用CORS
app.use(cors());

// 代理到IBKR Gateway
app.use('/ibkr', createProxyMiddleware({
  target: 'https://localhost:5000',
  changeOrigin: true,
  secure: false, // 忽略SSL证书验证
  followRedirects: false, // 不跟随重定向
  pathRewrite: {
    '^/ibkr': '/v1/api/iserver'
  },
  // 添加更多SSL配置
  agent: false,
  rejectUnauthorized: false,
  onProxyReq: (proxyReq, req, res) => {
    console.log('代理请求:', req.method, req.url);
    // 设置请求头防止重定向
    proxyReq.setHeader('Host', 'localhost:5000');
    proxyReq.setHeader('Referer', 'https://localhost:5000');
    proxyReq.setHeader('Origin', 'https://localhost:5000');
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('代理响应:', proxyRes.statusCode);
    // 强制阻止所有重定向
    if (proxyRes.headers.location) {
      console.log('检测到重定向:', proxyRes.headers.location);
      delete proxyRes.headers.location;
      // 返回错误响应而不是重定向
      res.status(200).json({ 
        error: '重定向被阻止', 
        originalLocation: proxyRes.headers.location,
        message: 'IBKR Gateway尝试重定向到外部服务器，已阻止'
      });
      return;
    }
    
    // 如果是302重定向状态码，阻止重定向
    if (proxyRes.statusCode === 302) {
      console.log('阻止302重定向');
      res.status(200).json({ 
        error: '重定向被阻止', 
        statusCode: proxyRes.statusCode,
        message: 'IBKR Gateway尝试重定向，已阻止'
      });
      return;
    }
  },
  onError: (err, req, res) => {
    console.error('代理错误:', err);
    res.status(500).json({ error: '代理请求失败' });
  }
}));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log('代理路径: /ibkr -> https://localhost:5000/v1/api/iserver');
}); 