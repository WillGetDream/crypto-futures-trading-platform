import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PortfolioData } from '../hooks/useRealTimeData';

interface PortfolioProps {
  portfolioData: PortfolioData[];
}

export const Portfolio: React.FC<PortfolioProps> = ({ portfolioData }) => {

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
  const totalChange = portfolioData.reduce((sum, item) => sum + item.change, 0);
  const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Wallet className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-white">投资组合</h2>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-white mb-2">
          ${totalValue.toLocaleString()}
        </div>
        <div className={`flex items-center space-x-1 ${
          totalChange >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {totalChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="font-medium">
            {totalChange >= 0 ? '+' : ''}${Math.abs(totalChange).toLocaleString()} 
            ({totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {portfolioData.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{item.symbol}</span>
              </div>
              <div>
                <div className="font-medium text-white">{item.name}</div>
                <div className="text-sm text-gray-400">{item.amount} {item.symbol}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-white">${item.value.toLocaleString()}</div>
              <div className={`text-sm ${
                item.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.change >= 0 ? '+' : ''}${Math.abs(item.change).toLocaleString()} 
                ({item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};