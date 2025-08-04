import React, { useState, useEffect } from 'react';
import { ibkrService } from '../services/ibkrService';

interface ContractInfo {
  conid: number;
  symbol: string;
  description: string;
  exchange: string;
  secType: string;
  expiry?: string;
}

export const ContractConfig: React.FC = () => {
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchSymbol, setSearchSymbol] = useState('MES');

  // 预定义的期货合约信息（基于常见配置）
  const predefinedContracts: ContractInfo[] = [
    // MES合约
    { conid: 756733, symbol: 'MES', description: 'E-mini S&P 500 DEC24', exchange: 'CME', secType: 'FUT', expiry: '2024-12-20' },
    { conid: 756734, symbol: 'MES', description: 'E-mini S&P 500 MAR25', exchange: 'CME', secType: 'FUT', expiry: '2025-03-21' },
    { conid: 756735, symbol: 'MES', description: 'E-mini S&P 500 JUN25', exchange: 'CME', secType: 'FUT', expiry: '2025-06-20' },
    { conid: 756736, symbol: 'MES', description: 'E-mini S&P 500 SEP25', exchange: 'CME', secType: 'FUT', expiry: '2025-09-19' },
    
    // MNQ合约
    { conid: 756737, symbol: 'MNQ', description: 'E-mini NASDAQ-100 DEC24', exchange: 'CME', secType: 'FUT', expiry: '2024-12-20' },
    { conid: 756738, symbol: 'MNQ', description: 'E-mini NASDAQ-100 MAR25', exchange: 'CME', secType: 'FUT', expiry: '2025-03-21' },
    
    // MYM合约
    { conid: 756739, symbol: 'MYM', description: 'E-mini Dow Jones DEC24', exchange: 'CME', secType: 'FUT', expiry: '2024-12-20' },
    { conid: 756740, symbol: 'MYM', description: 'E-mini Dow Jones MAR25', exchange: 'CME', secType: 'FUT', expiry: '2025-03-21' },
    
    // MRTY合约
    { conid: 756741, symbol: 'MRTY', description: 'E-mini Russell 2000 DEC24', exchange: 'CME', secType: 'FUT', expiry: '2024-12-20' },
    { conid: 756742, symbol: 'MRTY', description: 'E-mini Russell 2000 MAR25', exchange: 'CME', secType: 'FUT', expiry: '2025-03-21' },
  ];

  const searchContracts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 过滤预定义合约
      const filteredContracts = predefinedContracts.filter(
        contract => contract.symbol.toUpperCase().includes(searchSymbol.toUpperCase())
      );
      
      setContracts(filteredContracts);
      
      if (filteredContracts.length === 0) {
        setError(`未找到 ${searchSymbol} 相关的合约`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败');
    } finally {
      setIsLoading(false);
    }
  };

  const selectContract = (contract: ContractInfo) => {
    setSelectedContract(contract);
    // 更新IBKR服务的合约配置
    ibkrService.updateContract(contract.symbol, contract.conid);
    console.log('选择的合约:', contract);
  };

  const testContract = async (contract: ContractInfo) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 确保IBKR连接
      await ibkrService.connect();
      
      // 获取合约数据
      const data = await ibkrService.getContractData(contract.symbol);
      
      if (data) {
        alert(`合约 ${contract.symbol} 测试成功！\n价格: $${data.price.toFixed(2)}`);
      } else {
        setError(`无法获取 ${contract.symbol} 的数据`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '测试失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    searchContracts();
  }, [searchSymbol]);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">期货合约配置</h2>
      
      <div className="space-y-4">
        {/* 搜索框 */}
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            placeholder="输入合约符号 (如: MES, MNQ, MYM)"
            className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={searchContracts}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '搜索中...' : '搜索'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900 text-red-200 p-3 rounded">
            错误: {error}
          </div>
        )}

        {/* 合约列表 */}
        {contracts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">可用合约:</h3>
            <div className="grid gap-2">
              {contracts.map((contract) => (
                <div
                  key={contract.conid}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedContract?.conid === contract.conid
                      ? 'bg-blue-600 border-blue-400'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                  onClick={() => selectContract(contract)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        {contract.symbol} - {contract.description}
                      </div>
                      <div className="text-sm text-gray-400">
                        合约ID: {contract.conid} | 交易所: {contract.exchange}
                        {contract.expiry && ` | 到期日: ${contract.expiry}`}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        testContract(contract);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      测试
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 选中的合约信息 */}
        {selectedContract && (
          <div className="bg-blue-900 p-4 rounded">
            <h3 className="text-lg font-semibold text-white mb-2">选中的合约:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">符号:</span>
                <span className="text-white ml-2">{selectedContract.symbol}</span>
              </div>
              <div>
                <span className="text-gray-300">合约ID:</span>
                <span className="text-white ml-2">{selectedContract.conid}</span>
              </div>
              <div>
                <span className="text-gray-300">描述:</span>
                <span className="text-white ml-2">{selectedContract.description}</span>
              </div>
              <div>
                <span className="text-gray-300">交易所:</span>
                <span className="text-white ml-2">{selectedContract.exchange}</span>
              </div>
              {selectedContract.expiry && (
                <div>
                  <span className="text-gray-300">到期日:</span>
                  <span className="text-white ml-2">{selectedContract.expiry}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 当前配置 */}
        <div className="bg-gray-700 p-4 rounded">
          <h3 className="text-lg font-semibold text-white mb-2">当前配置:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(ibkrService.getContractConfig()).map(([symbol, conid]) => (
              <div key={symbol}>
                <span className="text-gray-300">{symbol}:</span>
                <span className="text-white ml-2">{conid}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 