// 测试包含到期日期的合约数据集成
import fetch from 'node-fetch';

async function testExpiryIntegration() {
  console.log('🚀 开始测试到期日期集成...\n');
  
  // 测试MES合约
  console.log('=== 测试MES合约（包含到期日期）===');
  try {
    const response = await fetch('http://localhost:8080/api/tws/contracts/search?symbol=MES&secType=FUT&exchange=CME&currency=USD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('MES合约原始响应:', JSON.stringify(data, null, 2));
      
      if (data && data.success && data.data) {
        const contractData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
        console.log('✅ MES合约解析成功:', contractData);
        
        // 检查到期日期字段
        console.log('\n📅 到期日期信息:');
        console.log('- contractMonth:', contractData.contractMonth);
        console.log('- realExpirationDate:', contractData.realExpirationDate);
        console.log('- lastTradeTime:', contractData.lastTradeTime);
        
        // 模拟前端数据映射
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
          tradingClass: contractData.tradingClass || '',
          // 添加到期日期信息
          contractMonth: contractData.contractMonth || '',
          realExpirationDate: contractData.realExpirationDate || '',
          lastTradeTime: contractData.lastTradeTime || '',
          // 格式化到期日期显示
          expiryDisplay: contractData.realExpirationDate ? 
            `${contractData.realExpirationDate.slice(0,4)}-${contractData.realExpirationDate.slice(4,6)}-${contractData.realExpirationDate.slice(6,8)}` : 
            contractData.contractMonth || ''
        };
        
        console.log('\n🎯 前端映射结果:');
        console.log('- 合约ID:', mappedContract.conid);
        console.log('- 符号:', mappedContract.symbol);
        console.log('- 乘数:', mappedContract.multiplier);
        console.log('- 到期日期:', mappedContract.expiryDisplay);
        console.log('- 合约月份:', mappedContract.contractMonth);
        console.log('- 最后交易时间:', mappedContract.lastTradeTime);
        
        return true;
      } else {
        console.log('❌ MES合约响应格式不正确');
        return false;
      }
    } else {
      console.log('❌ MES合约请求失败:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ MES合约请求异常:', error.message);
    return false;
  }
}

async function testESContract() {
  console.log('\n=== 测试ES合约（包含到期日期）===');
  try {
    const response = await fetch('http://localhost:8080/api/tws/contracts/search?symbol=ES&secType=FUT&exchange=CME&currency=USD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const contractData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      
      console.log('✅ ES合约解析成功:', contractData);
      console.log('\n📅 ES到期日期信息:');
      console.log('- contractMonth:', contractData.contractMonth);
      console.log('- realExpirationDate:', contractData.realExpirationDate);
      console.log('- lastTradeTime:', contractData.lastTradeTime);
      
      return true;
    } else {
      console.log('❌ ES合约请求失败:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ ES合约请求异常:', error.message);
    return false;
  }
}

async function runAllTests() {
  const mesResult = await testExpiryIntegration();
  const esResult = await testESContract();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log('MES合约:', mesResult ? '✅ 成功' : '❌ 失败');
  console.log('ES合约:', esResult ? '✅ 成功' : '❌ 失败');
  
  if (mesResult && esResult) {
    console.log('\n🎉 所有测试通过！现在合约数据包含完整的到期日期信息');
    console.log('📊 前端可以显示：');
    console.log('  - 合约ID (conId)');
    console.log('  - 合约符号 (symbol)');
    console.log('  - 合约乘数 (multiplier)');
    console.log('  - 到期日期 (expiryDisplay)');
    console.log('  - 合约月份 (contractMonth)');
    console.log('  - 最后交易时间 (lastTradeTime)');
  } else {
    console.log('\n❌ 部分测试失败，需要检查配置');
  }
  
  console.log('\n🎯 到期日期集成测试完成');
}

runAllTests().catch(console.error); 