// IBKR连接测试工具

export interface IBKRTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class IBKRTest {
  private host: string;
  private port: number;

  constructor(host: string = 'localhost', port: number = 4002) {
    this.host = host;
    this.port = port;
  }

  // 测试IB Gateway连接
  async testConnection(): Promise<IBKRTestResult> {
    try {
      console.log(`测试IB Gateway连接: ${this.host}:${this.port}`);
      
      const response = await fetch(`http://${this.host}:${this.port}/v1/api/one/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'IB Gateway连接成功',
          data: data
        };
      } else {
        return {
          success: false,
          message: `IB Gateway连接失败: ${response.status} ${response.statusText}`,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'IB Gateway连接失败',
        error: error.message
      };
    }
  }

  // 测试市场数据订阅
  async testMarketData(): Promise<IBKRTestResult> {
    try {
      console.log('测试市场数据订阅');
      
      // 首先检查连接
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return connectionTest;
      }

      // 测试获取MES期货数据
      const response = await fetch(`http://${this.host}:${this.port}/v1/api/iserver/marketdata/snapshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conids: [756733] // MES期货合约ID
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: '市场数据订阅成功',
          data: data
        };
      } else {
        return {
          success: false,
          message: `市场数据订阅失败: ${response.status} ${response.statusText}`,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: '市场数据订阅失败',
        error: error.message
      };
    }
  }

  // 获取可用的期货合约
  async getFuturesContracts(): Promise<IBKRTestResult> {
    try {
      console.log('获取期货合约列表');
      
      const response = await fetch(`http://${this.host}:${this.port}/v1/api/iserver/contract/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol: 'MES'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: '获取期货合约成功',
          data: data
        };
      } else {
        return {
          success: false,
          message: `获取期货合约失败: ${response.status} ${response.statusText}`,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: '获取期货合约失败',
        error: error.message
      };
    }
  }

  // 运行完整测试
  async runFullTest(): Promise<IBKRTestResult[]> {
    console.log('开始IBKR完整测试...');
    
    const results: IBKRTestResult[] = [];
    
    // 测试1: 连接测试
    const connectionResult = await this.testConnection();
    results.push(connectionResult);
    console.log('连接测试结果:', connectionResult);
    
    if (connectionResult.success) {
      // 测试2: 获取期货合约
      const contractsResult = await this.getFuturesContracts();
      results.push(contractsResult);
      console.log('期货合约测试结果:', contractsResult);
      
      // 测试3: 市场数据测试
      const marketDataResult = await this.testMarketData();
      results.push(marketDataResult);
      console.log('市场数据测试结果:', marketDataResult);
    }
    
    return results;
  }
}

// 创建测试实例
export const ibkrTest = new IBKRTest(); 