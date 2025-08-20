#!/usr/bin/env node

import { execSync } from 'child_process';

function checkPort5173() {
  try {
    // 检查5173端口是否被占用
    const result = execSync('netstat -an | findstr :5173', { encoding: 'utf8' });
    
    if (result.trim()) {
      console.error('❌ 错误：5173端口被占用！');
      console.error('请检查：');
      console.error('1. Docker容器是否占用了5173端口');
      console.error('2. WSL是否占用了5173端口');
      console.error('3. 其他服务是否占用了5173端口');
      console.error('');
      console.error('解决方案：');
      console.error('1. 停止占用5173的Docker容器');
      console.error('2. 修改docker-compose.yml，前端端口改为8082');
      console.error('3. 重启容器：docker compose up -d');
      console.error('');
      console.error('当前占用进程：');
      console.error(result);
      process.exit(1);
    }
    
    console.log('✅ 5173端口可用，启动Vite开发服务器...');
  } catch (error) {
    // 如果没有输出，说明端口可用
    console.log('✅ 5173端口可用，启动Vite开发服务器...');
  }
}

checkPort5173();

