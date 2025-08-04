import { ClerkProvider } from '@clerk/clerk-react';

// 从环境变量获取Clerk配置
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Publishable Key');
}

export { ClerkProvider };
export { publishableKey }; 