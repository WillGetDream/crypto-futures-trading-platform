import React from 'react';
import { TrendingUp, User, Bell, Settings, LogOut } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';

export const Header: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

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
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">{user?.emailAddresses[0]?.emailAddress || user?.firstName}</span>
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-white text-sm">登出</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};