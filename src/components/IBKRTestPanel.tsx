import React, { useState } from 'react';
import { ibkrTest, IBKRTestResult } from '../utils/ibkrTest';
import { Wifi, WifiOff, CheckCircle, XCircle, Loader } from 'lucide-react';

export const IBKRTestPanel: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<IBKRTestResult[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  const runTest = async () => {
    setIsTesting(true);
    setResults([]);
    
    try {
      const testResults = await ibkrTest.runFullTest();
      setResults(testResults);
    } catch (error) {
      console.error('测试失败:', error);
      setResults([{
        success: false,
        message: '测试执行失败',
        error: error instanceof Error ? error.message : '未知错误'
      }]);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    if (isTesting) return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 测试按钮 */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="IBKR连接测试"
      >
        <Wifi className="h-5 w-5" />
      </button>

      {/* 测试面板 */}
      {showPanel && (
        <div className="absolute bottom-16 right-0 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">IBKR连接测试</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* 测试按钮 */}
          <button
            onClick={runTest}
            disabled={isTesting}
            className="w-full mb-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isTesting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>测试中...</span>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4" />
                <span>运行测试</span>
              </>
            )}
          </button>

          {/* 测试结果 */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">测试结果:</h4>
              {results.map((result, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(result.success)}
                    <span className={`text-sm font-medium ${getStatusColor(result.success)}`}>
                      {result.message}
                    </span>
                  </div>
                  {result.error && (
                    <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
                      错误: {result.error}
                    </div>
                  )}
                  {result.data && (
                    <details className="text-xs text-gray-400">
                      <summary className="cursor-pointer hover:text-gray-300">
                        查看数据
                      </summary>
                      <pre className="mt-2 bg-gray-900 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 连接状态指示器 */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${results.some(r => r.success) ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-400">
                {results.some(r => r.success) ? 'IBKR已连接' : 'IBKR未连接'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 