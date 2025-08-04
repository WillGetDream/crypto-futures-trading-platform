import React, { useState } from 'react';

export const QuickIBKRTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const quickTest = async () => {
    setIsTesting(true);
    setTestResult('快速测试中...');
    
    try {
      // 使用更快的测试方法
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5秒超时
      
      const response = await fetch('http://localhost:4002/v1/api/iserver/auth/status', {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setTestResult('✅ IBKR已连接并认证！');
        } else {
          setTestResult('⚠️ IBKR已连接但未认证');
        }
      } else {
        setTestResult(`❌ 连接失败: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setTestResult('❌ 连接超时 (1.5秒)');
      } else {
        setTestResult('❌ 无法连接到IB Gateway');
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed top-20 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg z-50 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">快速IBKR测试</h3>
        <div className="text-xs">
          {isTesting ? '⏳' : '⚡'}
        </div>
      </div>
      
      <button
        onClick={quickTest}
        disabled={isTesting}
        className="w-full bg-white text-green-600 py-1 px-3 rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
      >
        {isTesting ? '测试中...' : '快速测试'}
      </button>
      
      {testResult && (
        <div className="mt-2 text-xs">
          {testResult}
        </div>
      )}
      
      <div className="mt-1 text-xs opacity-75">
        端口: 4002
      </div>
    </div>
  );
}; 