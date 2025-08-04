import React from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';

const ClerkAuth: React.FC = () => {
  const { isSignedIn, user } = useUser();

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            {/* 高斯图标 */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M2 20 L4 18 L6 16 L8 14 L10 12 L12 10 L14 12 L16 14 L18 16 L20 18 L22 20" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="10" r="1.5" fill="currentColor" />
                <text x="12" y="6" textAnchor="middle" className="text-xs font-bold" fill="currentColor">G</text>
              </svg>
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-white mb-2">
            欢迎回来, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
          </h2>
          <p className="text-center text-gray-300">
            你已成功登录高斯交易系统
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo和标题 */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M2 20 L4 18 L6 16 L8 14 L10 12 L12 10 L14 12 L16 14 L18 16 L20 18 L22 20" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="12" cy="10" r="1.5" fill="currentColor" />
              <text x="12" y="6" textAnchor="middle" className="text-xs font-bold" fill="currentColor">G</text>
            </svg>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">高斯交易系统</h1>
          <p className="text-gray-300 text-lg">Gauss Trading System</p>
          <p className="text-gray-400 text-sm mt-2">基于数学精确性的专业交易平台</p>
        </div>

        <h2 className="text-center text-2xl font-bold text-white mb-2">
          登录到你的账户
        </h2>
        <p className="text-center text-gray-300 mb-8">
          或者{' '}
          <a href="#" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
            注册新账户
          </a>
        </p>
      </div>

      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 py-8 px-6 shadow-2xl rounded-2xl">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-white text-xl font-bold',
                headerSubtitle: 'text-gray-300',
                socialButtonsBlockButton: 'bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-xl',
                formFieldInput: 'bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400 rounded-xl',
                formFieldLabel: 'text-gray-300',
                footerActionLink: 'text-blue-400 hover:text-blue-300 transition-colors',
                formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white',
                dividerLine: 'bg-white/20',
                dividerText: 'text-gray-300'
              }
            }}
          />
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-gray-400 text-sm">
          © 2024 高斯交易系统 - 数学驱动的交易解决方案
        </p>
      </div>
    </div>
  );
};

export { ClerkAuth }; 