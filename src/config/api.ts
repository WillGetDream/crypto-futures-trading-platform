// API配置文件
export const API_CONFIG = {
  // Java TWS API后端
  TWS_API: {
    BASE_URL: 'http://localhost:8080/api/tws',
    ENDPOINTS: {
      HEALTH: '/health',
      STATUS: '/status',
      CONNECT: '/connect',
      DISCONNECT: '/disconnect',
      ACCOUNT_SUMMARY: '/account/summary',
      ACCOUNT_POSITIONS: '/account/positions',
      CONTRACTS_SEARCH: '/contracts/search',
      MARKET_DATA_REQUEST: '/market-data/request',
      MARKET_DATA_CANCEL: '/market-data/cancel'
    }
  },
  
  // Alpha Vantage API - 免费版每天500次请求
  // 注册地址: https://www.alphavantage.co/support/#api-key
  ALPHA_VANTAGE: {
    API_KEY: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo',
    BASE_URL: 'https://www.alphavantage.co/query',
    RATE_LIMIT: 500 // 每天请求限制
  },
  
  // Yahoo Finance API - 免费，无需密钥
  YAHOO_FINANCE: {
    BASE_URL: 'https://query1.finance.yahoo.com/v8/finance/chart',
    RATE_LIMIT: 1000 // 每天请求限制
  },
  
  // CoinGecko API - 免费，无需密钥
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    RATE_LIMIT: 50 // 每分钟请求限制
  },
  
  // 期货合约符号映射
  FUTURES_SYMBOLS: {
    'mes': 'ES=F',    // E-mini S&P 500
    'mnq': 'NQ=F',    // E-mini NASDAQ-100  
    'mym': 'YM=F',    // E-mini Dow Jones
    'mrty': 'RTY=F'   // E-mini Russell 2000
  },
  
  // 加密货币ID映射
  CRYPTO_IDS: {
    'bitcoin': 'bitcoin',
    'ethereum': 'ethereum', 
    'binancecoin': 'binancecoin',
    'cardano': 'cardano',
    'solana': 'solana',
    'ripple': 'ripple',
    'dogecoin': 'dogecoin',
    'polkadot': 'polkadot'
  }
};

// API请求工具函数
export const apiUtils = {
  // 添加请求延迟以避免速率限制
  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  // 检查API响应状态
  checkResponse(response: Response) {
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    return response;
  },
  
  // 解析JSON响应
  async parseJson(response: Response) {
    try {
      return await response.json();
    } catch (error) {
      throw new Error(`JSON解析失败: ${error}`);
    }
  }
}; 