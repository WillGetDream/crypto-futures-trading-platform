import { useState, useEffect, useCallback } from 'react';

export interface PriceData {
  time: string;
  price: number;
  volume: number;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  high24h: number;
  low24h: number;
}

export interface PortfolioData {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change: number;
  changePercent: number;
}

export interface TradingInstrument {
  id: string;
  symbol: string;
  name: string;
  type: 'crypto' | 'futures';
  category?: string;
  tickSize?: number;
  contractSize?: number;
  currency?: string;
}

// 支持的交易品种列表
export const TRADING_INSTRUMENTS: TradingInstrument[] = [
  // 加密货币
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', type: 'crypto' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', type: 'crypto' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', type: 'crypto' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', type: 'crypto' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', type: 'crypto' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', type: 'crypto' },
  
  // 期货合约
  { 
    id: 'mes', 
    symbol: 'MES', 
    name: 'E-mini S&P 500', 
    type: 'futures', 
    category: 'equity_index',
    tickSize: 0.25,
    contractSize: 5,
    currency: 'USD'
  },
  { 
    id: 'mnq', 
    symbol: 'MNQ', 
    name: 'E-mini NASDAQ-100', 
    type: 'futures', 
    category: 'equity_index',
    tickSize: 0.25,
    contractSize: 2,
    currency: 'USD'
  },
  { 
    id: 'mym', 
    symbol: 'MYM', 
    name: 'E-mini Dow Jones', 
    type: 'futures', 
    category: 'equity_index',
    tickSize: 1.0,
    contractSize: 0.5,
    currency: 'USD'
  },
  { 
    id: 'mrty', 
    symbol: 'MRTY', 
    name: 'E-mini Russell 2000', 
    type: 'futures', 
    category: 'equity_index',
    tickSize: 0.1,
    contractSize: 5,
    currency: 'USD'
  }
];

// 向后兼容的类型别名
export type CryptoOption = TradingInstrument;
export const CRYPTO_OPTIONS = TRADING_INSTRUMENTS;

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

// 模拟价格数据（用于演示和CORS问题的备用方案）
const MOCK_CRYPTO_DATA: Record<string, any> = {
  bitcoin: { usd: 43250.50, usd_24h_change: 2.34, usd_24h_vol: 28500000000 },
  ethereum: { usd: 2650.75, usd_24h_change: -1.23, usd_24h_vol: 15200000000 },
  binancecoin: { usd: 315.20, usd_24h_change: 0.87, usd_24h_vol: 1800000000 },
  cardano: { usd: 0.52, usd_24h_change: 3.45, usd_24h_vol: 850000000 },
  solana: { usd: 98.30, usd_24h_change: -2.10, usd_24h_vol: 2100000000 },
  ripple: { usd: 0.63, usd_24h_change: 1.56, usd_24h_vol: 1200000000 },
  dogecoin: { usd: 0.082, usd_24h_change: 4.20, usd_24h_vol: 650000000 },
  polkadot: { usd: 7.45, usd_24h_change: -0.95, usd_24h_vol: 320000000 }
};

// 获取加密货币价格数据的函数
const fetchCryptoPrice = async (cryptoId: string) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
    );
    const data = await response.json();
    return {
      usd: data[cryptoId]?.usd,
      usd_24h_change: data[cryptoId]?.usd_24h_change,
      usd_24h_vol: data[cryptoId]?.usd_24h_vol
    };
  } catch (error) {
    console.warn('API调用失败，使用模拟数据:', error);
    
    // 使用模拟数据并添加随机波动
    const mockData = MOCK_CRYPTO_DATA[cryptoId];
    if (mockData) {
      const volatility = 0.02; // 2%波动
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      
      return {
        usd: mockData.usd * (1 + randomChange),
        usd_24h_change: mockData.usd_24h_change + (Math.random() - 0.5) * 2,
        usd_24h_vol: mockData.usd_24h_vol * (1 + randomChange * 0.5)
      };
    }
    
    return null;
  }
};

// 获取期货合约价格数据的函数（模拟数据）
const fetchFuturesPrice = async (futuresId: string) => {
  try {
    // 由于期货数据需要专业的金融数据提供商，这里使用模拟数据
    const basePrice = {
      'mes': 5200,    // E-mini S&P 500
      'mnq': 18500,   // E-mini NASDAQ-100
      'mym': 38500,   // E-mini Dow Jones
      'mrty': 2100    // E-mini Russell 2000
    }[futuresId] || 5000;
    
    // 模拟价格波动
    const randomChange = (Math.random() - 0.5) * 0.02; // ±1%的随机波动
    const currentPrice = basePrice * (1 + randomChange);
    const change24h = (Math.random() - 0.5) * 4; // ±2%的24小时变化
    const volume = Math.random() * 1000000 + 500000; // 随机成交量
    
    return {
      usd: currentPrice,
      usd_24h_change: change24h,
      usd_24h_vol: volume
    };
  } catch (error) {
    console.error('获取期货价格失败:', error);
    return null;
  }
};

