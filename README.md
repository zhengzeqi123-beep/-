# 事实核查应用 - 方舟 Ark Chat Completions 集成

本应用的「查个究竟」功能现已改为直接调用方舟 Ark Chat Completions 接口，无需本地代理端口。

## 快速配置

1. 在 `config.js` 中设置：
   - `config.ark.apiKey`: 你的方舟 API Key
   - `config.ark.model`: 你的 Model ID（示例：`doubao-seed-1-6-250615`）
2. 启动静态服务器打开页面（任意静态服务或用浏览器直接打开 `index.html`）。

> 注意：直接从本地文件协议或自建静态服务发起跨域请求通常可行；若遇到 CORS，请通过支持 CORS 的托管或反向代理解决。

## 运行

```bash
python3 -m http.server 8000
# 在浏览器访问 http://localhost:8000
```

## 文件结构
```
├── index.html          # 前端页面
├── styles.css          # 样式文件
├── app.js              # 前端逻辑
├── config.js           # Ark 配置（API Key、Base URL、Model）
└── README.md           # 说明文档
```

## API 配置说明
- 基础地址：`https://ark.cn-beijing.volces.com/api/v3`
- 鉴权方式：请求头 `Authorization: Bearer <ARK_API_KEY>`
- Chat Completions 路径：`/chat/completions`

## 常见问题

- 未配置 API Key：打开控制台可见 `Ark API Key 未配置` 提示，请在 `config.js` 中填写。
- CORS：若静态资源服务带来跨域限制，建议使用允许跨域的静态托管或反向代理。
