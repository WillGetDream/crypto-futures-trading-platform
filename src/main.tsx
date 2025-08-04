import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_mock_key_for_development';

// 如果没有配置 Clerk Key，显示警告但继续运行
if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.warn('⚠️ Clerk Publishable Key 未配置。请按照 CLERK_SETUP.md 指南进行设置。');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <App />
    </ClerkProvider>
  </StrictMode>
);
