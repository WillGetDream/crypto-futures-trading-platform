import React, { useState, useEffect } from 'react';
import { ibkrService, IBKRMarketData } from '../services/ibkrService';

export const IBKRTest: React.FC = () => {
  const [mesData, setMesData] = useState<IBKRMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMESData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 确保IBKR连接
      await ibkrService.connect();
      
      // 获取MES数据
      const data = await ibkrService.getContractData('MES');
      setMesData(data);
      
      if (!data) {
        setError('无法获取MES数据');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMESData();
    
    // 每30秒更新一次数据
    const interval = setInterval(fetchMESData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">IBKR实时数据测试</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchMESData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '获取中...' : '刷新MES数据'}
          </button>
          
          <div className="text-sm text-gray-400">
            连接状态: {ibkrService.getConnectionStatus() ? '✅ 已连接' : '❌ 未连接'}
          </div>
        </div>

        {error && (
          <div className="bg-red-900 text-red-200 p-3 rounded">
            错误: {error}
          </div>
        )}

        {mesData && (
          <div className="bg-gray-700 p-4 rounded">
            <h3 className="text-lg font-semibold text-white mb-2">MES实时数据</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">价格:</span>
                <span className="text-white ml-2">${mesData.price.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">买价:</span>
                <span className="text-green-400 ml-2">${mesData.bid.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">卖价:</span>
                <span className="text-red-400 ml-2">${mesData.ask.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">成交量:</span>
                <span className="text-white ml-2">{mesData.volume.toLocaleString()}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">时间:</span>
                <span className="text-white ml-2">{new Date(mesData.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 