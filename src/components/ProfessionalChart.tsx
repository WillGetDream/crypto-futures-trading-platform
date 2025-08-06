import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Clock, Activity } from 'lucide-react';

interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

interface ProfessionalChartProps {
  data: ChartDataPoint[];
  symbol: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume24h: number;
  showVolume?: boolean;
  showMA?: boolean;
  showBollinger?: boolean;
}

export const ProfessionalChart: React.FC<ProfessionalChartProps> = ({
  data,
  symbol,
  currentPrice,
  priceChange,
  priceChangePercent,
  volume24h,
  showVolume = true,
  showMA = true,
  showBollinger = false
}) => {
  const isPositive = priceChangePercent >= 0;
  
  // 计算价格范围
  const prices = data.map(d => d.price);
  const highPrice = Math.max(...prices);
  const lowPrice = Math.min(...prices);
  const priceRange = highPrice - lowPrice;
  
  // 计算移动平均线
  const calculateMA = (period: number) => {
    const ma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ma.push(null);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.price, 0);
        ma.push(sum / period);
      }
    }
    return ma;
  };
  
  const ma5 = calculateMA(5);
  const ma10 = calculateMA(10);
  const ma20 = calculateMA(20);
  
  // 计算布林带
  const calculateBollingerBands = (period: number, multiplier: number) => {
    const upper = [];
    const lower = [];
    const middle = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(null);
        lower.push(null);
        middle.push(null);
      } else {
        const slice = data.slice(i - period + 1, i + 1);
        const prices = slice.map(d => d.price);
        const avg = prices.reduce((acc, p) => acc + p, 0) / period;
        const variance = prices.reduce((acc, p) => acc + Math.pow(p - avg, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        middle.push(avg);
        upper.push(avg + (multiplier * stdDev));
        lower.push(avg - (multiplier * stdDev));
      }
    }
    
    return { upper, lower, middle };
  };
  
  const bollinger = calculateBollingerBands(20, 2);
  
  // 生成价格刻度
  const generatePriceTicks = () => {
    const tickCount = 6;
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
    const tickCount = 5;
    const ticks = [];
    const step = Math.max(1, Math.floor(data.length / tickCount));
    
    for (let i = 0; i < data.length; i += step) {
      if (i < data.length) {
        const x = (i / Math.max(1, data.length - 1)) * 800;
        const time = data[i].time;
        ticks.push({ x, time: time.slice(0, 5) });
      }
    }
    
    if (data.length > 0) {
      const lastTime = data[data.length - 1].time;
      ticks.push({ x: 800, time: lastTime.slice(0, 5) });
    }
    
    return ticks;
  };
  
  const timeTicks = generateTimeTicks();
  
  // 计算成交量范围
  const volumes = data.map(d => d.volume);
  const maxVolume = Math.max(...volumes);
  const volumeRange = maxVolume;
  
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* 图表头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-xl font-semibold text-white">{symbol}</h2>
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
          <div>24h 最高: <span className="text-white">${highPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <div>24h 最低: <span className="text-white">${lowPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <div>24h 成交量: <span className="text-white">{volume24h > 0 ? (volume24h / 1000000000).toFixed(1) + 'B' : 'N/A'}</span></div>
        </div>
      </div>
      
      {/* 主图表区域 */}
      <div className="h-80 relative">
        <svg className="w-full h-full" viewBox="0 0 800 320">
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="priceGradientRed" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6B7280" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#6B7280" stopOpacity="0.1"/>
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
              fontSize="10"
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
              y="315"
              fill="#9CA3AF"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {tick.time}
            </text>
          ))}
          
          {/* 布林带 */}
          {showBollinger && data.length > 20 && (
            <>
              {/* 布林带上轨 */}
              <polyline
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.6"
                points={bollinger.upper.map((value, index) => {
                  if (value === null) return '';
                  const x = (index / Math.max(1, data.length - 1)) * 800;
                  const y = ((highPrice - value) / priceRange) * 200;
                  return `${x},${y}`;
                }).filter(p => p !== '').join(' ')}
              />
              
              {/* 布林带下轨 */}
              <polyline
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.6"
                points={bollinger.lower.map((value, index) => {
                  if (value === null) return '';
                  const x = (index / Math.max(1, data.length - 1)) * 800;
                  const y = ((highPrice - value) / priceRange) * 200;
                  return `${x},${y}`;
                }).filter(p => p !== '').join(' ')}
              />
            </>
          )}
          
          {/* 移动平均线 */}
          {showMA && (
            <>
              {/* MA5 */}
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1"
                opacity="0.8"
                points={ma5.map((value, index) => {
                  if (value === null) return '';
                  const x = (index / Math.max(1, data.length - 1)) * 800;
                  const y = ((highPrice - value) / priceRange) * 200;
                  return `${x},${y}`;
                }).filter(p => p !== '').join(' ')}
              />
              
              {/* MA10 */}
              <polyline
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="1"
                opacity="0.8"
                points={ma10.map((value, index) => {
                  if (value === null) return '';
                  const x = (index / Math.max(1, data.length - 1)) * 800;
                  const y = ((highPrice - value) / priceRange) * 200;
                  return `${x},${y}`;
                }).filter(p => p !== '').join(' ')}
              />
              
              {/* MA20 */}
              <polyline
                fill="none"
                stroke="#EC4899"
                strokeWidth="1"
                opacity="0.8"
                points={ma20.map((value, index) => {
                  if (value === null) return '';
                  const x = (index / Math.max(1, data.length - 1)) * 800;
                  const y = ((highPrice - value) / priceRange) * 200;
                  return `${x},${y}`;
                }).filter(p => p !== '').join(' ')}
              />
            </>
          )}
          
          {/* 价格曲线 */}
          {data.length > 1 && (
            <>
              <path
                d={`M ${data.map((point, index) => {
                  const x = (index / Math.max(1, data.length - 1)) * 800;
                  const y = ((highPrice - point.price) / priceRange) * 200;
                  return `${x},${y}`;
                }).join(' L ')} L 800,200 L 0,200 Z`}
                fill={isPositive ? "url(#priceGradient)" : "url(#priceGradientRed)"}
              />
              <polyline
                fill="none"
                stroke={isPositive ? "#10B981" : "#EF4444"}
                strokeWidth="2"
                points={data.map((point, index) => {
                  const x = (index / Math.max(1, data.length - 1)) * 800;
                  const y = ((highPrice - point.price) / priceRange) * 200;
                  return `${x},${y}`;
                }).join(' ')}
              />
            </>
          )}
          
          {/* 成交量柱状图 */}
          {showVolume && (
            <g transform="translate(0, 220)">
              {data.map((point, index) => {
                const x = (index / Math.max(1, data.length - 1)) * 800;
                const barWidth = 800 / data.length * 0.8;
                const barHeight = (point.volume / volumeRange) * 80;
                const barX = x - barWidth / 2;
                const barY = 80 - barHeight;
                
                return (
                  <rect
                    key={`volume-${index}`}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill="url(#volumeGradient)"
                    opacity="0.6"
                  />
                );
              })}
            </g>
          )}
          
          {/* 当前价格点 */}
          <circle
            cx={800}
            cy={((highPrice - currentPrice) / priceRange) * 200}
            r="4"
            fill={isPositive ? "#10B981" : "#EF4444"}
            className="animate-pulse"
          />
          
          {/* 价格点光晕效果 */}
          <circle
            cx={800}
            cy={((highPrice - currentPrice) / priceRange) * 200}
            r="8"
            fill="none"
            stroke={isPositive ? "#10B981" : "#EF4444"}
            strokeWidth="1"
            opacity="0.5"
            className="animate-ping"
          />
          
          {/* 坐标轴 */}
          <line x1="0" y1="0" x2="0" y2="200" stroke="#6B7280" strokeWidth="1" />
          <line x1="0" y1="200" x2="800" y2="200" stroke="#6B7280" strokeWidth="1" />
        </svg>
        
        {/* 图表标题 */}
        <div className="absolute top-2 left-2 text-xs text-gray-400 font-medium">
          {symbol} - 专业价格走势图
        </div>
        
        {/* 当前价格标签 */}
        <div className="absolute top-2 right-2 text-xs text-gray-400">
          <span className="font-medium">当前: </span>
          <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            ${currentPrice.toFixed(2)}
          </span>
        </div>
        
        {/* 技术指标图例 */}
        <div className="absolute bottom-2 left-2 flex space-x-4 text-xs">
          {showMA && (
            <>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span className="text-gray-400">MA5</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-purple-500"></div>
                <span className="text-gray-400">MA10</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-pink-500"></div>
                <span className="text-gray-400">MA20</span>
              </div>
            </>
          )}
          {showBollinger && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-yellow-500 border-dashed"></div>
              <span className="text-gray-400">布林带</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 图表信息栏 */}
      <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
        <div className="flex space-x-4">
          <span>数据源: TWS API</span>
          <span>更新频率: 实时</span>
          <span>技术指标: {showMA ? 'MA' : ''}{showMA && showBollinger ? ', ' : ''}{showBollinger ? '布林带' : ''}</span>
        </div>
        <div className="flex space-x-4">
          <span>价格精度: 2位小数</span>
          <span>时间格式: HH:MM</span>
        </div>
      </div>
    </div>
  );
}; 