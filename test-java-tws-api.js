// 测试Java TWS API合约搜索
import fetch from 'node-fetch';

async function testJavaTwsApi() {
  console.log('🚀 测试Java TWS API合约搜索...\n');
  
  // 测试连接状态
  console.log('=== 测试连接状态 ===');
  try {
    const statusResponse = await fetch('http://localhost:8080/api/tws/status');
    const statusData = await statusResponse.json();
    console.log('✅ 连接状态:', statusData);
  } catch (error) {
    console.log('❌ 连接状态测试失败:', error.message);
    return;
  }
  
  // 测试合约搜索
  console.log('\n=== 测试合约搜索 ===');
  try {
    const searchResponse = await fetch('http://localhost:8080/api/tws/contracts/search?symbol=MES&secType=FUT&exchange=CME&currency=USD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('搜索响应状态:', searchResponse.status);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('✅ 搜索成功:', JSON.stringify(searchData, null, 2));
    } else {
      const errorText = await searchResponse.text();
      console.log('❌ 搜索失败:', errorText);
    }
  } catch (error) {
    console.log('❌ 搜索请求失败:', error.message);
  }
  
  // 测试获取已配置的合约
  console.log('\n=== 测试获取已配置合约 ===');
  try {
    const configuredResponse = await fetch('http://localhost:8080/api/tws/contracts/configured');
    const configuredData = await configuredResponse.json();
    console.log('✅ 已配置合约:', configuredData);
  } catch (error) {
    console.log('❌ 获取已配置合约失败:', error.message);
  }
  
  console.log('\n✅ Java TWS API测试完成');
}

// 运行测试
testJavaTwsApi().catch(console.error); 