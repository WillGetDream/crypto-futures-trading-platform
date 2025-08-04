import React, { useState, useEffect } from 'react';
import { ibkrService } from '../services/ibkrService';

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
}

const DynamicContractSearch: React.FC = () => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchExchange, setSearchExchange] = useState('GLOBEX');
  const [searchCurrency, setSearchCurrency] = useState('USD');
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(null);
  const [contractDetails, setContractDetails] = useState<any>(null);

  // 常用期货符号
  const commonSymbols = ['ES', 'MES', 'NQ', 'MNQ', 'YM', 'MYM', 'RTY', 'MRTY', 'CL', 'GC', 'SI', 'ZB'];

  // 搜索合约
  const searchContracts = async () => {
    if (!searchSymbol.trim()) {
      setError('请输入合约符号');
      return;
    }

    setLoading(true);
    setError('');
    setContracts([]);
    setSelectedContract(null);
    setContractDetails(null);

    try {
      const results = await ibkrService.searchFuturesContracts(
        searchSymbol.toUpperCase(),
        searchExchange,
        searchCurrency
      );

      if (results && results.length > 0) {
        setContracts(results);
      } else {
        setError('未找到匹配的合约');
      }
    } catch (err) {
      setError(`搜索失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 获取合约详情
  const getContractDetails = async (contract: ContractInfo) => {
    setSelectedContract(contract);
    setLoading(true);
    setError('');

    try {
      // 由于合约详情API可能不可用，我们直接使用搜索结果的详细信息
      setContractDetails(contract);
      // 更新IBKR服务中的合约配置
      ibkrService.updateContract(contract.symbol, parseInt(contract.conid));
      console.log(`已选择合约: ${contract.symbol} (${contract.conid})`);
    } catch (err) {
      setError(`获取详情失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 快速选择常用合约
  const quickSelect = (symbol: string) => {
    setSearchSymbol(symbol);
    searchContracts();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">动态期货合约搜索</h2>
      
      {/* 搜索表单 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">合约符号</label>
          <input
            type="text"
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            placeholder="如: ES, MES, NQ"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">交易所</label>
          <select
            value={searchExchange}
            onChange={(e) => setSearchExchange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GLOBEX">GLOBEX (CME)</option>
            <option value="ECBOT">ECBOT (CBOT)</option>
            <option value="NYMEX">NYMEX</option>
            <option value="ICE">ICE</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">货币</label>
          <select
            value={searchCurrency}
            onChange={(e) => setSearchCurrency(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={searchContracts}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '搜索中...' : '搜索合约'}
          </button>
        </div>
      </div>

      {/* 快速选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">快速选择常用合约:</label>
        <div className="flex flex-wrap gap-2">
          {commonSymbols.map((symbol) => (
            <button
              key={symbol}
              onClick={() => quickSelect(symbol)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-md">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* 搜索结果 */}
      {contracts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">搜索结果 ({contracts.length})</h3>
          <div className="grid gap-3">
            {contracts.map((contract, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedContract?.conid === contract.conid
                    ? 'bg-blue-900 border-blue-500'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
                onClick={() => getContractDetails(contract)}
              >
                                 <div className="flex justify-between items-start">
                   <div>
                     <h4 className="text-white font-semibold">{contract.symbol}</h4>
                     <p className="text-gray-300 text-sm">{contract.companyHeader}</p>
                     <p className="text-gray-400 text-xs">{contract.companyName}</p>
                     <div className="flex gap-4 mt-2 text-xs text-gray-400">
                       <span>交易所: {contract.exchange}</span>
                       <span>货币: {contract.currency}</span>
                       <span>描述: {contract.description}</span>
                     </div>
                     {contract.sections && contract.sections.length > 0 && (
                       <div className="mt-2 text-xs text-gray-400">
                         <span>可用类型: {contract.sections.map((s: any) => s.secType).join(', ')}</span>
                       </div>
                     )}
                   </div>
                   <div className="text-right">
                     <div className="text-white font-mono">{contract.conid}</div>
                     <div className="text-gray-400 text-xs">合约ID</div>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 合约详情 */}
      {contractDetails && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">已选择合约</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">符号:</span>
              <span className="text-white ml-2 font-semibold">{contractDetails.symbol}</span>
            </div>
            <div>
              <span className="text-gray-400">合约ID:</span>
              <span className="text-white ml-2 font-mono">{contractDetails.conid}</span>
            </div>
            <div>
              <span className="text-gray-400">公司名称:</span>
              <span className="text-white ml-2">{contractDetails.companyName}</span>
            </div>
            <div>
              <span className="text-gray-400">交易所:</span>
              <span className="text-white ml-2">{contractDetails.exchange}</span>
            </div>
            <div>
              <span className="text-gray-400">描述:</span>
              <span className="text-white ml-2">{contractDetails.description}</span>
            </div>
            <div>
              <span className="text-gray-400">货币:</span>
              <span className="text-white ml-2">{contractDetails.currency}</span>
            </div>
            {contractDetails.sections && contractDetails.sections.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-gray-400">可用合约类型:</span>
                <div className="mt-2">
                  {contractDetails.sections.map((section: any, index: number) => (
                    <div key={index} className="bg-gray-600 p-2 rounded mb-2">
                      <div className="text-white font-semibold">{section.secType}</div>
                      {section.exchange && <div className="text-gray-300 text-xs">交易所: {section.exchange}</div>}
                      {section.months && <div className="text-gray-300 text-xs">月份: {section.months}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 当前配置 */}
      <div className="mt-6 bg-gray-700 p-4 rounded">
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
  );
};

export { DynamicContractSearch }; 