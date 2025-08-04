import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 自动部署到 Vercel...');

// 检查环境变量
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

if (!VERCEL_TOKEN) {
  console.log('❌ 缺少 VERCEL_TOKEN 环境变量');
  console.log('请设置环境变量:');
  console.log('export VERCEL_TOKEN=your_token_here');
  console.log('\n获取 Token: https://vercel.com/account/tokens');
  process.exit(1);
}

try {
  // 1. 构建项目
  console.log('🔨 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. 检查构建结果
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('构建失败：dist 目录不存在');
  }
  
  console.log('✅ 构建成功！');
  
  // 3. 如果有项目信息，直接部署
  if (VERCEL_ORG_ID && VERCEL_PROJECT_ID) {
    console.log('🚀 使用项目信息部署...');
    execSync(`vercel --prod --token ${VERCEL_TOKEN} --scope ${VERCEL_ORG_ID}`, { 
      stdio: 'inherit',
      env: { ...process.env, VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID }
    });
  } else {
    // 4. 否则使用交互式部署
    console.log('🚀 交互式部署...');
    console.log('请按照提示操作：');
    console.log('- 选择 "Link to existing project"');
    console.log('- 选择你的项目');
    console.log('- 确认部署设置');
    
    execSync('vercel --prod', { stdio: 'inherit' });
  }
  
  console.log('✅ 部署完成！');
  
} catch (error) {
  console.error('❌ 部署失败：', error.message);
  process.exit(1);
} 