import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 开始自动部署到 Vercel...');

try {
  // 1. 构建项目
  console.log('🔨 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. 检查 dist 目录
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('构建失败：dist 目录不存在');
  }
  
  console.log('✅ 构建成功！');
  console.log('📁 构建文件：', fs.readdirSync(distPath));
  
  // 3. 尝试使用 npx vercel 部署
  console.log('🚀 部署到 Vercel...');
  try {
    execSync('npx vercel --prod --yes', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ 自动部署失败，请手动部署：');
    console.log('1. 访问 https://vercel.com');
    console.log('2. 导入 GitHub 仓库：WillGetDream/crypto-futures-trading-platform');
    console.log('3. 点击 Deploy');
  }
  
} catch (error) {
  console.error('❌ 部署失败：', error.message);
  process.exit(1);
} 