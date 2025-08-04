import React, { useState } from 'react';

export const SimpleIBKRTest: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [testResult, setTestResult] = useState<string>('');

  const testIBKRConnection = async () => {
    setTestResult('测试中...');
    
    try {
      // 设置较短的超时时间
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时
      
      const response = await fetch('http://localhost:4002/v1/api/one/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setTestResult('✅ IBKR连接成功！');
      } else {
        setTestResult(`❌ IBKR连接失败: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setTestResult('❌ 连接超时 (3秒)');
      } else {
        setTestResult(`❌ 连接错误: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">IBKR测试</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
      
      <button
        onClick={testIBKRConnection}
        className="w-full bg-white text-blue-600 py-2 px-4 rounded font-medium hover:bg-gray-100"
      >
        测试IBKR连接
      </button>
      
      {testResult && (
        <div className="mt-2 text-sm">
          {testResult}
        </div>
      )}
      
      <div className="mt-2 text-xs opacity-75">
        确保IB Gateway正在运行在端口7496
      </div>
    </div>
  );
}; 