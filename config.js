// 事实核查应用配置文件
const config = {
  // DeepSeek API配置
  deepseek: {
    // 请替换为你的真实API密钥
    // 格式应该是: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    apiKey: '55847add-4d3e-47da-9468-a17741c1fca1',
    
    // API端点
    baseUrl: 'https://ark.cn-beijing.volces.com',
    model: 'deepseek-r1-250528',
    
    // 代理服务器配置
    proxyUrl: 'http://localhost:3001/api/deepseek/chat/completions'
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
  if (!config.deepseek.apiKey || config.deepseek.apiKey === 'api-key-20250812140810') {
    console.error('❌ API密钥未配置！');
    console.log('请按以下步骤配置：');
    console.log('1. 访问 DeepSeek 官网获取API密钥');
    console.log('2. 修改 config.js 文件中的 apiKey 值');
    console.log('3. 重启应用');
    return false;
  }
  
  // 检查API密钥格式
  if (!config.deepseek.apiKey.startsWith('sk-')) {
    console.warn('⚠️  API密钥格式可能不正确，通常应该以 "sk-" 开头');
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
