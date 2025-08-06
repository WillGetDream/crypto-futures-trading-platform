// 测试前端与Java TWS API的集成
import fetch from 'node-fetch';

async function testFrontendIntegration() {
  console.log('🧪 测试前端与Java TWS API集成...\n');
  
  // 测试Java TWS API直接调用
  console.log('=== 测试Java TWS API直接调用 ===');
  try {
    const response = await fetch('http://localhost:8080/api/tws/contracts/search?symbol=ES&secType=FUT&exchange=CME&currency=USD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Java TWS API响应:', JSON.stringify(data, null, 2));
      
      if (data && data.success && data.data) {
        console.log('✅ Java TWS API调用成功');
        return true;
      } else {
        console.log('❌ Java TWS API响应格式不正确');
        return false;
      }
    } else {
      console.log('❌ Java TWS API调用失败:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Java TWS API请求失败:', error.message);
    return false;
  }
}

// 测试前端ibkrService的搜索逻辑
async function testFrontendSearchLogic() {
  console.log('\n=== 测试前端搜索逻辑 ===');
  
  // 模拟前端ibkrService的搜索逻辑
  const symbol = 'ES';
  const exchange = 'CME';
  const currency = 'USD';
  
  try {
    // 模拟前端调用Java TWS API
    const response = await fetch(`http://localhost:8080/api/tws/contracts/search?symbol=${symbol}&secType=FUT&exchange=${exchange}&currency=${currency}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('前端API调用响应:', JSON.stringify(data, null, 2));
      
      // 应用前端的数据处理逻辑
      if (data && data.success && data.data) {
        try {
          const contractData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          
          // 映射Java API数据格式到前端期望的格式
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
          
          console.log('✅ 前端数据处理结果:', JSON.stringify(mappedContract, null, 2));
          
          // 检查是否包含必要字段
          const requiredFields = ['conid', 'symbol', 'secType', 'exchange'];
          const missingFields = requiredFields.filter(field => !mappedContract[field]);
          
          if (missingFields.length === 0) {
            console.log('✅ 前端数据处理成功，包含所有必要字段');
            return [mappedContract];
          } else {
            console.log('❌ 缺少必要字段:', missingFields);
            return [];
          }
        } catch (parseError) {
          console.log('❌ 前端数据处理失败:', parseError.message);
          return [];
        }
      } else {
        console.log('❌ 前端API响应格式不正确');
        return [];
      }
    } else {
      console.log('❌ 前端API调用失败:', response.status);
      return [];
    }
  } catch (error) {
    console.log('❌ 前端请求失败:', error.message);
    return [];
  }
}

// 测试前端应用是否可访问
async function testFrontendApp() {
  console.log('\n=== 测试前端应用可访问性 ===');
  
  try {
    const response = await fetch('http://localhost:5173');
    if (response.ok) {
      console.log('✅ 前端应用可访问');
      return true;
    } else {
      console.log('❌ 前端应用不可访问:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ 前端应用访问失败:', error.message);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始前端集成测试...\n');
  
  // 测试Java TWS API
  const javaApiResult = await testFrontendIntegration();
  
  // 测试前端搜索逻辑
  const frontendResult = await testFrontendSearchLogic();
  
  // 测试前端应用
  const frontendAppResult = await testFrontendApp();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log('Java TWS API:', javaApiResult ? '✅ 正常' : '❌ 异常');
  console.log('前端搜索逻辑:', frontendResult.length > 0 ? '✅ 正常' : '❌ 异常');
  console.log('前端应用:', frontendAppResult ? '✅ 正常' : '❌ 异常');
  
  if (javaApiResult && frontendResult.length > 0 && frontendAppResult) {
    console.log('\n🎯 所有测试通过！前端应该能正常搜索ES合约');
    console.log('找到的ES合约:', frontendResult[0]);
  } else {
    console.log('\n❌ 部分测试失败，需要检查配置');
  }
  
  console.log('\n🎯 前端集成测试完成');
}

runAllTests().catch(console.error); 