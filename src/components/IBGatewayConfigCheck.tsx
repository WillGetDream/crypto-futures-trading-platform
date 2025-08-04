import React, { useState } from 'react';

interface ConfigCheckResult {
  item: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const IBGatewayConfigCheck: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [results, setResults] = useState<ConfigCheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const checkConfig = async () => {
    setIsRunning(true);
    setResults([]);
    
    const newResults: ConfigCheckResult[] = [];
    
    // 1. 检查端口是否开放
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('http://127.0.0.1:4002/v1/api/one/user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        newResults.push({
          item: '端口4002连接',
          status: 'success',
          message: '✅ 端口4002可以访问',
          details: `HTTP状态: ${response.status}`
        });
      } else {
        newResults.push({
          item: '端口4002连接',
          status: 'warning',
          message: '⚠️ 端口4002可以访问但返回错误',
          details: `HTTP状态: ${response.status} - ${response.statusText}`
        });
      }
    } catch (error) {
      newResults.push({
        item: '端口4002连接',
        status: 'error',
        message: '❌ 端口4002无法访问',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }
    
    setResults([...newResults]);
    
    // 2. 检查API版本
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('http://127.0.0.1:4002/v1/api/iserver/auth/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json().catch(() => null);
        newResults.push({
          item: 'REST API v1',
          status: 'success',
          message: '✅ REST API v1可用',
          details: data ? `响应: ${JSON.stringify(data).substring(0, 100)}...` : '响应格式异常'
        });
      } else {
        newResults.push({
          item: 'REST API v1',
          status: 'warning',
          message: '⚠️ REST API v1响应异常',
          details: `HTTP状态: ${response.status}`
        });
      }
    } catch (error) {
      newResults.push({
        item: 'REST API v1',
        status: 'error',
        message: '❌ REST API v1不可用',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }
    
    setResults([...newResults]);
    
    // 3. 检查认证状态
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('http://127.0.0.1:4002/v1/api/iserver/auth/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data && typeof data === 'object') {
          const isAuthenticated = data.authenticated === true;
          newResults.push({
            item: '认证状态',
            status: isAuthenticated ? 'success' : 'warning',
            message: isAuthenticated ? '✅ 已认证' : '⚠️ 未认证',
            details: `认证状态: ${data.authenticated}`
          });
        } else {
          newResults.push({
            item: '认证状态',
            status: 'warning',
            message: '⚠️ 无法获取认证状态',
            details: '响应格式异常'
          });
        }
      } else {
        newResults.push({
          item: '认证状态',
          status: 'error',
          message: '❌ 无法检查认证状态',
          details: `HTTP状态: ${response.status}`
        });
      }
    } catch (error) {
      newResults.push({
        item: '认证状态',
        status: 'error',
        message: '❌ 认证状态检查失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }
    
    setResults([...newResults]);
    
    // 4. 检查账户信息
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('http://127.0.0.1:4002/v1/api/iserver/account', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json().catch(() => null);
        newResults.push({
          item: '账户信息',
          status: 'success',
          message: '✅ 可以获取账户信息',
          details: data ? `账户数量: ${Array.isArray(data) ? data.length : '1'}` : '响应格式异常'
        });
      } else {
        newResults.push({
          item: '账户信息',
          status: 'warning',
          message: '⚠️ 账户信息获取失败',
          details: `HTTP状态: ${response.status}`
        });
      }
    } catch (error) {
      newResults.push({
        item: '账户信息',
        status: 'error',
        message: '❌ 账户信息检查失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }
    
    setResults([...newResults]);
    
    // 5. 检查市场数据权限
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('http://127.0.0.1:4002/v1/api/iserver/marketdata/snapshot', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        newResults.push({
          item: '市场数据权限',
          status: 'success',
          message: '✅ 市场数据API可用',
          details: '可以访问市场数据端点'
        });
      } else if (response.status === 401) {
        newResults.push({
          item: '市场数据权限',
          status: 'warning',
          message: '⚠️ 需要认证才能访问市场数据',
          details: '请先完成IB Gateway认证'
        });
      } else {
        newResults.push({
          item: '市场数据权限',
          status: 'warning',
          message: '⚠️ 市场数据API响应异常',
          details: `HTTP状态: ${response.status}`
        });
      }
    } catch (error) {
      newResults.push({
        item: '市场数据权限',
        status: 'error',
        message: '❌ 市场数据API不可用',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }
    
    setResults([...newResults]);
    setIsRunning(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">IB Gateway配置检查</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <button
          onClick={checkConfig}
          disabled={isRunning}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {isRunning ? '检查中...' : '检查IB Gateway配置'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">配置检查结果:</h4>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border ${
                result.status === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : result.status === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {result.message}
                </span>
                <span className="text-xs text-gray-500">
                  {result.item}
                </span>
              </div>
              {result.details && (
                <div className="mt-1 text-xs text-gray-600">
                  {result.details}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>这个工具会检查IB Gateway的以下配置:</p>
        <ul className="list-disc list-inside mt-1">
          <li>端口4002是否开放</li>
          <li>REST API v1是否可用</li>
          <li>认证状态</li>
          <li>账户信息访问权限</li>
          <li>市场数据API权限</li>
        </ul>
      </div>
    </div>
  );
}; 