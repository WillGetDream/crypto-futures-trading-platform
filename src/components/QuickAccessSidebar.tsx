import React, { useState, useEffect } from 'react';
import { Star, Settings, Plus } from 'lucide-react';

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

interface QuickAccessSidebarProps {
  onContractSelect?: (contract: ConfiguredContract) => void;
  onShowSearch?: () => void;
}

export const QuickAccessSidebar: React.FC<QuickAccessSidebarProps> = ({
  onContractSelect,
  onShowSearch
}) => {
  const [configuredContracts, setConfiguredContracts] = useState<ConfiguredContract[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // 从localStorage加载已配置的合约
  useEffect(() => {
    const loadConfiguredContracts = () => {
      const saved = localStorage.getItem('configuredContracts');
      if (saved) {
        setConfiguredContracts(JSON.parse(saved));
      }
    };

    loadConfiguredContracts();
    
    // 监听localStorage变化
    const handleStorageChange = () => {
      loadConfiguredContracts();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleContractClick = (contract: ConfiguredContract) => {
    if (onContractSelect) {
      onContractSelect(contract);
    } else {
      // 默认行为：显示合约信息
      console.log('显示合约数据:', contract);
      alert(`显示 ${contract.symbol} 的数据\n合约ID: ${contract.conid}\n交易所: ${contract.exchange}`);
    }
  };

  const handleShowSearch = () => {
    if (onShowSearch) {
      onShowSearch();
    } else {
      // 滚动到搜索管理器
      const searchManager = document.querySelector('[data-component="contract-search-manager"]');
      if (searchManager) {
        searchManager.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ${
      isExpanded ? 'w-64' : 'w-16'
    }`}>
      <div className="bg-gray-800 border-l border-gray-700 rounded-l-lg shadow-lg h-96 overflow-hidden">
        {/* 头部 */}
        <div className="bg-gray-700 p-3 border-b border-gray-600">
          <div className="flex items-center justify-between">
            {isExpanded && (
              <h3 className="text-white font-semibold text-sm flex items-center">
                <Star className="mr-2" size={16} />
                快速访问
              </h3>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-3 space-y-2">
          {/* 添加新合约按钮 */}
          <button
            onClick={handleShowSearch}
            className={`w-full flex items-center justify-center p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
              isExpanded ? 'justify-start space-x-2' : 'justify-center'
            }`}
          >
            <Plus size={16} />
            {isExpanded && <span className="text-sm">添加合约</span>}
          </button>

          {/* 已配置的合约列表 */}
          {configuredContracts.length > 0 ? (
            <div className="space-y-2">
              {configuredContracts.map((contract) => (
                <div
                  key={contract.symbol}
                  onClick={() => handleContractClick(contract)}
                  className={`cursor-pointer p-2 rounded-md hover:bg-gray-700 transition-colors ${
                    isExpanded ? 'flex items-center space-x-3' : 'flex flex-col items-center'
                  }`}
                  title={isExpanded ? undefined : `${contract.symbol} - ${contract.description}`}
                >
                  <div className={`w-8 h-8 rounded-full ${contract.color} flex items-center justify-center text-white text-sm`}>
                    {contract.icon}
                  </div>
                  {isExpanded && (
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm truncate">
                        {contract.symbol}
                      </div>
                      <div className="text-gray-400 text-xs truncate">
                        {contract.description}
                      </div>
                      {contract.lastPrice && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-300">
                            ${contract.lastPrice.toFixed(2)}
                          </span>
                          {contract.change && (
                            <span className={`text-xs ${
                              contract.change > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {contract.change > 0 ? '+' : ''}{contract.change.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center text-gray-400 text-xs ${
              isExpanded ? 'p-4' : 'p-2'
            }`}>
              {isExpanded ? (
                <div>
                  <Star className="mx-auto mb-2" size={24} />
                  <p>暂无配置的合约</p>
                  <p className="mt-1">点击上方按钮添加</p>
                </div>
              ) : (
                <Star size={16} />
              )}
            </div>
          )}
        </div>

        {/* 底部统计 */}
        {isExpanded && configuredContracts.length > 0 && (
          <div className="bg-gray-700 p-3 border-t border-gray-600">
            <div className="text-xs text-gray-400">
              已配置: {configuredContracts.length} 个合约
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 