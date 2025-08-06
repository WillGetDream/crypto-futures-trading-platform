import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PriceChart } from './components/PriceChart';
import { ProfessionalChart } from './components/ProfessionalChart';
import { TradingPanel } from './components/TradingPanel';
import { Portfolio } from './components/Portfolio';
import { MarketList } from './components/MarketList';
import { OrderHistory } from './components/OrderHistory';
import { PriceAlert } from './components/PriceAlert';
import { CryptoSelector } from './components/CryptoSelector';
import { FuturesTrading } from './components/FuturesTrading';
import { ClerkAuth } from './components/ClerkAuth';
import { TempAuth } from './components/TempAuth';

import { ContractConfig } from './components/ContractConfig';
import { ContractSearchManager } from './components/ContractSearchManager';
import { QuickAccessSidebar } from './components/QuickAccessSidebar';
import { ContractDataViewer } from './components/ContractDataViewer';
import { IBGatewayConfigCheck } from './components/IBGatewayConfigCheck';
import { JavaCompatibleTest } from './components/JavaCompatibleTest';
import TwsApiTest from './components/TwsApiTest';
import { useRealTimeData, TradingInstrument } from './hooks/useRealTimeData';
import { useUser } from '@clerk/clerk-react';
import { ibkrService } from './services/ibkrService';

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
    switchCrypto,
    allInstruments,
    // TWS相关数据
    twsConnected,
    twsMarketData,
    bidPrice,
    askPrice,
    bidSize,
    askSize
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

  // 监听合约选择事件 - 新增
  useEffect(() => {
    const handleContractSelected = async (event: CustomEvent) => {
      const contractData = event.detail;
      console.log('收到合约选择事件:', contractData);
      
      // 创建TradingInstrument对象
      const newInstrument: TradingInstrument = {
        id: contractData.symbol.toLowerCase(),
        symbol: contractData.symbol,
        name: contractData.description || contractData.symbol,
        type: 'futures',
        category: 'equity_index',
        tickSize: 0.25, // 默认值，可以根据合约类型调整
        contractSize: parseInt(contractData.multiplier) || 1,
        currency: 'USD',
        // 添加日期信息
        expiration: contractData.expiration,
        contractMonth: contractData.contractMonth,
        lastTradingDay: contractData.lastTradeTime,
        maturityDate: contractData.realExpirationDate,
        // 添加TWS API字段
        tradingClass: contractData.tradingClass,
        multiplier: contractData.multiplier
      };
      
      // 直接切换到新合约
      switchCrypto(newInstrument);
      
      // 订阅期货市场数据
      try {
        console.log('🔍 开始订阅期货市场数据...');
        const marketData = await ibkrService.subscribeFuturesMarketData(
          contractData.conid,
          contractData.symbol,
          contractData.contractMonth,
          contractData.realExpirationDate
        );
        console.log('✅ 期货市场数据订阅成功:', marketData);
        
        // 这里可以触发图表更新事件
        window.dispatchEvent(new CustomEvent('marketDataUpdated', {
          detail: {
            symbol: contractData.symbol,
            marketData: marketData
          }
        }));
        
      } catch (error) {
        console.error('❌ 订阅期货市场数据失败:', error);
      }
      
      // 显示成功消息
      console.log(`✅ 已切换到合约: ${contractData.symbol}`);
    };

    // 添加事件监听器
    window.addEventListener('contractSelected', handleContractSelected as unknown as EventListener);

    // 清理事件监听器
    return () => {
      window.removeEventListener('contractSelected', handleContractSelected as unknown as EventListener);
    };
  }, [switchCrypto]);

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
              allInstruments={allInstruments}
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
      
      {/* 主内容区域 */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：图表和交易面板 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 专业价格图表 */}
            {selectedCrypto.type === 'futures' ? (
              <FuturesTrading
                currentPrice={currentPrice}
                selectedInstrument={selectedCrypto}
                priceChange24h={priceChange24h}
                volume24h={volume24h}
                twsConnected={twsConnected}
                twsMarketData={twsMarketData}
                bidPrice={bidPrice}
                askPrice={askPrice}
                bidSize={bidSize}
                askSize={askSize}
              />
            ) : (
              <ProfessionalChart
                data={priceHistory.map(p => ({
                  time: p.time,
                  price: p.price,
                  volume: p.volume || 0
                }))}
                symbol={selectedCrypto.symbol}
                currentPrice={currentPrice}
                priceChange={priceChange24h}
                priceChangePercent={priceChange24h}
                volume24h={volume24h}
                showVolume={true}
                showMA={true}
                showBollinger={false}
              />
            )}
            
            {/* 交易面板 */}
            <TradingPanel currentPrice={currentPrice} />
          </div>

          {/* 右侧：投资组合和市场列表 */}
          <div className="space-y-6">
            <Portfolio portfolioData={portfolioData} />
            <MarketList 
              currentPrice={currentPrice}
              priceHistory={priceHistory}
              selectedCrypto={selectedCrypto}
              priceChange24h={priceChange24h}
            />
          </div>
        </div>
      </div>

      {/* 订单历史 */}
      <OrderHistory />

      {/* 合约搜索管理器 */}
      <div className="container mx-auto px-6 py-4" data-component="contract-search-manager">
        <ContractSearchManager />
      </div>

      {/* 期货合约配置 */}
      <div className="container mx-auto px-6 py-4">
        <ContractConfig />
      </div>

      {/* TWS API测试 */}
      <div className="container mx-auto px-6 py-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Java TWS API 测试</h2>
          <TwsApiTest />
        </div>
      </div>

      {/* 其他IBKR功能保留但隐藏测试界面 */}
      <div style={{ display: 'none' }}>
        <IBGatewayConfigCheck />
        <JavaCompatibleTest />
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