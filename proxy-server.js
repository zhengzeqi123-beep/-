const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors());

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.headers.authorization) {
    console.log('Authorization header present:', req.headers.authorization.substring(0, 20) + '...');
  }
  next();
});

// 代理DeepSeek API请求
app.use('/api/deepseek', createProxyMiddleware({
  target: 'https://ark.cn-beijing.volces.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/deepseek': '/api/v3'
  },
  onProxyReq: (proxyReq, req, res) => {
    // 保持原始请求头
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log('Setting Authorization header on proxy request:', proxyReq.getHeader('Authorization').substring(0, 20) + '...');
    }
    
    // 添加其他必要的头部
    proxyReq.setHeader('User-Agent', 'FactCheck-App/1.0');
    proxyReq.setHeader('Accept', 'application/json');
    
    console.log('Proxy request headers:', proxyReq.getHeaders());
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Proxy response status:', proxyRes.statusCode);
    console.log('Proxy response headers:', proxyRes.headers);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log(`DeepSeek API代理: http://localhost:${PORT}/api/deepseek/chat/completions`);
});
