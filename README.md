# 事实核查应用 - DeepSeek R1 API集成

## 问题说明
由于浏览器的CORS（跨域资源共享）策略限制，直接从前端调用DeepSeek API会被阻止。错误信息：
```
Access to fetch at 'https://ark.cn-beijing.volces.com/api/v3/chat/completions' from origin 'null' has been blocked by CORS policy
```

## 解决方案
使用本地代理服务器来转发API请求，解决CORS问题。

## 安装和启动步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 启动代理服务器
```bash
npm start
```
或者开发模式（自动重启）：
```bash
npm run dev
```

### 3. 启动前端应用
```bash
python3 -m http.server 8000
```

### 4. 访问应用
- 前端应用：http://localhost:8000
- 代理服务器：http://localhost:3001
- 健康检查：http://localhost:3001/health

## 文件结构
```
├── index.html          # 前端页面
├── styles.css          # 样式文件
├── app.js             # 前端逻辑
├── proxy-server.js    # 代理服务器
├── package.json       # Node.js依赖
└── README.md          # 说明文档
```

## API配置
- **模型**: deepseek-r1-250528
- **API密钥**: api-key-20250812140810
- **代理端点**: http://localhost:3001/api/deepseek/chat/completions

## 故障排除

### 代理服务器无法启动
1. 检查端口3001是否被占用
2. 确认Node.js已安装
3. 检查依赖是否正确安装

### API调用仍然失败
1. 确认代理服务器正在运行
2. 检查浏览器控制台错误信息
3. 验证API密钥是否有效

### 网络错误
1. 检查防火墙设置
2. 确认网络连接正常
3. 验证API端点是否可访问

## 注意事项
- 代理服务器仅用于开发环境
- 生产环境建议使用专业的反向代理服务
- 请妥善保管API密钥，不要提交到版本控制系统
