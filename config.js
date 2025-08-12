// 事实核查应用配置文件
const config = {
  // 方舟 Ark Chat Completions 配置
  ark: {
    // 请替换为你的真实方舟 API Key（建议通过更安全方式注入，前端存放仅用于演示/开发）
    apiKey: '55847add-4d3e-47da-9468-a17741c1fca1',
    // Ark 基础地址（v3）
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    // 默认模型，可在此替换为你的 Model ID，例如：doubao-pro-32k、deepseek-r1-250528 等
    model: 'deepseek-r1-250528'
  },

  // 应用配置
  app: {
    name: '事实核查',
    version: '1.0.0',
    debug: true
  }
};

// 检查API密钥是否配置
function validateConfig() {
  if (!config.ark || !config.ark.apiKey) {
    console.error('❌ Ark API Key 未配置！');
    console.log('请按以下步骤配置：');
    console.log('1. 在方舟控制台创建 API Key');
    console.log('2. 将 API Key 填入 config.js 的 config.ark.apiKey');
    console.log('3. 可按需替换 config.ark.model 为你的 Model ID');
    return false;
  }
  console.log('✅ 配置验证通过');
  return true;
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config, validateConfig };
} else {
  window.config = config;
  window.validateConfig = validateConfig;
}
