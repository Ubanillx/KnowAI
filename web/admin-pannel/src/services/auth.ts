// src/services/auth.ts
import type { 
  ApiResponse, MockUser, SendCodePayload, 
  RegisterPayload, LoginPayload, ResetPasswordPayload 
} from '../types/auth';
import { simulateNetwork } from '../utils/request';
import { mockDB, CAPTCHA_STORE } from '../mock/authMock';

export const TOKEN_KEY = 'know_ai_token';

export const authService = {
  // 获取图形验证码
  async getCaptcha(): Promise<ApiResponse<{ img: string; key: string }>> {
    await simulateNetwork(300);
    const key = Math.random().toString(36).slice(2);
    const text = Math.random().toString(36).slice(-4).toUpperCase();
    
    sessionStorage.setItem(CAPTCHA_STORE, JSON.stringify({ key, text }));
    const img = `https://dummyimage.com/120x40/6366f1/ffffff&text=${text}`;
    return { code: 200, message: "获取成功", data: { img, key } };
  },

  // 发送动态验证码
  async sendCode(payload: SendCodePayload): Promise<ApiResponse> {
    await simulateNetwork(500);
    const stored = JSON.parse(sessionStorage.getItem(CAPTCHA_STORE) || '{}');
    
    if (!payload.captchaInput || payload.captchaInput.toUpperCase() !== stored.text || payload.captchaKey !== stored.key) {
      throw new Error("图形验证码错误");
    }
    
    sessionStorage.removeItem(CAPTCHA_STORE);
    const code = "123456"; // 模拟验证码固定为123456
    const expireAt = Date.now() + 5 * 60 * 1000;
    
    const codes = mockDB.getCodes();
    codes.push({ phone: payload.phone, email: payload.email, code, expireAt });
    mockDB.saveCodes(codes);
    
    console.log(`%c[Mock API] 验证码: ${code}`, "color: red; font-weight: bold;");
    return { code: 200, message: "动态验证码已发送" };
  },

  // 验证码校验
  async verifyCode(payload: { phone?: string; email?: string; code?: string }): Promise<ApiResponse> {
    await simulateNetwork(400);
    mockDB.verifyMockCode(payload.phone, payload.email, payload.code);
    return { code: 200, message: "验证成功" };
  },

  // 注册
  async register(payload: RegisterPayload): Promise<ApiResponse<MockUser>> {
    await simulateNetwork(800);
    const users = mockDB.getUsers();

    mockDB.verifyMockCode(payload.phone, payload.email, payload.code);
    
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
    mockDB.saveUsers(users);
    return { code: 200, message: "注册成功", data: newUser };
  },

  // 登录
  async login(payload: LoginPayload): Promise<ApiResponse<{ token: string; user: Partial<MockUser> }>> {
    await simulateNetwork(800);
    const users = mockDB.getUsers();
    
    let user: MockUser | undefined;
    if (payload.phone) {
      mockDB.verifyMockCode(payload.phone, undefined, payload.code);
      user = users.find(u => u.phone === payload.phone);
      if (!user) throw new Error("该手机号尚未注册");
    } else {
      const username = payload.username || '';
      user = users.find(u => {
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

  // 退出登录
  async logout(): Promise<ApiResponse> {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    return { code: 200, message: "已退出登录" };
  },

  // 获取个人信息
  async getProfile(): Promise<ApiResponse<MockUser>> {
    await simulateNetwork(500);
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error("未登录或登录已失效");
    
    try {
      const userId = window.atob(token.replace('mock_token_', ''));
      const users = mockDB.getUsers();
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
    const users = mockDB.getUsers();
    
    mockDB.verifyMockCode(payload.phone, payload.email, payload.code);
    
    const userIndex = users.findIndex(u => 
      (payload.phone && u.phone === payload.phone) || 
      (payload.email && u.email === payload.email)
    );
    if (userIndex === -1) throw new Error("该账号未注册");

    if (payload.newPassword) {
      users[userIndex].password = payload.newPassword;
    }
    mockDB.saveUsers(users);
    return { code: 200, message: "密码重置成功，请重新登录" };
  }
};