import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, Activity } from 'lucide-react';

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

interface ContractDataViewerProps {
  contract: ConfiguredContract | null;
  isVisible: boolean;
  onClose: () => void;
}

export const ContractDataViewer: React.FC<ContractDataViewerProps> = ({
  contract,
  isVisible,
  onClose
}) => {
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 模拟获取市场数据
  useEffect(() => {
    if (contract && isVisible) {
      setIsLoading(true);
      
      // 模拟API调用延迟
      setTimeout(() => {
        const mockData = {
          symbol: contract.symbol,
          lastPrice: contract.lastPrice || Math.random() * 1000 + 5000,
          bid: (contract.lastPrice || Math.random() * 1000 + 5000) - Math.random() * 10,
          ask: (contract.lastPrice || Math.random() * 1000 + 5000) + Math.random() * 10,
          change: contract.change || (Math.random() - 0.5) * 10,
          changePercent: contract.change || (Math.random() - 0.5) * 10,
          volume: Math.floor(Math.random() * 10000),
          openInterest: Math.floor(Math.random() * 5000),
          high: (contract.lastPrice || Math.random() * 1000 + 5000) + Math.random() * 50,
          low: (contract.lastPrice || Math.random() * 1000 + 5000) - Math.random() * 50,
          open: (contract.lastPrice || Math.random() * 1000 + 5000) + (Math.random() - 0.5) * 20,
          timestamp: new Date().toISOString(),
          exchange: contract.exchange,
          contractId: contract.conid
        };
        
        setMarketData(mockData);
        setIsLoading(false);
      }, 1000);
    }
  }, [contract, isVisible]);

  if (!isVisible || !contract) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full ${contract.color} flex items-center justify-center text-white text-2xl`}>
              {contract.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{contract.symbol}</h2>
              <p className="text-gray-400 text-sm">{contract.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-white">加载市场数据...</span>
            </div>
          ) : marketData ? (
            <div className="space-y-6">
              {/* 价格信息 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="mr-2" size={20} />
                  价格信息
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">最新价格</div>
                    <div className="text-2xl font-bold text-white">
                      ${marketData.lastPrice.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">涨跌幅</div>
                    <div className={`text-lg font-semibold flex items-center ${
                      marketData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {marketData.changePercent >= 0 ? (
                        <TrendingUp className="mr-1" size={16} />
                      ) : (
                        <TrendingDown className="mr-1" size={16} />
                      )}
                      {marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">涨跌额</div>
                    <div className={`text-lg font-semibold ${
                      marketData.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">成交量</div>
                    <div className="text-lg font-semibold text-white">
                      {marketData.volume.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 买卖盘 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="mr-2" size={20} />
                  买卖盘
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">买价</div>
                    <div className="text-lg font-semibold text-green-400">
                      ${marketData.bid.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">卖价</div>
                    <div className="text-lg font-semibold text-red-400">
                      ${marketData.ask.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 交易统计 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Activity className="mr-2" size={20} />
                  交易统计
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">开盘价</div>
                    <div className="text-white font-semibold">
                      ${marketData.open.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">最高价</div>
                    <div className="text-white font-semibold">
                      ${marketData.high.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">最低价</div>
                    <div className="text-white font-semibold">
                      ${marketData.low.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">未平仓量</div>
                    <div className="text-white font-semibold">
                      {marketData.openInterest.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 合约信息 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Clock className="mr-2" size={20} />
                  合约信息
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">合约ID</div>
                    <div className="text-white font-mono">{marketData.contractId}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">交易所</div>
                    <div className="text-white">{marketData.exchange}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">合约类型</div>
                    <div className="text-white capitalize">{contract.type}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">更新时间</div>
                    <div className="text-white text-sm">
                      {new Date(marketData.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              无法加载市场数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 