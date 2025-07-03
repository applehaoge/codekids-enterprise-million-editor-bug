# CodeKids - 儿童编程学习平台

## 项目结构
```
├── .env.example
├── .gitignore
├── README.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── src
│   ├── App.tsx
│   ├── api
│   │   ├── auth.ts        # 认证相关API
│   │   ├── courses.ts     # 课程和代码执行API 
│   │   └── index.ts       # API客户端配置
│   ├── components
│   │   ├── Carousel.tsx   # 首页轮播图
│   │   ├── Empty.tsx
│   │   ├── FeatureCards.tsx # 功能卡片
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Reward.tsx     # 奖励组件
│   │   ├── Showcase.tsx   # 作品展示
│   │   └── editor         # 编辑器相关组件
│   │       ├── AITools.tsx      # AI工具
│   │       ├── Character.tsx    # 角色组件
│   │       ├── CodeEditor.tsx   # 代码编辑器
│   │       ├── MotivationPanel.tsx # 激励面板
│   │       ├── ProgrammingHelper.tsx # 编程助手
│   │       ├── TeachingModal.tsx # 教学弹窗
│   │       └── TeachingPanel.tsx # 教学面板
│   ├── data
│   │   ├── editorMock.ts  # 编辑器模拟数据
│   │   ├── mock.ts        # 首页模拟数据
│   │   ├── parentMock.ts  # 家长中心数据
│   │   └── shopMock.ts    # 商城数据
│   ├── hooks
│   │   └── useTheme.ts    # 主题切换hook
│   ├── index.css
│   ├── lib
│   │   └── utils.ts        # 工具函数
│   ├── main.tsx
│   ├── pages
│   │   ├── Editor.tsx      # 编辑器页面
│   │   ├── Home.tsx        # 首页
│   │   ├── Parent.tsx      # 家长中心
│   │   └── Shop.tsx        # 商城页面
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## API文件说明

### 1. auth.ts
```typescript
export const authAPI = {
  login: (data: LoginParams) => apiClient.post('/auth/login', data),
  register: (data: RegisterParams) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/profile'),
};
```

### 2. courses.ts
```typescript
export const coursesAPI = {
  getAll: () => apiClient.get('/courses'),
  getById: (id: string) => apiClient.get(`/courses/${id}`),
  create: (data: any) => apiClient.post('/courses', data),
  update: (id: string, data: any) => apiClient.put(`/courses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/courses/${id}`),
  getProgress: (id: string) => apiClient.get(`/courses/${id}/progress`),
  saveCode: (id: string, code: string) => apiClient.post(`/courses/${id}/code`, { 
    code,
    timestamp: new Date().toISOString() 
  }),
  runCode: (code: string) => apiClient.post('/execute', { code }),
};
```

### 3. index.ts
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 配置请求和响应拦截器
apiClient.interceptors.request.use(...);
apiClient.interceptors.response.use(...);
```

## 主要功能模块

### 1. 编辑器功能
- 代码编辑与自动补全
- 代码运行与结果展示
- 代码保存到本地/云端
- AI编程助手
- 编程概念查询
- 教学引导

### 2. 学习功能
- 课程展示
- 学习进度跟踪
- 奖励系统
- 学习数据统计

### 3. 家长中心
- 学习时长统计
- 课程完成情况
- 使用时间控制
- 通知设置

### 4. 商城功能
- 虚拟物品兑换
- 学习资料购买
- 交易记录查看
