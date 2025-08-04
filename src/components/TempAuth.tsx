import React from 'react';

const TempAuth: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          🔧 Clerk 认证设置
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          需要配置 Clerk 认证才能继续
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                设置步骤：
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>访问 <a href="https://dashboard.clerk.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">Clerk Dashboard</a></li>
                <li>创建新应用并获取 Publishable Key</li>
                <li>在项目根目录创建 <code className="bg-gray-100 px-1 rounded">.env.local</code> 文件</li>
                <li>添加：<code className="bg-gray-100 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here</code></li>
                <li>重启开发服务器</li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    临时模式
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>当前应用运行在临时模式下。配置 Clerk 后即可使用完整的认证功能。</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.open('https://dashboard.clerk.com/', '_blank')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              前往 Clerk Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { TempAuth }; 