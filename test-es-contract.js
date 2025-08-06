// 测试ES合约搜索
import fetch from 'node-fetch';

async function testESContract() {
  console.log('🧪 测试ES合约搜索...\n');
  
  // 测试Java TWS API的ES合约搜索
  try {
    const response = await fetch('http://localhost:8080/api/tws/contracts/search?symbol=ES&secType=FUT&exchange=CME&currency=USD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('=== Java TWS API ES合约搜索 ===');
    console.log('响应状态:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('原始响应:', JSON.stringify(data, null, 2));
      
      // 应用前端解析逻辑
      if (data && data.success && data.data) {
        try {
          const contractData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          console.log('✅ 解析成功:', JSON.stringify(contractData, null, 2));
          
          // 检查合约信息
          console.log('合约ID:', contractData.conId);
          console.log('符号:', contractData.symbol);
          console.log('类型:', contractData.secType);
          console.log('交易所:', contractData.exchange);
          console.log('乘数:', contractData.multiplier);
          
          return [contractData];
        } catch (parseError) {
          console.log('❌ 解析失败:', parseError.message);
          return [];
        }
      } else {
        console.log('❌ 响应格式不正确');
        return [];
      }
    } else {
      console.log('❌ API调用失败:', response.status, response.statusText);
      return [];
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    return [];
  }
}

// 测试前端ibkrService的搜索逻辑
async function testFrontendSearch() {
  console.log('\n=== 测试前端搜索逻辑 ===');
  
  try {
    // 模拟前端调用
    const response = await fetch('http://localhost:5173/api/test-search?symbol=ES');
    const data = await response.json();
    console.log('前端搜索结果:', data);
  } catch (error) {
    console.log('前端搜索测试失败:', error.message);
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始ES合约搜索测试...\n');
  
  const result = await testESContract();
  console.log('\n测试结果:', result.length > 0 ? '✅ ES合约搜索成功' : '❌ ES合约搜索失败');
  
  if (result.length > 0) {
    console.log('找到的ES合约:', result[0]);
  }
  
  console.log('\n🎯 ES合约测试完成');
}

runTests().catch(console.error); 