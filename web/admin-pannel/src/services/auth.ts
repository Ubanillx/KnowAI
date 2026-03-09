// 定义通用的 API 响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 模拟网络延迟函数
const simulateNetwork = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'know_ai_users';

// --- 新增：初始数据种子逻辑 ---
const seedInitialData = () => {
  const existingUsers = localStorage.getItem(STORAGE_KEY);
  if (!existingUsers) {
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'password123', // 预设密码
        email: 'admin@knowai.com'
      },
      {
        id: 2,
        username: 'testuser',
        password: 'password123',
        email: 'test@knowai.com'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    console.log('[Mock] 已初始化预置测试账号: admin / password123');
  }
};

// 执行初始化
seedInitialData();
// -----------------------



export const authService = {
  // 模拟发送验证码
  // 模拟发送验证码
  async sendEmailCode(email: string): Promise<ApiResponse> {
    await simulateNetwork(800);
    
    // 生成一个随机 6 位数（或者为了方便测试，直接写死 123456）
    const mockCode = "123456"; 
    
    // 关键：在控制台打印出来，这就是你“收”到的邮件
    console.log(`%c[邮件服务器] 正在向 ${email} 发送验证码...`, "color: blue; font-weight: bold;");
    console.log(`%c您的验证码是: ${mockCode}`, "color: red; font-size: 16px; font-weight: bold;");
    
    return { code: 200, message: "验证码已发送，请检查控制台（模拟邮箱）" };
  },

  // 模拟注册
  async register(payload: any): Promise<ApiResponse> {
    await simulateNetwork(1500);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    if (users.find((u: any) => u.username === payload.username)) {
      throw new Error("该用户名已被占用");
    }

    users.push({ 
      id: Date.now(), 
      username: payload.username, 
      password: payload.password, // 实际开发中禁止明文存储！
      email: payload.email 
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return { code: 200, message: "注册成功！请前往登录" };
  },

  // 模拟登录
  async login(payload: any): Promise<ApiResponse> {
    await simulateNetwork(1200);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const user = users.find((u: any) => u.username === payload.username && u.password === payload.password);

    if (user) {
      return { 
        code: 200, 
        message: "登录成功", 
        data: { token: "mock_jwt_token_" + btoa(payload.username), user: { username: user.username } } 
      };
    }
    throw new Error("用户名或密码错误");
  }
};