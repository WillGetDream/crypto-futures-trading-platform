import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  amount: number;
  price: number;
  status: 'completed' | 'pending' | 'cancelled';
  time: string;
}

export const OrderHistory: React.FC = () => {
  const orders: Order[] = [
    {
      id: '1',
      symbol: 'BTC',
      type: 'buy',
      orderType: 'market',
      amount: 0.1234,
      price: 43200,
      status: 'completed',
      time: '14:23:45'
    },
    {
      id: '2',
      symbol: 'ETH/USDT',
      type: 'sell',
      orderType: 'limit',
      amount: 0.5,
      price: 2650,
      status: 'pending',
      time: '13:45:12'
    },
    {
      id: '3',
      symbol: 'BTC',
      type: 'buy',
      orderType: 'limit',
      amount: 0.05,
      price: 42800,
      status: 'cancelled',
      time: '12:30:08'
    }
  ];

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'pending':
        return '待成交';
      case 'cancelled':
        return '已取消';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-6">订单历史</h2>

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-400 border-b border-gray-700">
          <div className="col-span-2">时间</div>
          <div className="col-span-2">交易对</div>
          <div className="col-span-1">类型</div>
          <div className="col-span-2">数量</div>
          <div className="col-span-2">价格</div>
          <div className="col-span-2">总额</div>
          <div className="col-span-1">状态</div>
        </div>

        {orders.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="col-span-2 text-gray-300 text-sm">{order.time}</div>
            <div className="col-span-2 text-white font-medium">{order.symbol}</div>
            <div className="col-span-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                order.type === 'buy' 
                  ? 'bg-green-900 text-green-400' 
                  : 'bg-red-900 text-red-400'
              }`}>
                {order.type === 'buy' ? '买入' : '卖出'}
              </span>
            </div>
            <div className="col-span-2 text-white">{order.amount}</div>
            <div className="col-span-2 text-white">${order.price.toLocaleString()}</div>
            <div className="col-span-2 text-white">
              ${(order.amount * order.price).toLocaleString()}
            </div>
            <div className="col-span-1 flex items-center space-x-1">
              {getStatusIcon(order.status)}
              <span className="text-sm text-gray-300">{getStatusText(order.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};