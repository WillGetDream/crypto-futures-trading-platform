import React, { useState } from 'react';

export const JavaCompatibleTest: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testConnection = async () => {
    setIsRunning(true);
    setResults([]);
    
    const addResult = (message: string) => {
      setResults(prev => [...prev, message]);
    };

    // 使用与Java代码相同的连接参数
    const config = {
      host: '127.0.0.1',
      port: 4002,
      clientId: 0
    };

    addResult(`🔧 测试连接参数: ${config.host}:${config.port}, clientId: ${config.clientId}`);
    addResult('');

    try {
      // 测试1: 基础连接
      addResult('📡 测试1: 基础连接...');
      const controller1 = new AbortController();
      const timeout1 = setTimeout(() => controller1.abort(), 3000);
      
      const response1 = await fetch(`http://${config.host}:${config.port}/v1/api/one/user`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller1.signal
      });
      
      clearTimeout(timeout1);
      
      if (response1.ok) {
        const data1 = await response1.json().catch(() => null);
        addResult(`✅ 基础连接成功! HTTP状态: ${response1.status}`);
        addResult(`📄 响应数据: ${JSON.stringify(data1).substring(0, 200)}...`);
      } else {
        addResult(`⚠️ 基础连接响应异常: HTTP ${response1.status} - ${response1.statusText}`);
      }
    } catch (error) {
      addResult(`❌ 基础连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    addResult('');

    try {
      // 测试2: 认证状态
      addResult('🔐 测试2: 认证状态...');
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 3000);
      
      const response2 = await fetch(`http://${config.host}:${config.port}/v1/api/iserver/auth/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller2.signal
      });
      
      clearTimeout(timeout2);
      
      if (response2.ok) {
        const data2 = await response2.json().catch(() => null);
        addResult(`✅ 认证状态检查成功! HTTP状态: ${response2.status}`);
        if (data2 && typeof data2 === 'object') {
          addResult(`🔐 认证状态: ${data2.authenticated ? '已认证' : '未认证'}`);
          addResult(`📄 完整响应: ${JSON.stringify(data2)}`);
        } else {
          addResult(`⚠️ 认证状态响应格式异常: ${JSON.stringify(data2)}`);
        }
      } else {
        addResult(`⚠️ 认证状态检查失败: HTTP ${response2.status} - ${response2.statusText}`);
      }
    } catch (error) {
      addResult(`❌ 认证状态检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    addResult('');

    try {
      // 测试3: 市场数据
      addResult('📊 测试3: 市场数据API...');
      const controller3 = new AbortController();
      const timeout3 = setTimeout(() => controller3.abort(), 3000);
      
      const response3 = await fetch(`http://${config.host}:${config.port}/v1/api/iserver/marketdata/snapshot`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller3.signal
      });
      
      clearTimeout(timeout3);
      
      if (response3.ok) {
        const data3 = await response3.json().catch(() => null);
        addResult(`✅ 市场数据API可用! HTTP状态: ${response3.status}`);
        addResult(`📄 响应数据: ${JSON.stringify(data3).substring(0, 200)}...`);
      } else if (response3.status === 401) {
        addResult(`⚠️ 市场数据API需要认证: HTTP ${response3.status}`);
        addResult(`💡 提示: 请先在IB Gateway中完成认证`);
      } else {
        addResult(`⚠️ 市场数据API响应异常: HTTP ${response3.status} - ${response3.statusText}`);
      }
    } catch (error) {
      addResult(`❌ 市场数据API测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    addResult('');
    addResult('🎯 测试完成! 请查看上面的结果。');
    setIsRunning(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-4 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-800">Java兼容性测试</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-blue-500 hover:text-blue-700"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-blue-600 mb-2">
          使用与你的Java代码相同的连接参数进行测试:
        </p>
        <div className="bg-blue-100 p-3 rounded-md text-sm font-mono">
          host: "127.0.0.1"<br/>
          port: 4002<br/>
          clientId: 0
        </div>
      </div>
      
      <div className="mb-4">
        <button
          onClick={testConnection}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {isRunning ? '测试中...' : '运行Java兼容性测试'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="bg-white p-4 rounded-md border">
          <h4 className="font-medium text-gray-700 mb-2">测试结果:</h4>
          <div className="space-y-1 text-sm">
            {results.map((result, index) => (
              <div key={index} className="text-gray-800">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 