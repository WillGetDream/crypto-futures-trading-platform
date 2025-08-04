import React, { useState } from 'react';

interface DiagnosticResult {
  method: string;
  success: boolean;
  response?: any;
  error?: string;
  duration: number;
}

export const IBKRDiagnostic: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testConnection = async (
    method: string,
    url: string,
    options: RequestInit = {}
  ): Promise<DiagnosticResult> => {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json().catch(() => 'Response OK but no JSON');
        return {
          method,
          success: true,
          response: data,
          duration
        };
      } else {
        return {
          method,
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          duration
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        method,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    const tests = [
      // 基础连接测试 - localhost
      { method: 'localhost:4002 - /v1/api/one/user', url: 'http://localhost:4002/v1/api/one/user' },
      { method: 'localhost:4002 - /v1/api/iserver/auth/status', url: 'http://localhost:4002/v1/api/iserver/auth/status' },
      { method: 'localhost:4002 - /v1/api/iserver/account', url: 'http://localhost:4002/v1/api/iserver/account' },
      
      // 基础连接测试 - 127.0.0.1
      { method: '127.0.0.1:4002 - /v1/api/one/user', url: 'http://127.0.0.1:4002/v1/api/one/user' },
      { method: '127.0.0.1:4002 - /v1/api/iserver/auth/status', url: 'http://127.0.0.1:4002/v1/api/iserver/auth/status' },
      { method: '127.0.0.1:4002 - /v1/api/iserver/account', url: 'http://127.0.0.1:4002/v1/api/iserver/account' },
      
      // 市场数据端点
      { method: 'localhost:4002 - /v1/api/iserver/marketdata/snapshot', url: 'http://localhost:4002/v1/api/iserver/marketdata/snapshot' },
      { method: '127.0.0.1:4002 - /v1/api/iserver/marketdata/snapshot', url: 'http://127.0.0.1:4002/v1/api/iserver/marketdata/snapshot' },
      
      // 账户信息端点
      { method: 'localhost:4002 - /v1/api/iserver/accounts', url: 'http://localhost:4002/v1/api/iserver/accounts' },
      { method: '127.0.0.1:4002 - /v1/api/iserver/accounts', url: 'http://127.0.0.1:4002/v1/api/iserver/accounts' },
      
      // 测试不同的端口（以防万一）
      { method: 'localhost:7496 - /v1/api/one/user', url: 'http://localhost:7496/v1/api/one/user' },
      { method: 'localhost:7497 - /v1/api/one/user', url: 'http://localhost:7497/v1/api/one/user' },
      
      // 测试WebSocket连接
      { method: 'WebSocket - ws://localhost:4002', url: 'ws://localhost:4002' },
      { method: 'WebSocket - ws://127.0.0.1:4002', url: 'ws://127.0.0.1:4002' },
    ];

    const newResults: DiagnosticResult[] = [];
    
    for (const test of tests) {
      if (test.method.includes('WebSocket')) {
        // WebSocket测试
        const startTime = Date.now();
        try {
          const ws = new WebSocket(test.url);
          const result = await new Promise<DiagnosticResult>((resolve) => {
            const timeout = setTimeout(() => {
              ws.close();
              resolve({
                method: test.method,
                success: false,
                error: 'WebSocket连接超时',
                duration: Date.now() - startTime
              });
            }, 2000);
            
            ws.onopen = () => {
              clearTimeout(timeout);
              ws.close();
              resolve({
                method: test.method,
                success: true,
                duration: Date.now() - startTime
              });
            };
            
            ws.onerror = () => {
              clearTimeout(timeout);
              resolve({
                method: test.method,
                success: false,
                error: 'WebSocket连接失败',
                duration: Date.now() - startTime
              });
            };
          });
          newResults.push(result);
        } catch (error) {
          newResults.push({
            method: test.method,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          });
        }
      } else {
        // HTTP测试
        const result = await testConnection(test.method, test.url);
        newResults.push(result);
      }
      
      setResults([...newResults]);
      await new Promise(resolve => setTimeout(resolve, 100)); // 短暂延迟
    }
    
    setIsRunning(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">IBKR连接诊断工具</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {isRunning ? '诊断中...' : '运行诊断'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">诊断结果:</h4>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {result.success ? '✅' : '❌'} {result.method}
                </span>
                <span className="text-xs text-gray-500">
                  {result.duration}ms
                </span>
              </div>
              {result.success && result.response && (
                <div className="mt-1 text-xs text-gray-600">
                  响应: {JSON.stringify(result.response).substring(0, 100)}...
                </div>
              )}
              {!result.success && result.error && (
                <div className="mt-1 text-xs text-red-600">
                  错误: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>这个工具会测试多种连接方式，包括:</p>
        <ul className="list-disc list-inside mt-1">
          <li>localhost vs 127.0.0.1</li>
          <li>不同的API端点</li>
          <li>不同的端口 (4002, 7496, 7497)</li>
          <li>WebSocket连接</li>
        </ul>
      </div>
    </div>
  );
}; 