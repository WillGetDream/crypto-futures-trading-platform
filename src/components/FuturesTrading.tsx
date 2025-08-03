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
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState(currentPrice);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const isPositive = priceChange24h >= 0;
  const tickSize = selectedInstrument.tickSize || 0.25;
  const contractSize = selectedInstrument.contractSize || 1;
  const notionalValue = currentPrice * quantity * contractSize;
  const margin = notionalValue * 0.05; // 假设5%保证金

  const handleSubmitOrder = () => {
    const order = {
      instrument: selectedInstrument.symbol,
      side,
      quantity,
      orderType,
      price: orderType === 'limit' ? limitPrice : currentPrice,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      timestamp: new Date().toISOString()
    };
    
    console.log('提交期货订单:', order);
    alert(`${side === 'buy' ? '买入' : '卖出'} ${quantity} 手 ${selectedInstrument.symbol} 订单已提交！`);
  };

  if (selectedInstrument.type !== 'futures') {
    return null;
  }

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
      </div>

      {/* 交易面板 */}
      <div className="space-y-4">
        {/* 买卖方向 */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSide('buy')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              side === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            买入做多
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              side === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            卖出做空
          </button>
        </div>

        {/* 订单类型 */}
        <div className="flex space-x-2">
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              orderType === 'market'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            市价单
          </button>
          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              orderType === 'limit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            限价单
          </button>
        </div>

        {/* 数量输入 */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">数量（手）</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 限价单价格 */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">限价</label>
            <input
              type="number"
              step={tickSize}
              value={limitPrice}
              onChange={(e) => setLimitPrice(parseFloat(e.target.value) || currentPrice)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* 止损止盈 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">止损价格</label>
            <input
              type="number"
              step={tickSize}
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="可选"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">止盈价格</label>
            <input
              type="number"
              step={tickSize}
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="可选"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 订单信息 */}
        <div className="bg-gray-700 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">名义价值:</span>
            <span className="text-white">${notionalValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">预估保证金:</span>
            <span className="text-white">${margin.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">合约乘数:</span>
            <span className="text-white">{contractSize}</span>
          </div>
        </div>

        {/* 风险提示 */}
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
          <div className="flex items-center text-yellow-400 text-sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            期货交易具有高风险，请谨慎操作
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmitOrder}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            side === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {side === 'buy' ? '买入' : '卖出'} {quantity} 手 {selectedInstrument.symbol}
        </button>
      </div>
    </div>
  );
};
