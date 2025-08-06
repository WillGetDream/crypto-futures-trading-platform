// 测试ibkrService的搜索功能
import fetch from 'node-fetch';

async function testIBKRService() {
  console.log('🧪 测试ibkrService搜索功能...\n');
  
  console.log('=== 测试ibkrService.searchFuturesContracts ===');
  console.log('跳过实际ibkrService测试（需要前端环境）');
  return false;
}

// 测试模拟的ibkrService调用
async function testMockIBKRService() {
  console.log('\n=== 测试模拟ibkrService调用 ===');
  
  // 模拟ibkrService.searchFuturesContracts的实现
  const mockSearchFuturesContracts = async (symbol, exchange, currency) => {
    try {
      const response = await fetch(`http://localhost:8080/api/tws/contracts/search?symbol=${symbol}&secType=FUT&exchange=${exchange}&currency=${currency}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.success && data.data) {
          const contractData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          
          const mappedContract = {
            conid: contractData.conId?.toString() || '',
            symbol: contractData.symbol || '',
            secType: contractData.secType || '',
            exchange: contractData.exchange || '',
            currency: contractData.currency || '',
            description: contractData.description || '',
            companyHeader: contractData.tradingClass || contractData.symbol || '',
            companyName: contractData.exchange || '',
            multiplier: contractData.multiplier || '',
            tradingClass: contractData.tradingClass || ''
          };
          
          return [mappedContract];
        }
      }
      
      return [];
    } catch (error) {
      console.error('模拟搜索失败:', error);
      return [];
    }
  };
  
  try {
    const results = await mockSearchFuturesContracts('ES', 'CME', 'USD');
    
    console.log('模拟ibkrService返回结果:', results);
    console.log('结果类型:', typeof results);
    console.log('是否为数组:', Array.isArray(results));
    console.log('结果长度:', results ? results.length : 'null/undefined');
    
    if (results && results.length > 0) {
      console.log('✅ 模拟ibkrService返回了合约数据');
      console.log('第一个合约:', results[0]);
      return true;
    } else {
      console.log('❌ 模拟ibkrService没有返回合约数据');
      return false;
    }
  } catch (error) {
    console.log('❌ 模拟ibkrService调用失败:', error.message);
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始ibkrService测试...\n');
  
  // 测试实际的ibkrService（如果可用）
  let ibkrServiceResult = false;
  try {
    ibkrServiceResult = await testIBKRService();
  } catch (error) {
    console.log('ibkrService测试跳过（可能无法导入）:', error.message);
  }
  
  // 测试模拟的ibkrService
  const mockResult = await testMockIBKRService();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log('ibkrService:', ibkrServiceResult ? '✅ 正常' : '❌ 异常');
  console.log('模拟ibkrService:', mockResult ? '✅ 正常' : '❌ 异常');
  
  if (mockResult) {
    console.log('\n🎯 模拟ibkrService测试通过！前端应该能正常搜索ES合约');
  } else {
    console.log('\n❌ 模拟ibkrService测试失败，需要检查配置');
  }
  
  console.log('\n🎯 ibkrService测试完成');
}

runTests().catch(console.error); 