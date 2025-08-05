import React, { useState } from 'react';
import { Header } from './components/Header';
import { PriceChart } from './components/PriceChart';
import { TradingPanel } from './components/TradingPanel';
import { Portfolio } from './components/Portfolio';
import { MarketList } from './components/MarketList';
import { OrderHistory } from './components/OrderHistory';
import { PriceAlert } from './components/PriceAlert';
import { CryptoSelector } from './components/CryptoSelector';
import { FuturesTrading } from './components/FuturesTrading';
import { ClerkAuth } from './components/ClerkAuth';
import { TempAuth } from './components/TempAuth';
import { IBKRTestPanel } from './components/IBKRTestPanel';
import { SimpleIBKRTest } from './components/SimpleIBKRTest';
import { QuickIBKRTest } from './components/QuickIBKRTest';
import { PortTest } from './components/PortTest';
import { IBKRDiagnostic } from './components/IBKRDiagnostic';
import { IBKRTest } from './components/IBKRTest';
import { ContractConfig } from './components/ContractConfig';
import { DynamicContractSearch } from './components/DynamicContractSearch';
import { ContractSearchManager } from './components/ContractSearchManager';
import { QuickAccessSidebar } from './components/QuickAccessSidebar';
import { ContractDataViewer } from './components/ContractDataViewer';
import { IBGatewayConfigCheck } from './components/IBGatewayConfigCheck';
import { JavaCompatibleTest } from './components/JavaCompatibleTest';
import { useRealTimeData } from './hooks/useRealTimeData';
import { useUser } from '@clerk/clerk-react';

function AppContent() {
  const { isSignedIn, isLoaded } = useUser();
  const { 
    currentPrice, 
    priceChange24h, 
    volume24h,
    isLoading, 
    selectedCrypto, 
    priceHistory,
    portfolioData,
    switchCrypto 
  } = useRealTimeData();

  // 合约数据查看器状态
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showContractViewer, setShowContractViewer] = useState(false);

  // 处理合约选择
  const handleContractSelect = (contract: any) => {
    setSelectedContract(contract);
    setShowContractViewer(true);
  };

  // 关闭合约查看器
  const handleCloseContractViewer = () => {
    setShowContractViewer(false);
    setSelectedContract(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    // 检查是否配置了 Clerk Key
    const hasClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
                       import.meta.env.VITE_CLERK_PUBLISHABLE_KEY !== 'pk_test_mock_key_for_development';
    
    if (!hasClerkKey) {
      return <TempAuth />;
    }
    
    return <ClerkAuth />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <PriceAlert currentPrice={currentPrice} symbol={selectedCrypto.symbol} />
      
      {/* 币种选择器和实时价格显示 */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-6">
            <CryptoSelector 
              selectedInstrument={selectedCrypto}
              onInstrumentChange={switchCrypto}
            />
            <div className="flex items-center space-x-4">
              <div>
                <div className="text-2xl font-bold text-white">
                  ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-400">当前价格</div>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded ${
                priceChange24h >= 0 ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
              }`}>
                <span className="text-sm font-medium">
                  {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                </span>
                <span className="text-xs">24h</span>
              </div>
            </div>
          </div>
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">更新中...</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-2 space-y-6">
        {/* 价格图表和交易面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PriceChart 
              currentPrice={currentPrice}
              priceHistory={priceHistory}
              selectedCrypto={selectedCrypto}
              priceChange24h={priceChange24h}
              volume24h={volume24h}
            />
          </div>
          <div className="space-y-6">
            <TradingPanel currentPrice={currentPrice} />
            {selectedCrypto.type === 'futures' && (
              <FuturesTrading 
                currentPrice={currentPrice}
                selectedInstrument={selectedCrypto}
                priceChange24h={priceChange24h}
                volume24h={volume24h}
              />
            )}
          </div>
        </div>

        {/* 投资组合和比特币详情 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Portfolio portfolioData={portfolioData} />
          <MarketList 
            currentPrice={currentPrice}
            priceHistory={priceHistory}
            selectedCrypto={selectedCrypto}
            priceChange24h={priceChange24h}
          />
        </div>

        {/* 订单历史 */}
        <OrderHistory />
      </div>
      
      {/* IBKR诊断工具 */}
      <div className="container mx-auto px-6 py-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">IBKR连接诊断</h2>
          <IBKRDiagnostic />
        </div>
      </div>

                  {/* 合约搜索管理器 */}
            <div className="container mx-auto px-6 py-4" data-component="contract-search-manager">
              <ContractSearchManager />
            </div>

            {/* 动态期货合约搜索 */}
            <div className="container mx-auto px-6 py-4">
              <DynamicContractSearch />
            </div>

            {/* 期货合约配置 */}
            <div className="container mx-auto px-6 py-4">
              <ContractConfig />
            </div>

      {/* IBKR实时数据测试 */}
      <div className="container mx-auto px-6 py-4">
        <IBKRTest />
      </div>
      
      {/* 其他IBKR功能保留但隐藏测试界面 */}
      <div style={{ display: 'none' }}>
        <IBGatewayConfigCheck />
        <JavaCompatibleTest />
        <IBKRTestPanel />
        <SimpleIBKRTest />
        <QuickIBKRTest />
        <PortTest />
      </div>

      {/* 快速访问侧边栏 */}
      <QuickAccessSidebar onContractSelect={handleContractSelect} />

      {/* 合约数据查看器 */}
      <ContractDataViewer
        contract={selectedContract}
        isVisible={showContractViewer}
        onClose={handleCloseContractViewer}
      />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;