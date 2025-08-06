import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, TrendingUp, TrendingDown, DollarSign, BarChart3, Volume2 } from 'lucide-react';
import { twsApiService } from '../services/twsApiService';

interface LiveDataIndicatorProps {
  symbol?: string;
  className?: string;
}

export const LiveDataIndicator: React.FC<LiveDataIndicatorProps> = ({ 
  symbol = 'MES',
  className = ""
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [bid, setBid] = useState<number | null>(null);
  const [ask, setAsk] = useState<number | null>(null);
  const [volume, setVolume] = useState<number | null>(null);
  const [bidSize, setBidSize] = useState<number | null>(null);
  const [askSize, setAskSize] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  // 检查TWS API连接状态
  const checkConnection = async () => {
    try {
      const status = await twsApiService.getStatus();
      setIsConnected(status.connected || false);
      setIsLoading(false);
    } catch (error) {
      console.error('检查TWS连接状态失败:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  };

  // 监听实时数据更新事件
  useEffect(() => {
    const handleMarketDataUpdate = (event: CustomEvent) => {
      const { symbol: eventSymbol, marketData } = event.detail;
      
      if (eventSymbol === symbol) {
        console.log('收到实时数据更新:', eventSymbol, marketData);
        
        // 保存前一个价格用于计算变化
        if (lastPrice && lastPrice > 0) {
          setPreviousPrice(lastPrice);
        }
        
        if (marketData.lastPrice && marketData.lastPrice > 0) {
          setLastPrice(marketData.lastPrice);
          
          // 计算价格变化
          if (previousPrice && previousPrice > 0) {
            const change = marketData.lastPrice - previousPrice;
            const changePercent = (change / previousPrice) * 100;
            setPriceChange(change);
            setPriceChangePercent(changePercent);
          }
        }
        
        if (marketData.bid && marketData.bid > 0) {
          setBid(marketData.bid);
        }
        if (marketData.ask && marketData.ask > 0) {
          setAsk(marketData.ask);
        }
        if (marketData.volume) {
          setVolume(marketData.volume);
        }
        if (marketData.bidSize) {
          setBidSize(marketData.bidSize);
        }
        if (marketData.askSize) {
          setAskSize(marketData.askSize);
        }
        setLastUpdate(new Date());
      }
    };

    // 监听WebSocket消息
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'marketData' && data.symbol === symbol) {
          console.log('WebSocket实时数据:', data);
          
          const marketData = data.data;
          
          // 保存前一个价格用于计算变化
          if (lastPrice && lastPrice > 0) {
            setPreviousPrice(lastPrice);
          }
          
          if (marketData.lastPrice && marketData.lastPrice > 0) {
            setLastPrice(marketData.lastPrice);
            
            // 计算价格变化
            if (previousPrice && previousPrice > 0) {
              const change = marketData.lastPrice - previousPrice;
              const changePercent = (change / previousPrice) * 100;
              setPriceChange(change);
              setPriceChangePercent(changePercent);
            }
          }
          
          if (marketData.bid && marketData.bid > 0) {
            setBid(marketData.bid);
          }
          if (marketData.ask && marketData.ask > 0) {
            setAsk(marketData.ask);
          }
          if (marketData.volume) {
            setVolume(marketData.volume);
          }
          if (marketData.bidSize) {
            setBidSize(marketData.bidSize);
          }
          if (marketData.askSize) {
            setAskSize(marketData.askSize);
          }
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error);
      }
    };

    // 添加事件监听器
    window.addEventListener('marketDataUpdated', handleMarketDataUpdate as EventListener);
    
    // 尝试连接WebSocket
    try {
      const ws = new WebSocket('ws://localhost:8080/ws/market-data');
      ws.onmessage = handleWebSocketMessage;
      ws.onopen = () => {
        console.log('WebSocket连接已建立');
        setIsConnected(true);
      };
      ws.onclose = () => {
        console.log('WebSocket连接已关闭');
        setIsConnected(false);
      };
      ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('WebSocket连接失败:', error);
    }

    return () => {
      window.removeEventListener('marketDataUpdated', handleMarketDataUpdate as EventListener);
    };
  }, [symbol, lastPrice, previousPrice]);

  // 定期检查连接状态
  useEffect(() => {
    checkConnection();
    
    const interval = setInterval(checkConnection, 10000); // 每10秒检查一次
    return () => clearInterval(interval);
  }, []);

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 获取价格变化颜色
  const getPriceChangeColor = () => {
    if (priceChange > 0) return 'text-green-500';
    if (priceChange < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  // 获取价格变化图标
  const getPriceChangeIcon = () => {
    if (priceChange > 0) return <TrendingUp className="w-5 h-5" />;
    if (priceChange < 0) return <TrendingDown className="w-5 h-5" />;
    return null;
  };

  return (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl ${className}`}>
      {/* 头部状态栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
          <span className="text-lg font-semibold text-white">
            {isLoading ? '检查连接...' : isConnected ? '实时数据已连接' : '实时数据未连接'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <span className="text-sm text-gray-400">
            {lastUpdate ? formatTime(lastUpdate) : '--:--:--'}
          </span>
        </div>
      </div>

      {isConnected && lastPrice && (
        <div className="space-y-6">
          {/* 主要价格显示 - 类似moomoo风格 */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <span className="text-4xl font-bold text-white">
                ${lastPrice.toFixed(2)}
              </span>
              <div className={`flex items-center space-x-1 text-lg font-semibold ${getPriceChangeColor()}`}>
                {getPriceChangeIcon()}
                <span>{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}</span>
                <span>({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {symbol} 期货合约
            </div>
          </div>

          {/* 买卖盘信息 - 更大更清晰 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-lg font-semibold text-green-400">买价</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {bid ? `$${bid.toFixed(2)}` : '--'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                数量: {bidSize ? bidSize.toLocaleString() : '--'}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-lg font-semibold text-red-400">卖价</span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                {ask ? `$${ask.toFixed(2)}` : '--'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                数量: {askSize ? askSize.toLocaleString() : '--'}
              </div>
            </div>
          </div>

          {/* 成交量信息 */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center space-x-2 mb-3">
              <Volume2 className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-semibold text-white">成交量</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {volume ? volume.toLocaleString() : '--'}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              实时更新
            </div>
          </div>

          {/* 连接状态指示器 */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span>实时数据流活跃</span>
          </div>
        </div>
      )}

      {!isConnected && !isLoading && (
        <div className="text-center py-8">
          <div className="text-xl text-gray-400 mb-2">实时数据未连接</div>
          <div className="text-sm text-gray-500">
            请确保TWS API服务正在运行
          </div>
          <button 
            onClick={checkConnection}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新连接
          </button>
        </div>
      )}
    </div>
  );
};