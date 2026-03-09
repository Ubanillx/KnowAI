// services/auth.ts
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export interface MockUser {
  id: string;
  phone?: string;
  email?: string;
  password: string;
  nickname: string;
  avatar: string;
  createdAt: string;
}

export interface MockCode {
  phone?: string;
  email?: string;
  code: string;
  expireAt: number;
}

export interface SendCodePayload {
  phone?: string;
  email?: string;
  captchaInput: string;
  captchaKey: string;
}

export interface RegisterPayload {
  phone?: string;
  email?: string;
  password?: string;
  code?: string;
}

export interface LoginPayload {
  phone?: string;
  username?: string;
  password?: string;
  code?: string;
  autoLogin?: boolean;
}

export interface ResetPasswordPayload {
  phone?: string;
  email?: string;
  code?: string;
  newPassword?: string;
}

const simulateNetwork = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

const USERS_KEY = 'know_ai_users';
const CODES_KEY = 'know_ai_verifications';
const TOKEN_KEY = 'know_ai_token';
const CAPTCHA_STORE = 'know_ai_captcha_temp';

// 🛠️ 优化 1：抽离 DRY 动态验证码校验逻辑
const verifyMockCode = (phone?: string, email?: string, code?: string) => {
  if (!code) throw new Error("请输入验证码");
  const codes: MockCode[] = JSON.parse(localStorage.getItem(CODES_KEY) || '[]');
  const isCodeValid = codes.some(c => 
    ( (phone && c.phone === phone) || (email && c.email === email) ) && 
    c.code === code && 
    c.expireAt > Date.now()
  );
  if (!isCodeValid) throw new Error("动态验证码不正确或已过期");
};

export const authService = {
  // 获取图形验证码
  async getCaptcha(): Promise<ApiResponse<{ img: string; key: string }>> {
    await simulateNetwork(300);
    const key = Math.random().toString(36).slice(2);
    const text = Math.random().toString(36).slice(-4).toUpperCase();
    // 🛠️ 优化 2：改用 sessionStorage 防止多标签页冲突
    sessionStorage.setItem(CAPTCHA_STORE, JSON.stringify({ key, text }));
    const img = `https://dummyimage.com/120x40/6366f1/ffffff&text=${text}`;
    return { code: 200, message: "获取成功", data: { img, key } };
  },

  // 发送动态验证码 (短信/邮箱)
  async sendCode(payload: SendCodePayload): Promise<ApiResponse> {
    await simulateNetwork(500);
    const stored = JSON.parse(sessionStorage.getItem(CAPTCHA_STORE) || '{}');
    
    if (!payload.captchaInput || payload.captchaInput.toUpperCase() !== stored.text || payload.captchaKey !== stored.key) {
      throw new Error("图形验证码错误");
    }
    
    sessionStorage.removeItem(CAPTCHA_STORE);

    const code = "123456"; 
    const expireAt = Date.now() + 5 * 60 * 1000;
    
    const codes: MockCode[] = JSON.parse(localStorage.getItem(CODES_KEY) || '[]');
    codes.push({ phone: payload.phone, email: payload.email, code, expireAt });
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
    
    console.log(`%c[Mock API] 验证码: ${code}`, "color: red; font-weight: bold;");
    return { code: 200, message: "动态验证码已发送" };
  },

  // 🛠️ 新增：单独的验证码校验接口（用于找回密码 Step 1）
  async verifyCode(payload: { phone?: string; email?: string; code?: string }): Promise<ApiResponse> {
    await simulateNetwork(400);
    verifyMockCode(payload.phone, payload.email, payload.code);
    return { code: 200, message: "验证成功" };
  },

  // 注册逻辑
  async register(payload: RegisterPayload): Promise<ApiResponse<MockUser>> {
    await simulateNetwork(800);
    const users: MockUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

    // 调用公共校验
    verifyMockCode(payload.phone, payload.email, payload.code);

    if (payload.email && users.some(u => u.email === payload.email)) throw new Error("该邮箱已被注册");
    if (payload.phone && users.some(u => u.phone === payload.phone)) throw new Error("该手机号已被注册");

    const newUser: MockUser = {
      id: `u_${Date.now()}`,
      phone: payload.phone,
      email: payload.email,
      password: payload.password || '',
      nickname: payload.phone || payload.email?.split('@')[0] || '新用户',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { code: 200, message: "注册成功", data: newUser };
  },

  // 登录逻辑
  async login(payload: LoginPayload): Promise<ApiResponse<{ token: string; user: Partial<MockUser> }>> {
    await simulateNetwork(800);
    const users: MockUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    let user: MockUser | undefined;
    
    if (payload.phone) {
      verifyMockCode(payload.phone, undefined, payload.code);
      user = users.find(u => u.phone === payload.phone);
      if (!user) throw new Error("该手机号尚未注册");
    } else {
      // 账号密码登录分支
      const username = payload.username || '';
      user = users.find(u => {
        // 兼容处理：检查邮箱匹配、精确手机号匹配，或者默认补齐 +86 的手机号匹配
        const isEmailMatch = u.email === username;
        const isPhoneMatch = u.phone === username || u.phone === `+86${username}`;
        
        return (isEmailMatch || isPhoneMatch) && u.password === payload.password;
      });
    }

    if (!user) throw new Error("账号或密码错误");

    const token = `mock_token_${window.btoa(user.id)}`;
    
    if (payload.autoLogin) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    }

    return {
      code: 200,
      message: "登录成功",
      data: { token, user: { nickname: user.nickname, avatar: user.avatar } }
    };
  },

  async logout(): Promise<ApiResponse> {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    return { code: 200, message: "已退出登录" };
  },

  async getProfile(): Promise<ApiResponse<MockUser>> {
    await simulateNetwork(500);
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    
    if (!token) throw new Error("未登录或登录已失效");
    
    try {
      const userId = window.atob(token.replace('mock_token_', ''));
      const users: MockUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find(u => u.id === userId);
      
      if (!user) throw new Error("用户不存在");
      return { code: 200, message: "获取成功", data: user };
    } catch (e) {
      throw new Error("无效的身份令牌");
    }
  },

  // 重置密码
  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse> {
    await simulateNetwork(1000);
    const users: MockUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    verifyMockCode(payload.phone, payload.email, payload.code);

    const userIndex = users.findIndex(u => 
      (payload.phone && u.phone === payload.phone) || 
      (payload.email && u.email === payload.email)
    );
    
    if (userIndex === -1) throw new Error("该账号未注册");

    if (payload.newPassword) {
      users[userIndex].password = payload.newPassword;
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { code: 200, message: "密码重置成功，请重新登录" };
  }
};