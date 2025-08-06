// 测试数据映射逻辑
import fetch from 'node-fetch';

async function testDataMapping() {
  console.log('🧪 测试数据映射逻辑...\n');
  
  // 模拟Java TWS API的ES合约响应
  const javaApiResponse = {
    "success": true,
    "data": "{\"symbol\":\"ES\",\"tradingClass\":\"ES\",\"multiplier\":\"50\",\"description\":\"\",\"conId\":495512563,\"secType\":\"FUT\",\"exchange\":\"CME\",\"currency\":\"USD\"}"
  };
  
  console.log('=== 测试数据映射 ===');
  console.log('Java API原始响应:', JSON.stringify(javaApiResponse, null, 2));
  
  // 模拟前端的映射逻辑
  if (javaApiResponse && javaApiResponse.success && javaApiResponse.data) {
    try {
      const contractData = typeof javaApiResponse.data === 'string' ? JSON.parse(javaApiResponse.data) : javaApiResponse.data;
      console.log('解析后的合约数据:', JSON.stringify(contractData, null, 2));
      
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
      
      console.log('✅ 映射后的合约数据:', JSON.stringify(mappedContract, null, 2));
      
      // 检查必要字段
      const requiredFields = ['conid', 'symbol', 'secType', 'exchange'];
      const missingFields = requiredFields.filter(field => !mappedContract[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ 数据映射成功，包含所有必要字段');
        return [mappedContract];
      } else {
        console.log('❌ 缺少必要字段:', missingFields);
        return [];
      }
    } catch (parseError) {
      console.log('❌ 解析失败:', parseError.message);
      return [];
    }
  }
  
  return [];
}

// 测试实际的Java API调用和映射
async function testRealMapping() {
  console.log('\n=== 测试实际API调用和映射 ===');
  
  try {
    const response = await fetch('http://localhost:8080/api/tws/contracts/search?symbol=ES&secType=FUT&exchange=CME&currency=USD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Java API响应:', JSON.stringify(data, null, 2));
      
      // 应用映射逻辑
      if (data && data.success && data.data) {
        try {
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
          
          console.log('✅ 实际映射结果:', JSON.stringify(mappedContract, null, 2));
          return [mappedContract];
        } catch (parseError) {
          console.log('❌ 实际映射失败:', parseError.message);
          return [];
        }
      }
    } else {
      console.log('❌ API调用失败:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
  }
  
  return [];
}

// 运行测试
async function runTests() {
  console.log('🚀 开始数据映射测试...\n');
  
  // 测试模拟数据映射
  const mockResult = await testDataMapping();
  console.log('模拟映射测试结果:', mockResult.length > 0 ? '✅ 成功' : '❌ 失败');
  
  // 测试实际API映射
  const realResult = await testRealMapping();
  console.log('实际API映射测试结果:', realResult.length > 0 ? '✅ 成功' : '❌ 失败');
  
  if (realResult.length > 0) {
    console.log('\n🎯 映射后的ES合约数据:');
    console.log('合约ID:', realResult[0].conid);
    console.log('符号:', realResult[0].symbol);
    console.log('类型:', realResult[0].secType);
    console.log('交易所:', realResult[0].exchange);
    console.log('乘数:', realResult[0].multiplier);
    console.log('交易类别:', realResult[0].tradingClass);
  }
  
  console.log('\n🎯 数据映射测试完成');
}

runTests().catch(console.error); 