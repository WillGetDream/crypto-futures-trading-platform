import React, { useState, useEffect } from 'react';
import { ChevronDown, Bitcoin, TrendingUp, BarChart3 } from 'lucide-react';
import { TradingInstrument, TRADING_INSTRUMENTS, getAllTradingInstruments } from '../hooks/useRealTimeData';

interface InstrumentSelectorProps {
  selectedInstrument: TradingInstrument;
  onInstrumentChange: (instrument: TradingInstrument) => void;
  allInstruments?: TradingInstrument[];
}

export const CryptoSelector: React.FC<InstrumentSelectorProps> = ({
  selectedInstrument,
  onInstrumentChange,
  allInstruments: propInstruments
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [allInstruments, setAllInstruments] = useState<TradingInstrument[]>([]);

  // 使用传入的instruments或动态获取
  useEffect(() => {
    if (propInstruments && propInstruments.length > 0) {
      setAllInstruments(propInstruments);
    } else {
      const instruments = getAllTradingInstruments();
      setAllInstruments(instruments);
    }
  }, [propInstruments]);

  // 监听localStorage变化，实时更新合约列表
  useEffect(() => {
    const handleStorageChange = () => {
      const instruments = getAllTradingInstruments();
      setAllInstruments(instruments);
    };

    window.addEventListener('storage', handleStorageChange);
    // 自定义事件监听器，用于同一页面内的更新
    window.addEventListener('contractsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contractsUpdated', handleStorageChange);
    };
  }, []);

  // 按类型分组
  const cryptoInstruments = allInstruments.filter(i => i.type === 'crypto');
  const futuresInstruments = allInstruments.filter(i => i.type === 'futures');
  const configuredInstruments = futuresInstruments.filter(i => i.category === 'configured');
  const defaultFuturesInstruments = futuresInstruments.filter(i => i.category !== 'configured');

  const handleSelect = (instrument: TradingInstrument) => {
    onInstrumentChange(instrument);
    setIsOpen(false);
  };

  const getInstrumentIcon = (instrument: TradingInstrument) => {
    if (instrument.type === 'crypto') {
      return <Bitcoin className="h-4 w-4" />;
    } else if (instrument.type === 'futures') {
      return <BarChart3 className="h-4 w-4" />;
    }
    return <TrendingUp className="h-4 w-4" />;
  };

  const getInstrumentColor = (instrument: TradingInstrument) => {
    if (instrument.type === 'crypto') {
      return 'bg-orange-500';
    } else if (instrument.type === 'futures') {
      if (instrument.category === 'configured') {
        return 'bg-green-500'; // 配置的合约用绿色
      }
      return 'bg-blue-500';
    }
    return 'bg-gray-500';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center">
          <div className={`w-6 h-6 ${getInstrumentColor(selectedInstrument)} rounded-full flex items-center justify-center mr-3 text-white`}>
            {getInstrumentIcon(selectedInstrument)}
          </div>
          <div className="text-left">
            <div className="font-medium">{selectedInstrument.symbol}</div>
            <div className="text-xs text-gray-400">{selectedInstrument.name}</div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* 加密货币分组 */}
          <div className="px-3 py-2 text-xs font-medium text-gray-400 bg-gray-700">
            加密货币
          </div>
          {cryptoInstruments.map((instrument) => (
            <button
              key={instrument.id}
              onClick={() => handleSelect(instrument)}
              className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors"
            >
              <div className={`w-6 h-6 ${getInstrumentColor(instrument)} rounded-full flex items-center justify-center mr-3 text-white`}>
                {getInstrumentIcon(instrument)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{instrument.symbol}</div>
                <div className="text-xs text-gray-400">{instrument.name}</div>
              </div>
            </button>
          ))}
          
          {/* 已配置的TWS合约分组 */}
          {configuredInstruments.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-medium text-green-400 bg-green-900 border-t border-gray-600">
                🎯 TWS API 已配置合约 ({configuredInstruments.length})
              </div>
              {configuredInstruments.map((instrument) => (
                <button
                  key={instrument.id}
                  onClick={() => handleSelect(instrument)}
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors"
                >
                  <div className={`w-6 h-6 ${getInstrumentColor(instrument)} rounded-full flex items-center justify-center mr-3 text-white`}>
                    {getInstrumentIcon(instrument)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{instrument.symbol}</div>
                    <div className="text-xs text-gray-400">{instrument.name}</div>
                    {instrument.tickSize && (
                      <div className="text-xs text-green-400">TWS API 配置</div>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
          
          {/* 默认期货合约分组 */}
          <div className="px-3 py-2 text-xs font-medium text-gray-400 bg-gray-700 border-t border-gray-600">
            期货合约
          </div>
          {defaultFuturesInstruments.map((instrument) => (
            <button
              key={instrument.id}
              onClick={() => handleSelect(instrument)}
              className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors"
            >
              <div className={`w-6 h-6 ${getInstrumentColor(instrument)} rounded-full flex items-center justify-center mr-3 text-white`}>
                {getInstrumentIcon(instrument)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{instrument.symbol}</div>
                <div className="text-xs text-gray-400">{instrument.name}</div>
                {instrument.tickSize && (
                  <div className="text-xs text-gray-500">Tick: ${instrument.tickSize}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      {/* 点击外部关闭下拉菜单 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
