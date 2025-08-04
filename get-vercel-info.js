import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 获取 Vercel 项目信息...');

// 检查是否已登录
try {
  console.log('📋 检查 Vercel 登录状态...');
  const result = execSync('vercel whoami', { encoding: 'utf8' });
  console.log('✅ 已登录:', result.trim());
} catch (error) {
  console.log('❌ 未登录 Vercel，请先登录');
  console.log('运行: vercel login');
  process.exit(1);
}

// 获取项目列表
try {
  console.log('\n📁 获取项目列表...');
  const projects = execSync('vercel ls', { encoding: 'utf8' });
  console.log(projects);
} catch (error) {
  console.log('❌ 获取项目列表失败:', error.message);
}

console.log('\n📝 手动获取信息步骤:');
console.log('1. 访问: https://vercel.com/account/tokens');
console.log('2. 创建新的 Token');
console.log('3. 访问: https://vercel.com/dashboard');
console.log('4. 找到你的项目 ID');
console.log('5. 在项目设置中找到 Organization ID'); 