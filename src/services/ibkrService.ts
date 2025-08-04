// IBKR API服务
// 注意：IBKR需要TWS或IB Gateway运行，并且需要配置API访问

export interface IBKRConfig {
  host: string;
  port: number;
  clientId: number;
  contracts?: {
    [symbol: string]: number; // 合约符号到合约ID的映射
  };
}

export interface IBKRMarketData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: string;
  exchange: string;
}

export class IBKRService {
  private config: IBKRConfig;
  private isConnected: boolean = false;
  private socket: WebSocket | null = null;

  constructor(config: IBKRConfig) {
    this.config = config;
  }

  // 连接到IBKR TWS/Gateway
  async connect(): Promise<boolean> {
    try {
      // 检查IB Gateway是否运行
      const isGatewayRunning = await this.checkGatewayConnection();
      if (isGatewayRunning) {
        console.log('IB Gateway连接成功');
        this.isConnected = true;
        return true;
      } else {
        console.log('IB Gateway未运行，使用备用数据源');
        return false;
      }
    } catch (error) {
      console.error('IBKR连接失败:', error);
      return false;
    }
  }

  // 检查IB Gateway连接状态
  private async checkGatewayConnection(): Promise<boolean> {
    try {
      // IB Gateway REST API v1 端点列表
      // 参考: https://www.interactivebrokers.com/api/doc.html
      const endpoints = [
        // 基础连接测试
        `/v1/api/one/user`,
        `/v1/api/iserver/auth/status`,
        
        // 账户信息
        `/v1/api/iserver/account`,
        `/v1/api/iserver/accounts`,
        
        // 市场数据
        `/v1/api/iserver/marketdata/snapshot`,
        `/v1/api/iserver/marketdata/unsubscribeall`,
        
        // 合约信息
        `/v1/api/iserver/contract/search`,
        `/v1/api/iserver/contract/{conid}/info`,
        
        // 订单管理
        `/v1/api/iserver/orders`,
        `/v1/api/iserver/orders/{orderId}`,
        
        // 投资组合
        `/v1/api/iserver/portfolio/accounts`,
        `/v1/api/iserver/portfolio/{accountId}/positions`
      ];

      console.log('开始测试IB Gateway REST API v1连接...');
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时
          
          const url = `https://${this.config.host}:${this.config.port}${endpoint}`;
          console.log(`测试端点: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'IBKR-Client/1.0'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            console.log(`✅ IB Gateway连接成功，端点: ${endpoint}`);
            return true;
          } else {
            console.log(`⚠️ 端点 ${endpoint} 返回状态: ${response.status}`);
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log(`⏰ 端点 ${endpoint} 连接超时`);
          } else {
            console.log(`❌ 端点 ${endpoint} 连接失败:`, error);
          }
          continue;
        }
      }
      
      console.log('❌ 所有IB Gateway端点都连接失败');
      return false;
    } catch (error) {
      console.log('❌ IB Gateway连接检查失败，可能未运行或端口不同');
      return false;
    }
  }

  // 订阅MES期货实时数据
  async subscribeMESData(): Promise<IBKRMarketData | null> {
    return this.getContractData('MES');
  }

  // 获取指定合约的实时数据
  async getContractData(symbol: string): Promise<IBKRMarketData | null> {
    if (!this.isConnected) {
      console.warn('IBKR未连接，无法获取实时数据');
      return null;
    }

    try {
      // 从IBKR获取实时合约数据
      const ibkrData = await this.fetchContractFromIBKR(symbol);
      if (ibkrData) {
        console.log(`从IBKR获取到${symbol}数据:`, ibkrData);
        return ibkrData;
      }
      
      console.warn(`IBKR ${symbol} 数据获取失败`);
      return null;
    } catch (error) {
      console.error(`获取${symbol}数据失败:`, error);
      return null;
    }
  }

  // 从IBKR获取指定合约数据
  private async fetchContractFromIBKR(symbol: string): Promise<IBKRMarketData | null> {
    try {
      // 获取配置的合约ID
      const conId = this.getContractId(symbol);
      if (!conId) {
        console.error(`未配置${symbol}合约ID`);
        return null;
      }

      // 使用IBKR REST API获取合约数据
      const response = await fetch(`https://${this.config.host}:${this.config.port}/v1/api/iserver/marketdata/snapshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conids: [conId]
        })
      });

      if (!response.ok) {
        throw new Error(`IBKR API请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const contractData = data[0];
        return {
          symbol: symbol,
          price: parseFloat(contractData.price) || 0,
          bid: parseFloat(contractData.bid) || 0,
          ask: parseFloat(contractData.ask) || 0,
          volume: parseInt(contractData.volume) || 0,
          timestamp: new Date().toISOString(),
          exchange: 'CME'
        };
      }

      return null;
    } catch (error) {
      console.error('IBKR API调用失败:', error);
      return null;
    }
  }

  // 获取合约ID
  private getContractId(symbol: string): number | null {
    if (this.config.contracts && this.config.contracts[symbol]) {
      return this.config.contracts[symbol];
    }
    return null;
  }

  // 更新合约配置
  updateContract(symbol: string, conid: number): void {
    if (!this.config.contracts) {
      this.config.contracts = {};
    }
    this.config.contracts[symbol] = conid;
    console.log(`更新合约配置: ${symbol} = ${conid}`);
  }

  // 获取当前合约配置
  getContractConfig(): { [symbol: string]: number } {
    return this.config.contracts || {};
  }

  // 搜索期货合约
  async searchFuturesContracts(symbol: string, exchange: string = 'GLOBEX', currency: string = 'USD'): Promise<any[]> {
    try {
      const url = `https://${this.config.host}:${this.config.port}/v1/api/iserver/secdef/search`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol,
          secType: 'FUT',
          exchange: exchange,
          currency: currency
        })
      });

      if (!response.ok) {
        throw new Error(`搜索合约失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`搜索期货合约结果 (${symbol}):`, data);
      return data || [];
    } catch (error) {
      console.error(`搜索期货合约失败 (${symbol}):`, error);
      return [];
    }
  }

  // 获取合约详细信息
  async getContractDetails(conid: number): Promise<any> {
    try {
      const url = `https://${this.config.host}:${this.config.port}/v1/api/iserver/secdef/details?conid=${conid}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`获取合约详情失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`合约详情 (${conid}):`, data);
      return data;
    } catch (error) {
      console.error(`获取合约详情失败 (${conid}):`, error);
      return null;
    }
  }





  // 断开连接
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// 创建默认的IBKR服务实例
export const ibkrService = new IBKRService({
  host: import.meta.env.VITE_IBKR_HOST || '127.0.0.1',
  port: parseInt(import.meta.env.VITE_IBKR_PORT || '5000'),
  clientId: 0,
  contracts: {
    'MES': 756733, // MES DEC24 默认合约ID
    'MNQ': 756734, // MNQ DEC24 默认合约ID
    'MYM': 756735, // MYM DEC24 默认合约ID
    'MRTY': 756736 // MRTY DEC24 默认合约ID
  }
}); 