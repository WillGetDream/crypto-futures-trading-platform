import { API_CONFIG } from '../config/api';

// TWS API服务类
export class TwsApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.TWS_API.BASE_URL;
  }

  // 健康检查
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.TWS_API.ENDPOINTS.HEALTH}`);
      return await response.json();
    } catch (error) {
      console.error('TWS API健康检查失败:', error);
      throw error;
    }
  }

  // 获取连接状态
  async getStatus() {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.TWS_API.ENDPOINTS.STATUS}`);
      return await response.json();
    } catch (error) {
      console.error('获取TWS连接状态失败:', error);
      throw error;
    }
  }

  // 连接到TWS
  async connect(host: string = 'localhost', port: number = 4002, clientId: number = 1) {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.TWS_API.ENDPOINTS.CONNECT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `host=${host}&port=${port}&clientId=${clientId}`
      });
      return await response.json();
    } catch (error) {
      console.error('TWS连接失败:', error);
      throw error;
    }
  }

  // 断开TWS连接
  async disconnect() {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.TWS_API.ENDPOINTS.DISCONNECT}`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      console.error('TWS断开连接失败:', error);
      throw error;
    }
  }

  // 获取账户摘要
  async getAccountSummary(group: string = 'All', tags: string = 'NetLiquidation,BuyingPower,TotalCashValue') {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.TWS_API.ENDPOINTS.ACCOUNT_SUMMARY}?group=${group}&tags=${tags}`);
      return await response.json();
    } catch (error) {
      console.error('获取账户摘要失败:', error);
      throw error;
    }
  }

  // 获取持仓信息
  async getPositions() {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.TWS_API.ENDPOINTS.ACCOUNT_POSITIONS}`);
      return await response.json();
    } catch (error) {
      console.error('获取持仓信息失败:', error);
      throw error;
    }
  }

  // 搜索合约
  async searchContracts(symbol: string, secType: string = 'FUT', exchange: string = 'CME', currency: string = 'USD') {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.TWS_API.ENDPOINTS.CONTRACTS_SEARCH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `symbol=${symbol}&secType=${secType}&exchange=${exchange}&currency=${currency}`
      });
      return await response.json();
    } catch (error) {
      console.error('搜索合约失败:', error);
      throw error;
    }
  }

  // 请求市场数据
  async requestMarketData(symbol: string, secType: string = 'FUT', exchange: string = 'CME', currency: string = 'USD') {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.TWS_API.ENDPOINTS.MARKET_DATA_REQUEST}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `symbol=${symbol}&secType=${secType}&exchange=${exchange}&currency=${currency}`
      });
      return await response.json();
    } catch (error) {
      console.error('请求市场数据失败:', error);
      throw error;
    }
  }

  // 取消市场数据
  async cancelMarketData(tickerId: number) {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.TWS_API.ENDPOINTS.MARKET_DATA_CANCEL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `tickerId=${tickerId}`
      });
      return await response.json();
    } catch (error) {
      console.error('取消市场数据失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
export const twsApiService = new TwsApiService(); 