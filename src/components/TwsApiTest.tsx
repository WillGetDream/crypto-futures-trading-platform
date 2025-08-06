import React, { useState, useEffect } from 'react';
import { twsApiService } from '../services/twsApiService';

interface ApiResponse {
  success?: boolean;
  connected?: boolean;
  data?: any;
  message?: string;
  error?: string;
}

const TwsApiTest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<ApiResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ApiResponse | null>(null);
  const [accountSummary, setAccountSummary] = useState<ApiResponse | null>(null);
  const [positions, setPositions] = useState<ApiResponse | null>(null);
  const [marketData, setMarketData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<string>('');

  // 健康检查
  const checkHealth = async () => {
    setLoading('health');
    try {
      const result = await twsApiService.healthCheck();
      setHealthStatus(result);
    } catch (error) {
      setHealthStatus({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      setLoading('');
    }
  };

  // 获取连接状态
  const getStatus = async () => {
    setLoading('status');
    try {
      const result = await twsApiService.getStatus();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      setLoading('');
    }
  };

  // 连接到TWS
  const connect = async () => {
    setLoading('connect');
    try {
      const result = await twsApiService.connect();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      setLoading('');
    }
  };

  // 获取账户摘要
  const getAccountSummary = async () => {
    setLoading('account');
    try {
      const result = await twsApiService.getAccountSummary();
      setAccountSummary(result);
    } catch (error) {
      setAccountSummary({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      setLoading('');
    }
  };

  // 获取持仓信息
  const getPositions = async () => {
    setLoading('positions');
    try {
      const result = await twsApiService.getPositions();
      setPositions(result);
    } catch (error) {
      setPositions({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      setLoading('');
    }
  };

  // 请求市场数据
  const requestMarketData = async () => {
    setLoading('market');
    try {
      const result = await twsApiService.requestMarketData('ES');
      setMarketData(result);
    } catch (error) {
      setMarketData({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      setLoading('');
    }
  };

  // 渲染响应数据
  const renderResponse = (data: ApiResponse | null, title: string) => (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {data ? (
        <pre className="text-sm bg-white p-2 rounded border overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="text-gray-500">暂无数据</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">TWS API 测试面板</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={checkHealth}
          disabled={loading === 'health'}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading === 'health' ? '检查中...' : '健康检查'}
        </button>
        
        <button
          onClick={getStatus}
          disabled={loading === 'status'}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading === 'status' ? '获取中...' : '连接状态'}
        </button>
        
        <button
          onClick={connect}
          disabled={loading === 'connect'}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading === 'connect' ? '连接中...' : '连接TWS'}
        </button>
        
        <button
          onClick={getAccountSummary}
          disabled={loading === 'account'}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading === 'account' ? '获取中...' : '账户摘要'}
        </button>
        
        <button
          onClick={getPositions}
          disabled={loading === 'positions'}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading === 'positions' ? '获取中...' : '持仓信息'}
        </button>
        
        <button
          onClick={requestMarketData}
          disabled={loading === 'market'}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading === 'market' ? '请求中...' : '市场数据'}
        </button>
      </div>

      <div className="space-y-4">
        {renderResponse(healthStatus, '健康检查结果')}
        {renderResponse(connectionStatus, '连接状态')}
        {renderResponse(accountSummary, '账户摘要')}
        {renderResponse(positions, '持仓信息')}
        {renderResponse(marketData, '市场数据')}
      </div>
    </div>
  );
};

export default TwsApiTest; 