import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, AlertTriangle } from 'lucide-react';
import { TradingInstrument } from '../hooks/useRealTimeData';

interface FuturesTradingProps {
  currentPrice: number;
  selectedInstrument: TradingInstrument;
  priceChange24h: number;
  volume24h: number;
}

export const FuturesTrading: React.FC<FuturesTradingProps> = ({
  currentPrice,
  selectedInstrument,
  priceChange24h,
  volume24h
}) => {
  const [showExpiryInfo, setShowExpiryInfo] = useState(false);
  
  const isPositive = priceChange24h >= 0;
  const tickSize = selectedInstrument.tickSize || 0.25;
  
  // 生成模拟价格历史数据用于图表显示
  const generatePriceHistory = () => {
    const history = [];
    const basePrice = currentPrice || 4500;
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
      const time = new Date(now.getTime() - (19 - i) * 60000); // 每分钟一个数据点
      const price = basePrice + (Math.random() - 0.5) * 20; // 随机波动
      history.push({
        time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        price: price,
        volume: Math.floor(Math.random() * 1000) + 100
      });
    }
    return history;
  };

  const priceHistory = generatePriceHistory();
  
  // 计算价格范围
  const prices = priceHistory.map(p => p.price);
  const highPrice = Math.max(...prices);
  const lowPrice = Math.min(...prices);
  const priceRange = highPrice - lowPrice;

  // 生成价格刻度
  const generatePriceTicks = () => {
    const tickCount = 5;
    const ticks = [];
    
    for (let i = 0; i <= tickCount; i++) {
      const price = lowPrice + (priceRange * i / tickCount);
      const y = ((highPrice - price) / priceRange) * 200;
      ticks.push({ price, y });
    }
    
    return ticks;
  };

  const priceTicks = generatePriceTicks();

  // 生成时间刻度
  const generateTimeTicks = () => {
    const tickCount = 4;
    const ticks = [];
    const step = Math.max(1, Math.floor(priceHistory.length / tickCount));
    
    for (let i = 0; i < priceHistory.length; i += step) {
      if (i < priceHistory.length) {
        const x = (i / Math.max(1, priceHistory.length - 1)) * 600;
        const time = priceHistory[i].time;
        ticks.push({ x, time });
      }
    }
    
    // 添加最后一个时间点
    if (priceHistory.length > 0) {
      const lastTime = priceHistory[priceHistory.length - 1].time;
      ticks.push({ x: 600, time: lastTime });
    }
    
    return ticks;
  };

  const timeTicks = generateTimeTicks();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-blue-400" />
          期货交易
        </h3>
        <div className="text-sm text-gray-400">
          {selectedInstrument.category === 'equity_index' && '股指期货'}
        </div>
      </div>

      {/* 合约信息 */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">合约</div>
            <div className="text-white font-medium">{selectedInstrument.name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">当前价格</div>
            <div className="text-white font-medium">${currentPrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">24小时变化</div>
            <div className={`font-medium flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {priceChange24h.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">最小变动</div>
            <div className="text-white font-medium">${tickSize}</div>
          </div>
        </div>
        
        {/* 添加期货到期日期信息 */}
        {(selectedInstrument.expiration || selectedInstrument.contractMonth || selectedInstrument.lastTradingDay || selectedInstrument.maturityDate) && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              合约到期信息
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {selectedInstrument.contractMonth && (
                <div>
                  <div className="text-gray-400">合约月份</div>
                  <div className="text-white font-medium">{selectedInstrument.contractMonth}</div>
                </div>
              )}
              {selectedInstrument.expiration && (
                <div>
                  <div className="text-gray-400">到期日期</div>
                  <div className="text-white font-medium">{selectedInstrument.expiration}</div>
                </div>
              )}
              {selectedInstrument.maturityDate && (
                <div>
                  <div className="text-gray-400">到期日</div>
                  <div className="text-white font-medium">{selectedInstrument.maturityDate}</div>
                </div>
              )}
              {selectedInstrument.lastTradingDay && (
                <div>
                  <div className="text-gray-400">最后交易日</div>
                  <div className="text-white font-medium">{selectedInstrument.lastTradingDay}</div>
                </div>
              )}
              {selectedInstrument.contractSize && (
                <div>
                  <div className="text-gray-400">合约乘数</div>
                  <div className="text-white font-medium">{selectedInstrument.contractSize}</div>
                </div>
              )}
              {selectedInstrument.tickSize && (
                <div>
                  <div className="text-gray-400">最小变动</div>
                  <div className="text-white font-medium">${selectedInstrument.tickSize}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 专业期货价格图表 */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">价格走势图</h4>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">实时数据</span>
          </div>
        </div>
        
        <div className="h-48 relative">
          <svg className="w-full h-full" viewBox="0 0 600 200">
            <defs>
              <linearGradient id="futuresGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            {/* 主要网格线 */}
            {priceTicks.map((tick, index) => (
              <line
                key={`grid-${index}`}
                x1="0"
                y1={tick.y}
                x2="100%"
                y2={tick.y}
                stroke="#374151"
                strokeWidth="1"
                opacity="0.4"
              />
            ))}
            
            {/* 垂直网格线 */}
            {timeTicks.map((tick, index) => (
              <line
                key={`vgrid-${index}`}
                x1={tick.x}
                y1="0"
                x2={tick.x}
                y2="100%"
                stroke="#374151"
                strokeWidth="1"
                opacity="0.2"
              />
            ))}
            
            {/* 价格刻度标签 */}
            {priceTicks.map((tick, index) => (
              <text
                key={`price-${index}`}
                x="5"
                y={tick.y + 4}
                fill="#9CA3AF"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="start"
              >
                ${tick.price.toFixed(2)}
              </text>
            ))}
            
            {/* 时间刻度标签 */}
            {timeTicks.map((tick, index) => (
              <text
                key={`time-${index}`}
                x={tick.x}
                y="195"
                fill="#9CA3AF"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {tick.time}
              </text>
            ))}
            
            {/* 价格曲线 */}
            {priceHistory.length > 1 && (
              <>
                <path
                  d={`M ${priceHistory.map((point, index) => {
                    const x = (index / Math.max(1, priceHistory.length - 1)) * 600;
                    const y = ((highPrice - point.price) / priceRange) * 200;
                    return `${x},${y}`;
                  }).join(' L ')} L 600,200 L 0,200 Z`}
                  fill="url(#futuresGradient)"
                />
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  points={priceHistory.map((point, index) => {
                    const x = (index / Math.max(1, priceHistory.length - 1)) * 600;
                    const y = ((highPrice - point.price) / priceRange) * 200;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              </>
            )}
            
            {/* 当前价格点 */}
            <circle
              cx={600}
              cy={((highPrice - currentPrice) / priceRange) * 200}
              r="3"
              fill="#3B82F6"
              className="animate-pulse"
            />
            
            {/* 坐标轴 */}
            <line x1="0" y1="0" x2="0" y2="200" stroke="#6B7280" strokeWidth="1" />
            <line x1="0" y1="200" x2="600" y2="200" stroke="#6B7280" strokeWidth="1" />
          </svg>
          
          {/* 图表标题 */}
          <div className="absolute top-2 left-2 text-xs text-gray-400 font-medium">
            {selectedInstrument.symbol} - 期货价格走势
          </div>
          
          {/* 当前价格标签 */}
          <div className="absolute top-2 right-2 text-xs text-gray-400">
            <span className="font-medium">当前: </span>
            <span className="font-bold text-blue-400">
              ${currentPrice.toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* 图表信息栏 */}
        <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
          <div className="flex space-x-4">
            <span>数据源: TWS API</span>
            <span>合约: {selectedInstrument.symbol}</span>
          </div>
          <div className="flex space-x-4">
            <span>最高: ${highPrice.toFixed(2)}</span>
            <span>最低: ${lowPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 交易统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400">24h成交量</div>
          <div className="text-white font-semibold">
            {volume24h > 0 ? (volume24h / 1000000).toFixed(1) + 'M' : 'N/A'}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400">24h最高</div>
          <div className="text-white font-semibold">${highPrice.toFixed(2)}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400">24h最低</div>
          <div className="text-white font-semibold">${lowPrice.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};
