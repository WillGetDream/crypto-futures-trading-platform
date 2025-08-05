import express from 'express';
import https from 'https';
import cors from 'cors';

const app = express();

// 启用CORS
app.use(cors());

// 简单的代理中间件
app.use('/ibkr', async (req, res) => {
  const targetUrl = `https://localhost:5000/v1/api/iserver${req.url}`;
  
  console.log('代理请求:', req.method, targetUrl);
  
  const options = {
    method: req.method,
    headers: {
      'Host': 'localhost:5000',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    rejectUnauthorized: false // 忽略SSL证书验证
  };

  // 如果有请求体，添加到options
  if (req.method === 'POST' && req.body) {
    options.body = JSON.stringify(req.body);
  }

  const proxyReq = https.request(targetUrl, options, (proxyRes) => {
    console.log('代理响应状态:', proxyRes.statusCode);
    
    // 检查是否有重定向
    if (proxyRes.headers.location) {
      console.log('检测到重定向:', proxyRes.headers.location);
      res.status(200).json({
        error: '重定向被阻止',
        message: 'IBKR Gateway尝试重定向，已阻止',
        originalLocation: proxyRes.headers.location
      });
      return;
    }

    // 设置响应头
    res.set({
      'Content-Type': proxyRes.headers['content-type'] || 'application/json',
      'Access-Control-Allow-Origin': '*'
    });

    // 转发响应
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('代理请求错误:', err);
    res.status(500).json({ error: '代理请求失败', message: err.message });
  });

  // 如果有请求体，写入
  if (req.method === 'POST' && req.body) {
    proxyReq.write(JSON.stringify(req.body));
  }

  proxyReq.end();
});

// 解析JSON请求体
app.use(express.json());

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ 简单代理服务器运行在 http://localhost:${PORT}`);
  console.log('📡 代理路径: /ibkr -> https://localhost:5000/v1/api/iserver');
  console.log('🔒 SSL证书验证已禁用');
}); 