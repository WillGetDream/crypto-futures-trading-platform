import React from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

export const Header: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* 高斯分布图标 */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 高斯分布曲线 */}
                <path 
                  d="M2 20 L4 18 L6 16 L8 14 L10 12 L12 10 L14 12 L16 14 L18 16 L20 18 L22 20" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none"
                  strokeLinecap="round"
                />
                {/* 中心点 */}
                <circle cx="12" cy="10" r="1.5" fill="currentColor" />
                {/* 数学符号 */}
                <text x="12" y="6" textAnchor="middle" className="text-xs font-bold" fill="currentColor">G</text>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">高斯交易系统</h1>
              <p className="text-xs text-gray-400">Gauss Trading System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              {user?.emailAddresses[0]?.emailAddress || '交易员'}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};