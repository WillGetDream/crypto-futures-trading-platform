import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface TradingPanelProps {
  currentPrice: number;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({ currentPrice }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());

  // 当价格更新时，同步更新限价单价格
  React.useEffect(() => {
    if (orderType === 'market') {
      setPrice(currentPrice.toString());
    }
  }, [currentPrice, orderType]);

  const handleTrade = () => {
    // 模拟交易逻辑
    alert(`${activeTab === 'buy' ? '买入' : '卖出'} ${amount} BTC`);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <ArrowUpCircle className="h-4 w-4" />
          <span>买入</span>
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <ArrowDownCircle className="h-4 w-4" />
          <span>卖出</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">订单类型</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setOrderType('market')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                orderType === 'market'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              市价单
            </button>
            <button
              onClick={() => setOrderType('limit')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                orderType === 'limit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              限价单
            </button>
          </div>
        </div>

        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">价格 (USDT)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="输入价格"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">数量 (BTC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="输入数量"
          />
          <div className="flex space-x-2 mt-2">
            {['25%', '50%', '75%', '100%'].map((percent) => (
              <button
                key={percent}
                onClick={() => setAmount((parseFloat(percent) / 100 * 0.5).toFixed(4))}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
              >
                {percent}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">可用余额:</span>
            <span className="text-white">0.5000 BTC</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">预估成本:</span>
            <span className="text-white">
              {amount && price ? `$${(parseFloat(amount) * parseFloat(price)).toLocaleString()}` : '$0'}
            </span>
          </div>
        </div>

        <button
          onClick={handleTrade}
          disabled={!amount}
          className={`w-full py-4 rounded-lg font-medium text-white transition-colors ${
            activeTab === 'buy'
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600'
              : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600'
          } disabled:cursor-not-allowed`}
        >
          {activeTab === 'buy' ? '买入' : '卖出'} BTC
        </button>
      </div>
    </div>
  );
};