import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PriceData, CryptoOption } from '../hooks/useRealTimeData';

interface PriceChartProps {
  currentPrice: number;
  priceHistory: PriceData[];
  selectedCrypto: CryptoOption;
  priceChange24h: number;
  volume24h: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  currentPrice,
  priceHistory,
  selectedCrypto,
  priceChange24h,
  volume24h
}) => {
  
  // 如果没有历史数据，创建一些基础数据点
  const displayHistory = priceHistory.length > 0 ? priceHistory : [
    { time: new Date().toLocaleTimeString(), price: currentPrice, volume: 0 }
  ];
  
  const previousPrice = displayHistory.length > 1 ? displayHistory[displayHistory.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = priceChange24h || ((priceChange / previousPrice) * 100);
  const isPositive = priceChangePercent >= 0;
  
  // 计算价格范围，确保数据有效
  const validPrices = displayHistory.map(p => p.price).filter(p => p > 0 && !isNaN(p));
  const safeCurrentPrice = currentPrice > 0 && !isNaN(currentPrice) ? currentPrice : 0;
  
  let high24h, low24h;
  if (validPrices.length > 0) {
    high24h = Math.max(...validPrices);
    low24h = Math.min(...validPrices);
  } else if (safeCurrentPrice > 0) {
    high24h = safeCurrentPrice * 1.02;
    low24h = safeCurrentPrice * 0.98;
  } else {
    high24h = 100;
    low24h = 90;
  }
  
  // 确保价格范围有效
  if (high24h === low24h) {
    high24h = low24h * 1.01;
  }
  
  const displayVolume24h = volume24h || displayHistory.reduce((sum, p) => sum + (p.volume || 0), 0);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-xl font-semibold text-white">{selectedCrypto.symbol}</h2>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">实时</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-white">
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
              isPositive ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
            }`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="font-medium">
                {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-right text-gray-400">
          <div>24h 最高: <span className="text-white">${high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <div>24h 最低: <span className="text-white">${low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <div>24h 成交量: <span className="text-white">{displayVolume24h > 0 ? (displayVolume24h / 1000000000).toFixed(1) + 'B' : 'N/A'}</span></div>
        </div>
      </div>
      
      <div className="h-64 relative">
        <svg className="w-full h-full" viewBox="0 0 800 256">
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* 网格线 */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              x1="0"
              y1={i * 51.2}
              x2="100%"
              y2={i * 51.2}
              stroke="#374151"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* 价格曲线 */}
          {displayHistory.length > 0 && currentPrice > 0 && (
            <>
              {displayHistory.length > 1 ? (
                <>
                  <path
                    d={`M ${displayHistory.map((point, index) => {
                      const x = (index / Math.max(1, displayHistory.length - 1)) * 800;
                      const priceRange = high24h - low24h;
                      const safePrice = point.price > 0 && !isNaN(point.price) ? point.price : safeCurrentPrice;
                      const y = priceRange > 0 ? ((high24h - safePrice) / priceRange) * 256 : 128;
                      const safeY = Math.max(0, Math.min(256, isNaN(y) ? 128 : y));
                      return `${x},${safeY}`;
                    }).join(' L ')} L 800,256 L 0,256 Z`}
                    fill="url(#priceGradient)"
                  />
                  <polyline
                    fill="none"
                    stroke={isPositive ? "#10B981" : "#EF4444"}
                    strokeWidth="2"
                    points={displayHistory.map((point, index) => {
                      const x = (index / Math.max(1, displayHistory.length - 1)) * 800;
                      const priceRange = high24h - low24h;
                      const safePrice = point.price > 0 && !isNaN(point.price) ? point.price : safeCurrentPrice;
                      const y = priceRange > 0 ? ((high24h - safePrice) / priceRange) * 256 : 128;
                      const safeY = Math.max(0, Math.min(256, isNaN(y) ? 128 : y));
                      return `${x},${safeY}`;
                    }).join(' ')}
                  />
                </>
              ) : (
                // 如果只有一个数据点，显示一条水平线
                <line
                  x1="0"
                  y1="128"
                  x2="800"
                  y2="128"
                  stroke={isPositive ? "#10B981" : "#EF4444"}
                  strokeWidth="2"
                />
              )}
              {/* 当前价格点 */}
              <circle
                cx={displayHistory.length > 1 ? 800 : 400}
                cy={(() => {
                  if (displayHistory.length > 1 && safeCurrentPrice > 0) {
                    const priceRange = high24h - low24h;
                    const y = priceRange > 0 ? ((high24h - safeCurrentPrice) / priceRange) * 256 : 128;
                    return Math.max(0, Math.min(256, isNaN(y) ? 128 : y));
                  }
                  return 128;
                })()}
                r="4"
                fill={isPositive ? "#10B981" : "#EF4444"}
                className="animate-pulse"
              />
            </>
          )}
        </svg>
        
        {/* 时间轴 */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-sm text-gray-400">
          {displayHistory.length > 1 ? (
            displayHistory.slice(-5).map((point, index) => (
              <span key={index}>{point.time.slice(0, 5)}</span>
            ))
          ) : (
            <span className="mx-auto">实时</span>
          )}
        </div>
      </div>
    </div>
  );
};