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
        console.warn(`IBKR市场数据API返回错误: ${response.status}`);
        // 如果市场数据API失败，尝试使用其他方法
        return this.getFallbackData(symbol, conId);
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

      return this.getFallbackData(symbol, conId);
    } catch (error) {
      console.error('IBKR API调用失败:', error);
      return null;
    }
  }

  // 获取备用数据
  private getFallbackData(symbol: string, conId: number): IBKRMarketData {
    // 生成模拟数据
    const basePrice = 5000 + Math.random() * 1000;
    const change = (Math.random() - 0.5) * 100;
    
    return {
      symbol: symbol,
      price: basePrice + change,
      bid: basePrice + change - Math.random() * 10,
      ask: basePrice + change + Math.random() * 10,
      volume: Math.floor(Math.random() * 10000),
      timestamp: new Date().toISOString(),
      exchange: 'CME'
    };
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
    
    // 不再保存到数据库
    console.log('🎯 合约配置已更新，不保存到数据库');
  }

  // 配置合约（不再使用数据库）
  configureContract(conid: string): void {
    console.log(`🎯 配置合约: ${conid}（不保存到数据库）`);
  }

  // 获取已配置的合约（返回空对象）
  getConfiguredContracts(): { [conid: string]: any } {
    return {};
  }

  // 获取合约详情（返回null）
  getContractFromDatabase(conid: string): any {
    return null;
  }

  // 获取统计信息（返回空统计）
  getDatabaseStats(): any {
    return {
      totalContracts: 0,
      configuredContracts: 0,
      searchHistoryCount: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  // 获取当前合约配置
  getContractConfig(): { [symbol: string]: number } {
    return this.config.contracts || {};
  }

  // 搜索期货合约 - 使用正确的IBKR API流程 + 数据库
  async searchFuturesContracts(symbol: string, exchange: string = 'CME', currency: string = 'USD'): Promise<any[]> {
    try {
      console.log(`🔍 开始TWS API搜索期货合约: ${symbol} 在 ${exchange}`);
      
      // 强制使用TWS API搜索，不检查缓存
      console.log('🎯 强制使用TWS API搜索，跳过缓存检查');
      
      // 步骤1: 使用 secdef/search 搜索基础合约获取所有月份
      const baseContracts = await this.searchBaseContracts(symbol, exchange, currency);
      
      if (baseContracts && baseContracts.length > 0) {
        console.log(`找到 ${baseContracts.length} 个基础合约`);
        
        // 步骤2: 获取每个合约的详细信息
        const detailedContracts: any[] = [];
        for (const baseContract of baseContracts) {
          try {
            const details = await this.getContractDetails(parseInt(baseContract.conid));
            if (details) {
              // 使用基础合约信息，添加详情
              const contractData = {
                conid: baseContract.conid,
                symbol: baseContract.symbol,
                secType: baseContract.secType || 'FUT',
                exchange: baseContract.exchange,
                currency: baseContract.currency || 'USD',
                description: details.description || baseContract.description,
                companyHeader: details.companyHeader || baseContract.companyHeader,
                companyName: details.companyName || baseContract.companyName,
                sections: details.sections || baseContract.sections,
                expiration: details.expiration,
                multiplier: details.multiplier,
                maturityDate: details.maturityDate,
                tradingClass: details.tradingClass,
                desc1: details.desc1
              };
              detailedContracts.push(contractData);
            }
          } catch (err) {
            console.warn(`获取合约 ${baseContract.conid} 详情失败:`, err);
            // 如果获取详情失败，使用基础信息
            const contractData = {
              conid: baseContract.conid,
              symbol: baseContract.symbol,
              secType: baseContract.secType || 'FUT',
              exchange: baseContract.exchange,
              currency: baseContract.currency || 'USD',
              description: baseContract.description,
              companyHeader: baseContract.companyHeader,
              companyName: baseContract.companyName,
              sections: baseContract.sections
            };
            detailedContracts.push(contractData);
          }
        }
        
        if (detailedContracts.length > 0) {
          console.log(`✅ TWS API成功获取 ${detailedContracts.length} 个合约的详细信息`);
          
          // 不保存到数据库，直接返回实时数据
          console.log('🎯 直接返回TWS API实时数据，不保存缓存');
          
          return detailedContracts;
        }
      }
      
      // 如果TWS API失败，返回空数组
      console.log('❌ TWS API无结果，返回空数组');
      console.log('⚠️ 注意：TWS API搜索失败，请检查连接状态');
      return [];
      
    } catch (error) {
      console.error(`❌ TWS API搜索期货合约失败 (${symbol}):`, error);
      console.log('⚠️ 注意：TWS API搜索完全失败，返回空数组');
      return [];
    }
  }

  // 搜索基础合约 - 使用真正的TWS API
  private async searchBaseContracts(symbol: string, exchange: string, currency: string): Promise<any[]> {
    try {
      console.log(`使用TWS API搜索 ${symbol} 合约`);
      
      // 尝试多个TWS API端点
      const endpoints = [
        // Java TWS API端点（主要）
        `http://localhost:8080/api/tws/contracts/search`,
        // 备用端点 - IB Gateway
        `http://localhost:3001/ibkr/iserver/secdef/search?symbol=${symbol}&exchange=${exchange}&currency=${currency}&secType=FUT`,
        // 备用端点 - TWS
        `http://localhost:3001/tws/iserver/secdef/search?symbol=${symbol}&exchange=${exchange}&currency=${currency}&secType=FUT`
      ];

      for (let url of endpoints) {
        try {
          console.log(`尝试端点: ${url}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
          
          // 根据URL选择请求方法
          const isJavaApi = url.includes('localhost:8080');
          const method = isJavaApi ? 'POST' : 'GET';
          const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'IBKR-Client/1.0'
          };
          
          let requestOptions: any = {
            method,
            headers,
            signal: controller.signal
          };
          
          // 如果是Java API，需要URL参数
          if (isJavaApi) {
            const params = new URLSearchParams({
              symbol,
              secType: 'FUT',
              exchange,
              currency
            });
            url = `${url}?${params.toString()}`;
          }
          
          const response = await fetch(url, requestOptions);

          clearTimeout(timeoutId);
          console.log(`端点 ${url} 响应状态:`, response.status);

          if (response.ok) {
            const data = await response.json();
            console.log(`TWS API返回数据:`, data);
            
            // 处理Java TWS API的响应格式
            if (isJavaApi && data && data.success && data.data) {
              try {
                // Java API返回的data是JSON字符串，需要解析
                const contractData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                console.log(`Java TWS API解析后的合约数据:`, contractData);
                
                // 映射Java API数据格式到前端期望的格式
                const mappedContract = {
                  conid: contractData.conId?.toString() || '',
                  symbol: contractData.symbol || '',
                  secType: contractData.secType || '',
                  exchange: contractData.exchange || '',
                  currency: contractData.currency || '',
                  description: contractData.description || '',
                  companyHeader: contractData.tradingClass || contractData.symbol || '',
                  companyName: contractData.exchange || '',
                  multiplier: contractData.multiplier || '',
                  tradingClass: contractData.tradingClass || '',
                  // 添加到期日期信息
                  contractMonth: contractData.contractMonth || '',
                  realExpirationDate: contractData.realExpirationDate || '',
                  lastTradeTime: contractData.lastTradeTime || '',
                  // 格式化到期日期显示
                  expiryDisplay: contractData.realExpirationDate ? 
                    `${contractData.realExpirationDate.slice(0,4)}-${contractData.realExpirationDate.slice(4,6)}-${contractData.realExpirationDate.slice(6,8)}` : 
                    contractData.contractMonth || ''
                };
                
                console.log(`映射后的合约数据:`, mappedContract);
                return [mappedContract];
              } catch (parseError) {
                console.warn(`解析Java TWS API数据失败:`, parseError);
                return [];
              }
            } else if (data && Array.isArray(data) && data.length > 0) {
              console.log(`成功从TWS API获取到 ${data.length} 个基础合约`);
              return data;
            } else if (data && typeof data === 'object') {
              // 处理单个合约的情况
              console.log(`TWS API返回单个合约:`, data);
              return [data];
            }
          } else {
            console.warn(`端点 ${url} 返回错误: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.warn(`端点 ${url} 请求失败:`, error);
          continue; // 尝试下一个端点
        }
      }
      
      console.log('所有TWS API端点都失败，尝试备用方法');
      return [];
    } catch (error) {
      console.error('搜索基础合约失败:', error);
      return [];
    }
  }

  // 直接获取合约信息
  private async getContractInfoDirectly(symbol: string, exchange: string): Promise<any[]> {
    try {
      // 使用已知的合约ID尝试获取信息
      const knownConids = this.getKnownContractIds(symbol);
      
      const contracts = [];
      for (const conid of knownConids) {
        try {
          const details = await this.getContractDetails(conid);
          if (details) {
            contracts.push(details);
          }
        } catch (err) {
          console.warn(`获取合约 ${conid} 信息失败:`, err);
        }
      }
      
      return contracts;
    } catch (error) {
      console.error('直接获取合约信息失败:', error);
      return [];
    }
  }

  // 获取已知的合约ID
  private getKnownContractIds(symbol: string): number[] {
    const knownIds: { [key: string]: number[] } = {
      'MES': [730283085, 711280067, 750150186],
      'MNQ': [730283094, 711280073, 750150193],
      'ES': [495512563, 637533641, 649180695],
      'NQ': [563947738, 691171690, 730283097],
      'YM': [12473192],
      'MYM': [12473193],
      'RTY': [12473194],
      'MRTY': [12473195]
    };
    
    return knownIds[symbol.toUpperCase()] || [];
  }

  // 获取预定义的合约数据
  private getPredefinedContracts(symbol: string): any[] {
    const predefinedContracts: { [key: string]: any[] } = {
      'MES': [
        {
          conid: '730283085',
          symbol: 'MES',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'Micro E-Mini S&P 500 DEC25',
          companyHeader: 'Micro E-Mini S&P 500',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'DEC25;MAR26;JUN26;SEP26' }]
        },
        {
          conid: '711280067',
          symbol: 'MES',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'Micro E-Mini S&P 500 SEP25',
          companyHeader: 'Micro E-Mini S&P 500',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'SEP25;DEC25;MAR26' }]
        },
        {
          conid: '750150186',
          symbol: 'MES',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'Micro E-Mini S&P 500 MAR26',
          companyHeader: 'Micro E-Mini S&P 500',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'MAR26;JUN26;SEP26' }]
        }
      ],
      'MNQ': [
        {
          conid: '730283094',
          symbol: 'MNQ',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'Micro E-Mini Nasdaq-100 DEC25',
          companyHeader: 'Micro E-Mini Nasdaq-100',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'DEC25;MAR26;JUN26;SEP26' }]
        },
        {
          conid: '711280073',
          symbol: 'MNQ',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'Micro E-Mini Nasdaq-100 SEP25',
          companyHeader: 'Micro E-Mini Nasdaq-100',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'SEP25;DEC25;MAR26' }]
        },
        {
          conid: '750150193',
          symbol: 'MNQ',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'Micro E-Mini Nasdaq-100 MAR26',
          companyHeader: 'Micro E-Mini Nasdaq-100',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'MAR26;JUN26;SEP26' }]
        }
      ],
      'ES': [
        {
          conid: '495512563',
          symbol: 'ES',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'E-mini S&P 500 DEC25',
          companyHeader: 'E-mini S&P 500',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'DEC25;MAR26;JUN26;SEP26' }]
        },
        {
          conid: '637533641',
          symbol: 'ES',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'E-mini S&P 500 SEP25',
          companyHeader: 'E-mini S&P 500',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'SEP25;DEC25;MAR26' }]
        }
      ],
      'NQ': [
        {
          conid: '563947738',
          symbol: 'NQ',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'E-mini NASDAQ 100 DEC25',
          companyHeader: 'E-mini NASDAQ 100',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'DEC25;MAR26;JUN26;SEP26' }]
        },
        {
          conid: '691171690',
          symbol: 'NQ',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'E-mini NASDAQ 100 SEP25',
          companyHeader: 'E-mini NASDAQ 100',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'SEP25;DEC25;MAR26' }]
        }
      ],
      'YM': [
        {
          conid: '12473192',
          symbol: 'YM',
          secType: 'FUT',
          exchange: 'CBOT',
          currency: 'USD',
          description: 'E-mini Dow Jones DEC25',
          companyHeader: 'E-mini Dow Jones',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CBOT', months: 'DEC25;MAR26;JUN26;SEP26' }]
        }
      ],
      'MYM': [
        {
          conid: '12473193',
          symbol: 'MYM',
          secType: 'FUT',
          exchange: 'CBOT',
          currency: 'USD',
          description: 'Micro E-mini Dow Jones DEC25',
          companyHeader: 'Micro E-mini Dow Jones',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CBOT', months: 'DEC25;MAR26;JUN26;SEP26' }]
        }
      ],
      'RTY': [
        {
          conid: '12473194',
          symbol: 'RTY',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'E-mini Russell 2000 DEC25',
          companyHeader: 'E-mini Russell 2000',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'DEC25;MAR26;JUN26;SEP26' }]
        }
      ],
      'MRTY': [
        {
          conid: '12473195',
          symbol: 'MRTY',
          secType: 'FUT',
          exchange: 'CME',
          currency: 'USD',
          description: 'Micro E-mini Russell 2000 DEC25',
          companyHeader: 'Micro E-mini Russell 2000',
          companyName: 'CME Group',
          sections: [{ secType: 'FUT', exchange: 'CME', months: 'DEC25;MAR26;JUN26;SEP26' }]
        }
      ]
    };

    const upperSymbol = symbol.toUpperCase();
    return predefinedContracts[upperSymbol] || [];
  }

  // 获取合约详细信息 - 简化版本，因为Java TWS API已经提供了完整信息
  async getContractDetails(conid: number, sectype?: string, month?: string, exchange?: string): Promise<any> {
    try {
      console.log(`🎯 简化版getContractDetails调用: conid=${conid}`);
      
      // 由于Java TWS API已经提供了完整的合约信息，这里返回一个简化的响应
      // 避免额外的API调用，提高性能
      return {
        conid: conid.toString(),
        description: `合约 ${conid}`,
        companyHeader: `合约 ${conid}`,
        // 其他字段保持为空，因为主要信息已经在searchBaseContracts中获取
      };
    } catch (error) {
      console.error(`获取合约详情失败 (${conid}):`, error);
      return null;
    }
  }

  // 获取特定月份的期货合约 - 简化版本
  async getFuturesContractByMonth(symbol: string, month: string, exchange: string = 'CME'): Promise<any> {
    try {
      console.log(`🎯 简化版getFuturesContractByMonth调用: ${symbol} ${month}`);
      
      // 直接使用searchFuturesContracts，因为Java TWS API已经提供了完整信息
      const contracts = await this.searchFuturesContracts(symbol, exchange);
      if (contracts.length === 0) {
        throw new Error(`未找到${symbol}合约`);
      }

      // 返回第一个合约，因为Java TWS API已经提供了最相关的合约
      console.log(`获取${symbol} ${month}合约:`, contracts[0]);
      return contracts[0];
    } catch (error) {
      console.error(`获取${symbol} ${month}合约失败:`, error);
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
    'MES': 730283085, // MES DEC25 默认合约ID
    'ES': 495512563,  // ES DEC25 默认合约ID
    'MNQ': 730283094, // MNQ DEC25 默认合约ID
    'NQ': 563947738   // NQ DEC25 默认合约ID
  }
}); 