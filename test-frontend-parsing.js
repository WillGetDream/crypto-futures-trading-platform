// 测试前端数据解析逻辑
import fetch from 'node-fetch';

async function testFrontendParsing() {
  console.log('🧪 测试前端数据解析逻辑...\n');
  
  // 模拟Java TWS API的响应格式
  const javaApiResponse = {
    "success": true,
    "data": "{\"symbol\":\"MES\",\"tradingClass\":\"MES\",\"multiplier\":\"5\",\"description\":\"\",\"conId\":711280067,\"secType\":\"FUT\",\"exchange\":\"CME\",\"currency\":\"USD\"}"
  };
  
  console.log('=== 测试Java API响应解析 ===');
  console.log('原始响应:', JSON.stringify(javaApiResponse, null, 2));
  
  // 模拟前端的解析逻辑
  if (javaApiResponse && javaApiResponse.success && javaApiResponse.data) {
    try {
      const contractData = typeof javaApiResponse.data === 'string' ? JSON.parse(javaApiResponse.data) : javaApiResponse.data;
      console.log('✅ 解析成功:', JSON.stringify(contractData, null, 2));
      
      // 检查是否包含必要的字段
      const requiredFields = ['conId', 'symbol', 'secType', 'exchange'];
      const missingFields = requiredFields.filter(field => !contractData[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ 合约数据完整，包含所有必要字段');
        return [contractData];
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

// 测试实际的Java API调用
async function testRealJavaApi() {
  console.log('\n=== 测试实际Java API调用 ===');
  
  try {
    const response = await fetch('http://localhost:8080/api/tws/contracts/search?symbol=MES&secType=FUT&exchange=CME&currency=USD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Java API响应:', JSON.stringify(data, null, 2));
      
      // 应用前端解析逻辑
      if (data && data.success && data.data) {
        try {
          const contractData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          console.log('✅ 前端解析结果:', JSON.stringify(contractData, null, 2));
          return [contractData];
        } catch (parseError) {
          console.log('❌ 前端解析失败:', parseError.message);
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
  console.log('🚀 开始测试...\n');
  
  // 测试模拟数据
  const mockResult = await testFrontendParsing();
  console.log('模拟测试结果:', mockResult.length > 0 ? '✅ 成功' : '❌ 失败');
  
  // 测试实际API
  const realResult = await testRealJavaApi();
  console.log('实际API测试结果:', realResult.length > 0 ? '✅ 成功' : '❌ 失败');
  
  console.log('\n🎯 测试完成');
}

runTests().catch(console.error); 