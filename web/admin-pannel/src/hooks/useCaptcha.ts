// src/hooks/useCaptcha.ts
import { useState, useCallback } from 'react';
import { authService } from '../services/auth';

export const useCaptcha = () => {
  const [captchaData, setCaptchaData] = useState({ img: '', key: '' });

  const refreshCaptcha = useCallback(async () => {
    try {
      const res = await authService.getCaptcha();
      if (res.data) setCaptchaData(res.data);
    } catch (err) { 
      console.error("获取验证码失败"); 
    }
  }, []);

  return { captchaData, refreshCaptcha };
};