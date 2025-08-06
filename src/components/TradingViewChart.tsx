import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Volume2 } from 'lucide-react';

interface TradingViewChartProps {
  symbol?: string;
  className?: string;
}

declare global {
  interface Window {
    LightweightCharts: any;
  }
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol = 'MES',
  className = ""
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [isChartLoaded, setIsChartLoaded] = useState(false);

  // 加载TradingView库
  useEffect(() => {
    const loadTradingViewLibrary = () => {
      if (window.LightweightCharts) {
        setIsChartLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js';
      script.onload = () => {
        setIsChartLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load TradingView library');
      };
      document.head.appendChild(script);
    };

    loadTradingViewLibrary();
  }, []);

  // 初始化图表
  useEffect(() => {
    if (!isChartLoaded || !chartContainerRef.current || !window.LightweightCharts) {
      return;
    }

    const chartContainer = chartContainerRef.current;
    
    // 创建图表
    chartRef.current = window.LightweightCharts.createChart(chartContainer, {
      width: chartContainer.clientWidth,
      height: 400,
      layout: {
        background: { color: 'rgba(15, 20, 25, 0.8)' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      crosshair: {
        mode: window.LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        timeVisible: true,
        secondsVisible: true,
      },
    });

    // 创建K线图系列
    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff4757',
      borderDownColor: '#ff4757',
      borderUpColor: '#00ff88',
      wickDownColor: '#ff4757',
      wickUpColor: '#00ff88',
    });

    // 创建成交量系列
    volumeSeriesRef.current = chartRef.current.addHistogramSeries({
      color: '#3742fa',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // 响应式调整
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainer.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [isChartLoaded]);

  // 监听实时数据更新
  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'marketData' && data.symbol === symbol) {
          const marketData = data.data;
          updateChart(marketData.lastPrice, marketData.volume);
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error);
      }
    };

    const handleMarketDataUpdate = (event: CustomEvent) => {
      const { symbol: eventSymbol, marketData } = event.detail;
      if (eventSymbol === symbol) {
        updateChart(marketData.lastPrice, marketData.volume);
      }
    };

    // 添加事件监听器
    window.addEventListener('marketDataUpdated', handleMarketDataUpdate as EventListener);
    
    // 尝试连接WebSocket
    try {
      const ws = new WebSocket('ws://localhost:8080/ws/market-data');
      ws.onmessage = handleWebSocketMessage;
      ws.onopen = () => {
        console.log('TradingView图表WebSocket连接已建立');
      };
      ws.onclose = () => {
        console.log('TradingView图表WebSocket连接已关闭');
      };
      ws.onerror = (error) => {
        console.error('TradingView图表WebSocket连接错误:', error);
      };
    } catch (error) {
      console.error('TradingView图表WebSocket连接失败:', error);
    }

    return () => {
      window.removeEventListener('marketDataUpdated', handleMarketDataUpdate as EventListener);
    };
  }, [symbol]);

  const updateChart = (price: number, volume: number) => {
    if (price <= 0 || !candlestickSeriesRef.current) return;

    const now = Math.floor(Date.now() / 1000);
    const currentMinute = Math.floor(now / 60) * 60;

    setPriceHistory(prevHistory => {
      // 查找当前分钟的K线
      let currentCandle = prevHistory.find(candle => candle.time === currentMinute);

      if (!currentCandle) {
        // 创建新的K线
        currentCandle = {
          time: currentMinute,
          open: price,
          high: price,
          low: price,
          close: price,
        };
        const newHistory = [...prevHistory, currentCandle];
        
        // 保持最近100个K线
        if (newHistory.length > 100) {
          newHistory.shift();
        }
        
        // 更新图表
        candlestickSeriesRef.current.setData(newHistory);
        
        return newHistory;
      } else {
        // 更新现有K线
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;
        
        // 更新图表
        candlestickSeriesRef.current.setData(prevHistory);
        
        return prevHistory;
      }
    });

    // 更新成交量
    if (volumeSeriesRef.current && volume > 0) {
      volumeSeriesRef.current.update({
        time: currentMinute,
        value: volume,
        color: price >= (priceHistory.find(c => c.time === currentMinute)?.open || price) ? '#00ff88' : '#ff4757',
      });
    }
  };

  if (!isChartLoaded) {
    return (
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl ${className}`}>
        <div className="flex items-center justify-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <span className="text-xl font-semibold text-white">TradingView图表</span>
        </div>
        <div className="text-center py-8">
          <div className="text-lg text-gray-400 mb-2">正在加载图表库...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl ${className}`}>
      <div className="flex items-center justify-center space-x-3 mb-4">
        <TrendingUp className="w-6 h-6 text-blue-400" />
        <span className="text-xl font-semibold text-white">TradingView实时价格走势</span>
        <Volume2 className="w-5 h-5 text-green-400" />
      </div>
      
      <div 
        ref={chartContainerRef} 
        className="w-full h-96 rounded-lg overflow-hidden"
        style={{ background: 'rgba(15, 20, 25, 0.8)' }}
      />
      
      <div className="mt-4 text-center text-sm text-gray-400">
        {symbol} 期货合约 - 实时K线图
      </div>
    </div>
  );
}; 