import React, { useState } from 'react';

export const PortTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testPort = async () => {
    setIsTesting(true);
    setTestResult('测试端口连接...');
    
    try {
      // 使用WebSocket测试端口连接
      const ws = new WebSocket('ws://localhost:4002');
      
      const timeout = setTimeout(() => {
        ws.close();
        setTestResult('❌ 端口4002连接超时');
        setIsTesting(false);
      }, 2000);

      ws.onopen = () => {
        clearTimeout(timeout);
        setTestResult('✅ 端口4002连接成功！');
        ws.close();
        setIsTesting(false);
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        setTestResult('❌ 端口4002连接失败');
        setIsTesting(false);
      };

    } catch (error) {
      setTestResult('❌ 连接测试失败');
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed top-36 right-4 bg-purple-600 text-white p-3 rounded-lg shadow-lg z-50 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">端口测试</h3>
        <div className="text-xs">
          {isTesting ? '🔍' : '🔌'}
        </div>
      </div>
      
      <button
        onClick={testPort}
        disabled={isTesting}
        className="w-full bg-white text-purple-600 py-1 px-3 rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
      >
        {isTesting ? '测试中...' : '测试端口4002'}
      </button>
      
      {testResult && (
        <div className="mt-2 text-xs">
          {testResult}
        </div>
      )}
      
      <div className="mt-1 text-xs opacity-75">
        检查IB Gateway端口4002
      </div>
    </div>
  );
}; 