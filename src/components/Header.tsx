import React from 'react';
import { TrendingUp, User, Bell, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-bold text-white">CryptoTrade Pro</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">交易</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">市场</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">投资组合</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">历史</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
            <User className="h-4 w-4" />
            <span className="text-white">账户</span>
          </button>
        </div>
      </div>
    </header>
  );
};