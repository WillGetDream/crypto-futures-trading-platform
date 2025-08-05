// 合约数据库服务
// 使用 localStorage 作为简单的数据库存储

export interface ContractData {
  conid: string;
  symbol: string;
  secType: string;
  exchange: string;
  currency: string;
  description: string;
  companyHeader: string;
  companyName: string;
  sections?: any[];
  expiration?: string;
  multiplier?: string;
  maturityDate?: string;
  tradingClass?: string;
  desc1?: string;
  lastUpdated: string;
  isConfigured: boolean;
}

export interface ContractSearchResult {
  symbol: string;
  contracts: ContractData[];
  searchTime: string;
  totalCount: number;
}

export class ContractDatabase {
  private static readonly CONTRACTS_KEY = 'ibkr_contracts_database';
  private static readonly SEARCH_HISTORY_KEY = 'ibkr_search_history';
  private static readonly CONFIGURED_CONTRACTS_KEY = 'ibkr_configured_contracts';

  // 保存合约数据到数据库
  static saveContracts(symbol: string, contracts: ContractData[]): void {
    try {
      const existingData = this.getAllContracts();
      
      // 更新或添加合约数据
      contracts.forEach(contract => {
        existingData[contract.conid] = {
          ...contract,
          lastUpdated: new Date().toISOString(),
          isConfigured: existingData[contract.conid]?.isConfigured || false
        };
      });

      localStorage.setItem(this.CONTRACTS_KEY, JSON.stringify(existingData));
      
      // 保存搜索历史
      this.saveSearchHistory(symbol, contracts);
      
      console.log(`已保存 ${contracts.length} 个 ${symbol} 合约到数据库`);
    } catch (error) {
      console.error('保存合约数据失败:', error);
    }
  }

  // 从数据库获取合约数据
  static getContracts(symbol: string): ContractData[] {
    try {
      const allContracts = this.getAllContracts();
      const symbolContracts = Object.values(allContracts).filter(
        contract => contract.symbol.toUpperCase() === symbol.toUpperCase()
      );
      
      console.log(`从数据库获取到 ${symbolContracts.length} 个 ${symbol} 合约`);
      return symbolContracts;
    } catch (error) {
      console.error('获取合约数据失败:', error);
      return [];
    }
  }

  // 获取所有合约数据
  static getAllContracts(): { [conid: string]: ContractData } {
    try {
      const data = localStorage.getItem(this.CONTRACTS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('获取所有合约数据失败:', error);
      return {};
    }
  }

  // 保存搜索历史
  private static saveSearchHistory(symbol: string, contracts: ContractData[]): void {
    try {
      const history = this.getSearchHistory();
      const searchResult: ContractSearchResult = {
        symbol: symbol.toUpperCase(),
        contracts: contracts,
        searchTime: new Date().toISOString(),
        totalCount: contracts.length
      };
      
      // 更新或添加搜索历史
      history[symbol] = searchResult;
      
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }

  // 获取搜索历史
  static getSearchHistory(): { [symbol: string]: ContractSearchResult } {
    try {
      const data = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      return {};
    }
  }

  // 配置合约
  static configureContract(conid: string): void {
    try {
      const allContracts = this.getAllContracts();
      if (allContracts[conid]) {
        allContracts[conid].isConfigured = true;
        localStorage.setItem(this.CONTRACTS_KEY, JSON.stringify(allContracts));
        
        // 保存到已配置合约列表
        this.saveConfiguredContract(allContracts[conid]);
        
        console.log(`已配置合约: ${conid}`);
      }
    } catch (error) {
      console.error('配置合约失败:', error);
    }
  }

  // 取消配置合约
  static unconfigureContract(conid: string): void {
    try {
      const allContracts = this.getAllContracts();
      if (allContracts[conid]) {
        allContracts[conid].isConfigured = false;
        localStorage.setItem(this.CONTRACTS_KEY, JSON.stringify(allContracts));
        
        // 从已配置合约列表中移除
        this.removeConfiguredContract(conid);
        
        console.log(`已取消配置合约: ${conid}`);
      }
    } catch (error) {
      console.error('取消配置合约失败:', error);
    }
  }

  // 保存已配置的合约
  private static saveConfiguredContract(contract: ContractData): void {
    try {
      const configured = this.getConfiguredContracts();
      configured[contract.conid] = contract;
      localStorage.setItem(this.CONFIGURED_CONTRACTS_KEY, JSON.stringify(configured));
    } catch (error) {
      console.error('保存已配置合约失败:', error);
    }
  }

  // 移除已配置的合约
  private static removeConfiguredContract(conid: string): void {
    try {
      const configured = this.getConfiguredContracts();
      delete configured[conid];
      localStorage.setItem(this.CONFIGURED_CONTRACTS_KEY, JSON.stringify(configured));
    } catch (error) {
      console.error('移除已配置合约失败:', error);
    }
  }

  // 获取已配置的合约
  static getConfiguredContracts(): { [conid: string]: ContractData } {
    try {
      const data = localStorage.getItem(this.CONFIGURED_CONTRACTS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('获取已配置合约失败:', error);
      return {};
    }
  }

  // 检查合约是否存在
  static contractExists(conid: string): boolean {
    const allContracts = this.getAllContracts();
    return !!allContracts[conid];
  }

  // 获取合约详情
  static getContractDetails(conid: string): ContractData | null {
    const allContracts = this.getAllContracts();
    return allContracts[conid] || null;
  }

  // 清除所有数据
  static clearAllData(): void {
    try {
      localStorage.removeItem(this.CONTRACTS_KEY);
      localStorage.removeItem(this.SEARCH_HISTORY_KEY);
      localStorage.removeItem(this.CONFIGURED_CONTRACTS_KEY);
      console.log('已清除所有合约数据');
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  }

  // 获取数据库统计信息
  static getDatabaseStats(): {
    totalContracts: number;
    configuredContracts: number;
    searchHistoryCount: number;
    lastUpdated: string;
  } {
    try {
      const allContracts = this.getAllContracts();
      const configured = this.getConfiguredContracts();
      const history = this.getSearchHistory();
      
      const lastUpdated = Object.values(allContracts).reduce((latest, contract) => {
        return contract.lastUpdated > latest ? contract.lastUpdated : latest;
      }, '1970-01-01T00:00:00Z');
      
      return {
        totalContracts: Object.keys(allContracts).length,
        configuredContracts: Object.keys(configured).length,
        searchHistoryCount: Object.keys(history).length,
        lastUpdated: lastUpdated
      };
    } catch (error) {
      console.error('获取数据库统计失败:', error);
      return {
        totalContracts: 0,
        configuredContracts: 0,
        searchHistoryCount: 0,
        lastUpdated: '1970-01-01T00:00:00Z'
      };
    }
  }
} 