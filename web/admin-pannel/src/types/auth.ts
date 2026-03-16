// src/types/auth.ts

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