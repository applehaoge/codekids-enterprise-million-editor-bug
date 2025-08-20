import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import App from "./App.tsx";
import "./index.css";

// 添加控制台水印和右下角角标
console.info('🚀 DEV-8F7K2: CodeKids Enterprise 开发环境已加载');

// DEV哨兵：检查是否在Vite开发环境
const checkDevEnvironment = async () => {
  try {
    const response = await fetch('/__vite_ping');
    if (response.status !== 200) {
      console.warn('⚠️ 警告：你不在Vite开发环境中！');
      console.warn('当前访问的可能是生产版本或Docker容器');
      console.warn('请访问 http://127.0.0.1:5173 进行开发');
    } else {
      console.log('✅ 确认：当前在Vite开发环境中');
    }
  } catch (error) {
    console.warn('⚠️ 警告：无法连接到Vite开发服务器');
    console.warn('请确保Vite开发服务器正在运行');
  }
};

// 创建右下角角标
const createDevBadge = () => {
  const badge = document.createElement('div');
  badge.innerHTML = 'DEV-8F7K2';
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #ff0000;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    font-weight: bold;
    z-index: 9999;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(badge);
};

// 页面加载完成后执行检查
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createDevBadge();
    checkDevEnvironment();
  });
} else {
  createDevBadge();
  checkDevEnvironment();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);
