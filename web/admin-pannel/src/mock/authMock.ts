// src/mock/authMock.ts
import type { MockUser, MockCode } from '../types/auth';

export const USERS_KEY = 'know_ai_users';
export const CODES_KEY = 'know_ai_verifications';
export const CAPTCHA_STORE = 'know_ai_captcha_temp';

// 封装一个简单的 Mock 数据库操作对象
export const mockDB = {
  getUsers: (): MockUser[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]'),
  
  saveUsers: (users: MockUser[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users)),
  
  getCodes: (): MockCode[] => JSON.parse(localStorage.getItem(CODES_KEY) || '[]'),
  
  saveCodes: (codes: MockCode[]) => localStorage.setItem(CODES_KEY, JSON.stringify(codes)),

  // 统一的动态验证码校验逻辑
  verifyMockCode: (phone?: string, email?: string, code?: string) => {
    if (!code) throw new Error("请输入验证码");
    const codes = mockDB.getCodes();
    const isCodeValid = codes.some(c => 
      ( (phone && c.phone === phone) || (email && c.email === email) ) && 
      c.code === code && 
      c.expireAt > Date.now()
    );
    if (!isCodeValid) throw new Error("动态验证码不正确或已过期");
  }
};