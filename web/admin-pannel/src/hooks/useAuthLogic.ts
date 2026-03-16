// src/hooks/useAuthLogic.ts
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { useCountdown } from './useCountdown';
import { useCaptcha } from './useCaptcha';

export type AuthMode = 'login' | 'register' | 'forgot';
export type LoginMethod = 'phone' | 'email';

const REMEMBER_KEY = 'know_ai_remembered';
const TOKEN_KEY = 'know_ai_token';
const INITIAL_FORM_DATA = {
  areaCode: '+86', phone: '', email: '', password: '', confirmPassword: '', code: '', captchaInput: ''
};

export const useAuthLogic = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<LoginMethod>('phone');
  const [resetStep, setResetStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [agreed, setAgreed] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 引入我们刚才拆分的基础 Hooks
  const { countdown, start: startCountdown } = useCountdown(0);
  const { captchaData, refreshCaptcha } = useCaptcha();

  // 自动刷新图形验证码
  useEffect(() => { refreshCaptcha(); }, [refreshCaptcha, mode, method]);

  // 处理记住密码与自动登录
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      const { account, password } = JSON.parse(saved);
      setFormData(prev => ({ ...prev, email: account, password: password }));
      setRememberPassword(true);
      setMethod('email'); 
    }

    const checkAutoLogin = async () => {
      const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      if (token) { 
        try {
          const res = await authService.getProfile();
          if (localStorage.getItem(TOKEN_KEY)) {
            setMessage({ type: 'success', text: `自动登录中... 欢迎 ${res.data?.nickname}` });
          }
          timerRef.current = setTimeout(() => navigate('/dashboard'), 1000); 
        } catch (e) {
          localStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
        }
      }
    };
    checkAutoLogin();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate]);

  // 密码强度计算
  const passwordInfo = useMemo(() => {
    const pass = formData.password;
    if (!pass) return { score: 0, text: '', color: 'bg-gray-200' };
    if (pass.length < 6) return { score: 1, text: '太短', color: 'bg-red-400' };
    let score = 0;
    if (/[a-zA-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const meta = [{ text: '弱', color: 'bg-red-400' }, { text: '中', color: 'bg-yellow-500' }, { text: '强', color: 'bg-green-500' }];
    return { score, ...meta[Math.max(0, score - 1)] };
  }, [formData.password]);

  // 发送验证码
  const handleSendCode = async () => {
    const isPhone = method === 'phone';
    const target = isPhone ? formData.phone : formData.email;

    if (!target) return setMessage({ type: 'error', text: '请输入账号' });
    if (isPhone && !/^\d{5,15}$/.test(formData.phone)) return setMessage({ type: 'error', text: '手机号格式不正确' });
    if (!isPhone && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setMessage({ type: 'error', text: '邮箱格式不正确' });
    if (!formData.captchaInput) return setMessage({ type: 'error', text: '请输入图形验证码' });
    
    try {
      await authService.sendCode({
        phone: isPhone ? `${formData.areaCode}${formData.phone}` : undefined,
        email: (!isPhone) ? formData.email : undefined,
        captchaInput: formData.captchaInput,
        captchaKey: captchaData.key
      });
      startCountdown(60); // 使用剥离后的 Hook 方法
      setMessage({ type: 'success', text: '验证码已发送' });
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
      refreshCaptcha();
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (mode !== 'forgot' && !agreed) return setMessage({ type: 'error', text: '请阅读并勾选用户协议' });

    setLoading(true);
    try {
      if (mode === 'forgot') {
        if (resetStep === 1) {
          if (!formData.code) throw new Error("请输入验证码");
          await authService.verifyCode({
            phone: method === 'phone' ? `${formData.areaCode}${formData.phone}` : undefined,
            email: method === 'email' ? formData.email : undefined,
            code: formData.code
          });
          setResetStep(2);
          setMessage({ type: 'success', text: '身份验证成功，请设置新密码' });
        } else {
          if (formData.password !== formData.confirmPassword) throw new Error("两次密码不一致");
          await authService.resetPassword({
            phone: method === 'phone' ? `${formData.areaCode}${formData.phone}` : undefined,
            email: method === 'email' ? formData.email : undefined,
            code: formData.code,
            newPassword: formData.password
          });
          setMessage({ type: 'success', text: '密码重置成功，请登录' });
          setMode('login');
          setResetStep(1);
          retainFormData(); 
        }
      } else if (mode === 'login') {
        const payload = method === 'phone' 
          ? { phone: `${formData.areaCode}${formData.phone}`, code: formData.code, autoLogin }
          : { username: formData.email, password: formData.password, autoLogin };
        
        const res = await authService.login(payload);

        if (method === 'email') {
          if (rememberPassword) {
            localStorage.setItem(REMEMBER_KEY, JSON.stringify({ account: formData.email, password: formData.password }));
          } else {
            localStorage.removeItem(REMEMBER_KEY);
          }
        }

        setMessage({ type: 'success', text: `欢迎回来，${res.data?.user?.nickname}` });
        timerRef.current = setTimeout(() => navigate('/dashboard'), 800);
        
      } else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) throw new Error("两次输入密码不一致");
        await authService.register({
          phone: method === 'phone' ? `${formData.areaCode}${formData.phone}` : undefined,
          email: method === 'email' ? formData.email : undefined,
          password: formData.password,
          code: formData.code
        });
        setMessage({ type: 'success', text: '注册成功' });
        setMode('login');
        retainFormData(); 
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const retainFormData = () => {
    setFormData(prev => ({
      ...prev, password: '', confirmPassword: '', code: '', captchaInput: ''
    }));
  };

  const handleMethodSwitch = (m: LoginMethod) => {
    setMethod(m);
    setMessage({type:'', text:''});
    setFormData(prev => ({
      ...prev, [m === 'phone' ? 'email' : 'phone']: '', password: '', confirmPassword: '', code: '', captchaInput: ''
    }));
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setMessage({type:'', text:''});
    retainFormData(); 
    if (newMode === 'login') setResetStep(1);
  };

  const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberPassword(checked);
    if (!checked) localStorage.removeItem(REMEMBER_KEY);
  };

  const handleAutoLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAutoLogin(checked);
    if (!checked) localStorage.removeItem(TOKEN_KEY); 
  };

  const needsVerification = !(mode === 'login' && method === 'email');

  // 暴露给 UI 组件的所有状态和方法
  return {
    mode, method, resetStep, loading, formData, setFormData, agreed, setAgreed,
    rememberPassword, autoLogin, message, passwordInfo, needsVerification,
    countdown, captchaData, refreshCaptcha,
    handleSendCode, handleSubmit, handleMethodSwitch, switchMode,
    handleRememberChange, handleAutoLoginChange
  };
};