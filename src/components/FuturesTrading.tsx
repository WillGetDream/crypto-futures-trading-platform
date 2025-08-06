import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, AlertTriangle } from 'lucide-react';
import { TradingInstrument } from '../hooks/useRealTimeData';
import { TradingViewChart } from './TradingViewChart';

interface FuturesTradingProps {
  currentPrice: number;
  selectedInstrument: TradingInstrument;
  priceChange24h: number;
  volume24h: number;
  // TWS相关数据
  twsConnected?: boolean;
  twsMarketData?: any;
  bidPrice?: number;
  askPrice?: number;
  bidSize?: number;
  askSize?: number;
}

export const FuturesTrading: React.FC<FuturesTradingProps> = ({
  currentPrice,
  selectedInstrument,
  priceChange24h,
  volume24h,
  twsConnected = false,
  twsMarketData,
  bidPrice = 0,
  askPrice = 0,
  bidSize = 0,
  askSize = 0
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
        
        {/* TWS实时数据 */}
        {twsConnected && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 mb-2 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${twsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              TWS实时数据
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-gray-400">买价</div>
                <div className="text-green-400 font-medium">${bidPrice.toFixed(2)}</div>
                <div className="text-xs text-gray-500">数量: {bidSize}</div>
              </div>
              <div>
                <div className="text-gray-400">卖价</div>
                <div className="text-red-400 font-medium">${askPrice.toFixed(2)}</div>
                <div className="text-xs text-gray-500">数量: {askSize}</div>
              </div>
              <div>
                <div className="text-gray-400">成交量</div>
                <div className="text-white font-medium">{volume24h.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400">价差</div>
                <div className="text-white font-medium">${(askPrice - bidPrice).toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
        
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

      {/* TradingView专业图表 */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">TradingView专业图表</h4>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${twsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={`text-xs ${twsConnected ? 'text-green-400' : 'text-red-400'}`}>
              {twsConnected ? 'TWS实时数据' : 'TWS未连接'}
            </span>
          </div>
        </div>
        
        <TradingViewChart 
          symbol={selectedInstrument.symbol}
          className="h-96"
        />
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
