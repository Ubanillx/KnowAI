<div align="center">
  <img src="../logo.svg" alt="KnowAI Logo" width="120" />
  <br />
  <img src="./public/vite.svg" alt="Vite" width="50" />
  <img src="./src/assets/react.svg" alt="React" width="50" />
</div>

# Admin Panel

一个基于 React 19 + TypeScript + Vite 的现代化管理后台系统。

## 项目概述

本项目是一个功能完善的管理后台前端应用，采用现代化的前端技术栈，提供美观的用户界面和良好的开发体验。

## 技术栈

- **框架**: React 19.2.0
- **语言**: TypeScript 5.9
- **构建工具**: Vite 7.3
- **编译器**: SWC (via @vitejs/plugin-react-swc)

## 前端架构

```
web/admin-pannel/
├── src/
│   ├── pages/           # 页面组件
│   │   ├── Login/       # 登录页面
│   │   ├── Register/    # 注册页面
│   │   └── Dashboard/   # 仪表盘页面
│   ├── components/      # 公共组件
│   │   ├── ui/          # UI 基础组件
│   │   └── layout/      # 布局组件
│   ├── hooks/           # 自定义 Hooks
│   ├── services/        # API 服务
│   ├── utils/           # 工具函数
│   ├── types/           # TypeScript 类型定义
│   ├── mock/            # Mock 数据
│   ├── stores/          # 状态管理
│   ├── router/          # 路由配置
│   ├── assets/          # 静态资源
│   ├── App.tsx          # 根组件
│   ├── main.tsx         # 入口文件
│   └── index.css        # 全局样式
├── public/              # 公共静态文件
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 项目配置
```

### 架构设计原则

1. **组件化开发**: 采用函数式组件 + Hooks，提高代码复用性
2. **类型安全**: 全面使用 TypeScript，确保类型安全
3. **模块化**: 按功能模块划分目录结构，便于维护
4. **按需加载**: 使用路由级别的代码分割，优化首屏加载

## 功能规划

### 登录页面

登录页面提供两种登录方式：

#### 手机号登录

- 输入框：手机号码（支持 +86 国际区号）
- 验证方式：图形验证码 + 短信验证码
- 功能：记住密码、自动登录

#### 邮箱登录

- 输入框：邮箱地址
- 验证方式：密码登录
- 功能：忘记密码、记住密码

#### UI 设计要点

- 居中卡片式布局，带有精美的渐变背景
- 支持 Tab 切换手机/邮箱登录方式
- 表单验证实时反馈
- 加载状态动画
- 响应式设计，支持移动端

### 注册页面

注册页面同样支持两种方式：

#### 手机号注册

- 输入框：手机号码
- 验证：短信验证码
- 密码设置：强度检测、二次确认

#### 邮箱注册

- 输入框：邮箱地址
- 验证：邮箱验证码
- 密码设置：强度检测、二次确认

#### UI 设计要点

- 与登录页面风格统一
- 用户协议勾选
- 密码强度可视化提示
- 注册成功后自动跳转登录

## Mock 数据方案

使用 Mock 数据进行前端开发，无需依赖后端 API。

### Mock 数据结构

```typescript
// mock/users.ts
interface MockUser {
  id: string;
  phone?: string;
  email?: string;
  password: string;
  nickname: string;
  avatar: string;
  createdAt: string;
}

// mock/verification.ts
interface MockCode {
  phone?: string;
  email?: string;
  code: string;
  expireAt: number;
}
```

### Mock API 设计


| 接口                | 方法 | 说明         |
| ------------------- | ---- | ------------ |
| /api/auth/send-code | POST | 发送验证码   |
| /api/auth/login     | POST | 用户登录     |
| /api/auth/register  | POST | 用户注册     |
| /api/auth/logout    | POST | 用户登出     |
| /api/user/profile   | GET  | 获取用户信息 |

## TODO

### 第一阶段：基础框架搭建

- [ ]  创建项目目录结构
- [ ]  配置路由系统（React Router）
- [ ]  配置状态管理（Zustand / Jotai）
- [ ]  配置 UI 组件库（Ant Design / shadcn/ui）
- [ ]  配置 CSS 方案（Tailwind CSS / CSS Modules）
- [ ]  配置 HTTP 请求库（Axios）
- [ ]  配置 Mock 服务（MSW / Vite Plugin）

### 第二阶段：登录注册功能

- [ ]  创建登录页面组件
- [ ]  创建注册页面组件
- [ ]  实现手机号/邮箱 Tab 切换
- [ ]  实现表单验证逻辑
- [ ]  实现验证码发送倒计时
- [ ]  实现密码强度检测
- [ ]  实现登录/注册 API 调用
- [ ]  实现登录状态持久化

### 第三阶段：UI 美化

- [ ]  设计登录页面渐变背景
- [ ]  添加页面过渡动画
- [ ]  实现响应式布局适配
- [ ]  添加 Loading 骨架屏
- [ ]  添加错误提示组件
- [ ]  优化表单交互体验

### 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 开发规范

### 命名规范

- 组件文件：PascalCase（如 `UserLogin.tsx`）
- 工具文件：camelCase（如 `formatDate.ts`）
- 类型文件：camelCase（如 `userTypes.ts`）
- 常量文件：UPPER_SNAKE_CASE（如 `API_CONSTANTS.ts`）

### 代码风格

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 组件使用函数式写法 + Hooks
- 优先使用 TypeScript 类型推导

### Git 提交规范

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具变动
```

## License

MIT
