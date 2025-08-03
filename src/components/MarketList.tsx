import React from 'react';
import { TrendingUp, TrendingDown, Bitcoin } from 'lucide-react';
import { CryptoOption, PriceData } from '../hooks/useRealTimeData';

interface MarketListProps {
  currentPrice: number;
  priceHistory: PriceData[];
  selectedCrypto: CryptoOption;
  priceChange24h: number;
}

export const MarketList: React.FC<MarketListProps> = ({ 
  currentPrice, 
  priceHistory, 
  selectedCrypto, 
  priceChange24h 
}) => {
  
  const previousPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = priceChange24h || ((priceChange / previousPrice) * 100);
  const isPositive = priceChangePercent >= 0;
  
  const high24h = Math.max(...priceHistory.map(p => p.price));
  const low24h = Math.min(...priceHistory.map(p => p.price));
  const volume24h = priceHistory.reduce((sum, p) => sum + p.volume, 0);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bitcoin className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-white">比特币行情</h2>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                <Bitcoin className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-white">{selectedCrypto.symbol}</div>
                <div className="text-sm text-gray-400">{selectedCrypto.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">${currentPrice.toLocaleString()}</div>
              <div className={`flex items-center justify-end space-x-1 ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-medium">
                  {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">24h 最高</div>
              <div className="text-white font-medium">${high24h.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">24h 最低</div>
              <div className="text-white font-medium">${low24h.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">24h 成交量</div>
              <div className="text-white font-medium">{(volume24h / 1000000000).toFixed(1)}B</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <h3 className="text-white font-medium mb-3">价格统计</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">当前价格</span>
              <span className="text-white">${currentPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">价格变化</span>
              <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                {isPositive ? '+' : ''}${Math.abs(priceChange).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">变化百分比</span>
              <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};