// 统一的价格数据获取函数
const fetchInstrumentPrice = async (instrument: TradingInstrument) => {
  if (instrument.type === 'crypto') {
    return await fetchCryptoPrice(instrument.id);
  } else if (instrument.type === 'futures') {
    return await fetchFuturesPrice(instrument.id);
  }
  return null;
};

export const useRealTimeData = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(CRYPTO_OPTIONS[0]); // 默认BTC
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [volume24h, setVolume24h] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);

  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 1.2345,
      value: 53340,
      change: 2340,
      changePercent: 4.58
    }
  ]);

  // 获取实时价格数据
  const fetchRealTimeData = useCallback(async () => {
    console.log('正在获取数据，币种:', selectedCrypto.symbol, selectedCrypto.id);
    setIsLoading(true);
    
    try {
      const data = await fetchInstrumentPrice(selectedCrypto);
      if (data && data.usd) {
        const price = data.usd;
        const change24h = data.usd_24h_change || 0;
        const vol24h = data.usd_24h_vol || 0;
        
        console.log('设置价格数据:', { price, change24h, vol24h });
        
        setCurrentPrice(price);
        setPriceChange24h(change24h);
        setVolume24h(vol24h);
        
        // 添加到价格历史
        const now = new Date();
        const timeString = formatTime(now);
        
        setPriceHistory(prev => {
          // 如果是新币种（数据点少于3个），生成一些初始历史数据
          if (prev.length < 3) {
            const initialHistory = [];
            const basePrice = price;
            
            // 生成过15个历史数据点
            for (let i = 14; i >= 0; i--) {
              const timeOffset = new Date(now.getTime() - i * 2 * 60 * 1000); // 每2分钟一个数据点
              const volatility = 0.02; // 2%波动
              const randomChange = (Math.random() - 0.5) * 2 * volatility;
              const historicalPrice = basePrice * (1 + randomChange);
              
              initialHistory.push({
                time: formatTime(timeOffset),
                price: historicalPrice,
                volume: vol24h * (0.8 + Math.random() * 0.4) // 随机成交量
              });
            }
            
            console.log('生成初始历史数据:', initialHistory.length, '个数据点');
            return initialHistory;
          }
          
          // 正常添加新数据点
          const newData = [...prev.slice(-29), {
            time: timeString,
            price: price,
            volume: vol24h
          }];
          console.log('更新价格历史:', newData.length, '个数据点');
          return newData;
        });
        
        // 更新投资组合数据
        setPortfolioData(prev => prev.map(item => {
          if (item.symbol === selectedCrypto.symbol) {
            const newValue = item.amount * price;
            const change = newValue - item.value;
            const changePercent = item.value > 0 ? (change / item.value) * 100 : 0;
            
            return {
              ...item,
              name: selectedCrypto.name,
              value: Math.round(newValue * 100) / 100,
              change: Math.round(change * 100) / 100,
              changePercent: Math.round(changePercent * 100) / 100
            };
          }
          return item;
        }));
      } else {
        console.error('API返回数据无效:', data);
      }
    } catch (error) {
      console.error('获取价格数据失败:', error);
    }
    
    setIsLoading(false);
  }, [selectedCrypto]);

  // 币种切换函数
  const switchCrypto = useCallback((crypto: CryptoOption) => {
    console.log('切换币种到:', crypto.symbol, crypto.name);
    setSelectedCrypto(crypto);
    
    // 切换币种时轻度重置数据状态（保留一些基础状态）
    setCurrentPrice(0);
    setPriceChange24h(0);
    setVolume24h(0);
    setPriceHistory([]); // 清空历史数据，让fetchRealTimeData生成新的
    setIsLoading(true);
    
    setPortfolioData(prev => prev.map(item => ({
      ...item,
      symbol: crypto.symbol,
      name: crypto.name
    })));
    
    // 立即获取新币种的数据
    console.log('立即获取新币种数据...');
  }, []);

  // 初始加载数据
  useEffect(() => {
    fetchRealTimeData();
  }, [selectedCrypto]);

  // 定时更新数据
  useEffect(() => {
    const interval = setInterval(fetchRealTimeData, 30000); // 每30秒更新一次（避免API限制）
    return () => clearInterval(interval);
  }, [fetchRealTimeData]);

  return {
    currentPrice,
    priceChange24h,
    volume24h,
    isLoading,
    selectedCrypto,
    priceHistory,
    portfolioData,
    switchCrypto
  };
};