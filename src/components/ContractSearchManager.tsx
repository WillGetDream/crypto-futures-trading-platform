import React, { useState, useEffect } from 'react';
import { Search, Settings, Star, TrendingUp, Zap, Target, BarChart3, Database, RefreshCw } from 'lucide-react';
import { ibkrService } from '../services/ibkrService';
import { ContractDatabase, ContractData } from '../services/contractDatabase';

interface ContractInfo {
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
}

interface ConfiguredContract {
  symbol: string;
  conid: string;
  description: string;
  exchange: string;
  type: 'futures' | 'crypto' | 'stock';
  icon: string;
  color: string;
  lastPrice?: number;
  change?: number;
}

export const ContractSearchManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContractInfo[]>([]);
  const [configuredContracts, setConfiguredContracts] = useState<ConfiguredContract[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(null);
  const [showConfiguredOnly, setShowConfiguredOnly] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [databaseStats, setDatabaseStats] = useState<any>(null);
  const [showDatabaseInfo, setShowDatabaseInfo] = useState(false);

  // 合约图标映射
  const contractIcons: { [key: string]: { icon: string; color: string } } = {
    'MES': { icon: '📈', color: 'bg-blue-500' },
    'MNQ': { icon: '🚀', color: 'bg-green-500' },
    'ES': { icon: '📊', color: 'bg-purple-500' },
    'NQ': { icon: '⚡', color: 'bg-yellow-500' },
    'YM': { icon: '🎯', color: 'bg-red-500' },
    'MYM': { icon: '🎯', color: 'bg-red-400' },
    'RTY': { icon: '📉', color: 'bg-orange-500' },
    'MRTY': { icon: '📉', color: 'bg-orange-400' },
    'CL': { icon: '🛢️', color: 'bg-black' },
    'GC': { icon: '🥇', color: 'bg-yellow-400' },
    'SI': { icon: '🥈', color: 'bg-gray-400' },
    'ZB': { icon: '📋', color: 'bg-blue-400' },
    'BTC': { icon: '₿', color: 'bg-orange-500' },
    'ETH': { icon: 'Ξ', color: 'bg-blue-500' },
    'default': { icon: '📈', color: 'bg-gray-500' }
  };

  // 常用搜索词
  const commonSearches = ['MES', 'MNQ', 'ES', 'NQ', 'YM', 'MYM', 'RTY', 'MRTY', 'CL', 'GC', 'SI', 'ZB'];

  // 从localStorage加载已配置的合约
  useEffect(() => {
    const saved = localStorage.getItem('configuredContracts');
    if (saved) {
      setConfiguredContracts(JSON.parse(saved));
    }
  }, []);

  // 保存配置到localStorage
  const saveConfiguredContracts = (contracts: ConfiguredContract[]) => {
    localStorage.setItem('configuredContracts', JSON.stringify(contracts));
    setConfiguredContracts(contracts);
  };

  // 搜索合约
  const searchContracts = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      setError('请输入搜索关键词');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResults([]);
    setHasSearched(true);

    try {
      console.log('搜索合约:', searchTerm.toUpperCase());
      const results = await ibkrService.searchFuturesContracts(
        searchTerm.toUpperCase(),
        'CME',
        'USD'
      );

      if (results && results.length > 0) {
        setSearchResults(results);
        console.log('搜索结果:', results);
        // 清除错误信息
        setError('');
      } else {
        setError(`未找到匹配的合约 "${searchTerm}"。请尝试其他符号如: MES, MNQ, ES, NQ`);
      }
    } catch (err) {
      console.error('搜索出错:', err);
      setError(`搜索失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsSearching(false);
    }
  };

  // 配置合约
  const configureContract = (contract: ContractInfo) => {
    const iconInfo = contractIcons[contract.symbol] || contractIcons.default;
    
    const newConfiguredContract: ConfiguredContract = {
      symbol: contract.symbol,
      conid: contract.conid,
      description: contract.description || contract.companyHeader,
      exchange: contract.exchange,
      type: 'futures',
      icon: iconInfo.icon,
      color: iconInfo.color,
      lastPrice: Math.random() * 1000 + 5000, // 模拟价格
      change: (Math.random() - 0.5) * 10 // 模拟涨跌幅
    };

    const updated = [...configuredContracts, newConfiguredContract];
    saveConfiguredContracts(updated);
    
    // 更新IBKR服务配置和数据库
    ibkrService.updateContract(contract.symbol, parseInt(contract.conid));
    ibkrService.configureContract(contract.conid);
    
    console.log(`已配置合约: ${contract.symbol} (${contract.conid})`);
  };

  // 移除配置的合约
  const removeConfiguredContract = (symbol: string) => {
    const updated = configuredContracts.filter(c => c.symbol !== symbol);
    saveConfiguredContracts(updated);
  };

  // 快速搜索
  const quickSearch = (symbol: string) => {
    setSearchQuery(symbol);
    // 清除之前的搜索结果
    setSearchResults([]);
    setError('');
    searchContracts(symbol);
  };

  // 显示合约数据
  const showContractData = (contract: ConfiguredContract) => {
    // 这里可以触发显示合约数据的逻辑
    console.log('显示合约数据:', contract);
    alert(`显示 ${contract.symbol} 的数据\n合约ID: ${contract.conid}\n交易所: ${contract.exchange}`);
  };

  // 自动搜索常用合约 - 只在页面首次加载时执行
  useEffect(() => {
    const hasInitialized = localStorage.getItem('searchManagerInitialized');
    if (!hasInitialized && configuredContracts.length === 0 && !hasSearched) {
      // 标记已初始化
      localStorage.setItem('searchManagerInitialized', 'true');
      // 自动搜索一些常用合约
      setTimeout(() => {
        searchContracts('MES');
      }, 1000);
    }
  }, [hasSearched]); // 依赖hasSearched状态

  return (
    <div className="bg-gray-800 rounded-lg p-6" data-component="contract-search-manager">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Search className="mr-2" size={24} />
          合约搜索管理器
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConfiguredOnly(!showConfiguredOnly)}
            className={`px-3 py-1 rounded text-sm ${
              showConfiguredOnly 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {showConfiguredOnly ? '显示全部' : '仅显示已配置'}
          </button>
          <button
            onClick={() => {
              setSearchResults([]);
              setError('');
              setSearchQuery('');
              setHasSearched(false);
              localStorage.removeItem('searchManagerInitialized');
            }}
            className="px-3 py-1 bg-gray-600 text-gray-300 rounded text-sm hover:bg-gray-500"
            title="清除搜索历史"
          >
            清除
          </button>
          <button
            onClick={() => {
              setShowDatabaseInfo(!showDatabaseInfo);
              setDatabaseStats(ibkrService.getDatabaseStats());
            }}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-500"
            title="数据库信息"
          >
            <Database size={14} className="inline mr-1" />
            数据库
          </button>
        </div>
      </div>

      {/* 搜索区域 */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchContracts()}
              placeholder="搜索合约符号 (如: MES, MNQ, ES, NQ)"
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => searchContracts()}
            disabled={isSearching}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? '搜索中...' : '搜索'}
          </button>
        </div>

        {/* 快速搜索按钮 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">快速搜索:</label>
          <div className="flex flex-wrap gap-2">
            {commonSearches.map((symbol) => (
              <button
                key={symbol}
                onClick={() => quickSearch(symbol)}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-md">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* 已配置的合约 */}
      {configuredContracts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Star className="mr-2" size={20} />
            已配置的合约 ({configuredContracts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {configuredContracts.map((contract) => (
              <div
                key={contract.symbol}
                className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => showContractData(contract)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full ${contract.color} flex items-center justify-center text-white text-lg`}>
                      {contract.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{contract.symbol}</h4>
                      <p className="text-gray-400 text-xs">{contract.exchange}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeConfiguredContract(contract.symbol);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm text-gray-300 mb-2">
                  {contract.description}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">ID: {contract.conid}</span>
                  {contract.lastPrice && (
                    <span className={`font-mono ${contract.change && contract.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${contract.lastPrice.toFixed(2)}
                      {contract.change && (
                        <span className="ml-1">
                          {contract.change > 0 ? '+' : ''}{contract.change.toFixed(2)}%
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {!showConfiguredOnly && searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <TrendingUp className="mr-2" size={20} />
            搜索结果 ({searchResults.length})
          </h3>
          <div className="grid gap-3">
            {searchResults.map((contract, index) => (
              <div
                key={index}
                className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${contractIcons[contract.symbol]?.color || contractIcons.default.color} flex items-center justify-center text-white text-lg`}>
                      {contractIcons[contract.symbol]?.icon || contractIcons.default.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">{contract.symbol}</h4>
                      <p className="text-gray-300 text-sm">{contract.companyHeader}</p>
                      <p className="text-gray-400 text-xs">{contract.companyName}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        <span>交易所: {contract.exchange}</span>
                        <span>货币: {contract.currency}</span>
                        <span>ID: {contract.conid}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => configureContract(contract)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-1"
                    >
                      <Settings size={16} />
                      <span>配置</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 数据库信息 */}
      {showDatabaseInfo && databaseStats && (
        <div className="bg-green-900 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <Database className="mr-2" size={20} />
            数据库统计信息
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-300">总合约数:</span>
              <span className="text-white ml-2 font-semibold">{databaseStats.totalContracts}</span>
            </div>
            <div>
              <span className="text-gray-300">已配置:</span>
              <span className="text-white ml-2 font-semibold">{databaseStats.configuredContracts}</span>
            </div>
            <div>
              <span className="text-gray-300">搜索历史:</span>
              <span className="text-white ml-2 font-semibold">{databaseStats.searchHistoryCount}</span>
            </div>
            <div>
              <span className="text-gray-300">最后更新:</span>
              <span className="text-white ml-2 text-xs">{new Date(databaseStats.lastUpdated).toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => {
                ContractDatabase.clearAllData();
                setDatabaseStats(ibkrService.getDatabaseStats());
                setConfiguredContracts([]);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              清除数据库
            </button>
            <button
              onClick={() => {
                setDatabaseStats(ibkrService.getDatabaseStats());
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              <RefreshCw size={14} className="inline mr-1" />
              刷新
            </button>
          </div>
        </div>
      )}

      {/* 当前配置状态 */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <BarChart3 className="mr-2" size={20} />
          当前IBKR配置
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(ibkrService.getContractConfig()).map(([symbol, conid]) => (
            <div key={symbol} className="flex items-center justify-between">
              <span className="text-gray-300">{symbol}:</span>
              <span className="text-white font-mono">{conid}</span>
            </div>
          ))}
          {Object.keys(ibkrService.getContractConfig()).length === 0 && (
            <div className="text-gray-400 col-span-2">暂无配置的合约</div>
          )}
        </div>
      </div>
    </div>
  );
}; 