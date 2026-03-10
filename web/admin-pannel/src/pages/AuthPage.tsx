// pages/AuthPage.tsx
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/auth';
import logoSvg from '../assets/logo.svg';

type AuthMode = 'login' | 'register' | 'forgot';
type LoginMethod = 'phone' | 'email';

const REMEMBER_KEY = 'know_ai_remembered';
const TOKEN_KEY = 'know_ai_token';

const INITIAL_FORM_DATA = {
  areaCode: '+86', phone: '', email: '', password: '', confirmPassword: '', code: '', captchaInput: ''
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<LoginMethod>('phone');
  const [resetStep, setResetStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [captchaData, setCaptchaData] = useState({ img: '', key: '' });
  const [agreed, setAgreed] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshCaptcha = useCallback(async () => {
    try {
      const res = await authService.getCaptcha();
      if (res.data) setCaptchaData(res.data);
    } catch (err) { console.error("获取验证码失败"); }
  }, []);

  useEffect(() => { refreshCaptcha(); }, [refreshCaptcha, mode, method]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
          // 如果是 sessionStorage 里的 Token（单次会话），静默跳转即可，避免给用户“自动登录配置失败”的错觉
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
      setCountdown(60);
      setMessage({ type: 'success', text: '验证码已发送' });
    } catch (err) {
      const error = err as Error;
      setMessage({ type: 'error', text: error.message });
      refreshCaptcha();
    }
  };

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

        // 🛠️ 修复：只有在使用账号密码登录时，才处理“记住密码”状态，防止污染
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
      const error = err as Error;
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const retainFormData = () => {
    setFormData(prev => ({
      ...prev,
      password: '', confirmPassword: '', code: '', captchaInput: ''
    }));
  };

  const handleMethodSwitch = (m: LoginMethod) => {
    setMethod(m);
    setMessage({type:'', text:''});
    setFormData(prev => ({
      ...prev,
      [m === 'phone' ? 'email' : 'phone']: '',
      password: '', confirmPassword: '', code: '', captchaInput: ''
    }));
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setMessage({type:'', text:''});
    retainFormData(); 
    if (newMode === 'login') setResetStep(1);
  };

  // 🛠️ 修复：复选框改变时即刻清理数据，不留后患
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-static-gradient p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-[460px] glass-card p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl transition-all duration-300 relative">
        
        <div className="flex justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <img src={logoSvg} alt="KnowAI Logo" className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 object-contain" />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight truncate">
                {mode === 'login' ? '登录' : mode === 'register' ? '注册' : '找回密码'}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium tracking-wide truncate">
                {mode === 'forgot' ? (resetStep === 1 ? '安全验证' : '重置密码') : 'KNOW AI 管理系统'}
              </p>
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="flex flex-shrink-0 bg-slate-100/50 p-1 rounded-xl sm:rounded-2xl">
              <button onClick={() => switchMode('login')} className={`px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all ${mode === 'login' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}>登录</button>
              <button onClick={() => switchMode('register')} className={`px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all ${mode === 'register' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}>注册</button>
            </div>
          )}
        </div>

        {mode === 'forgot' && (
          <button onClick={() => switchMode('login')} className="mb-6 text-xs font-bold text-indigo-600 flex items-center gap-1 hover:opacity-80 transition-opacity">
            ← 返回登录
          </button>
        )}

        <div className="flex gap-6 sm:gap-8 mb-6 sm:mb-8 border-b border-gray-100 relative overflow-x-auto no-scrollbar">
          {(['phone', 'email'] as const).map((m) => (
            <button 
              key={m} 
              onClick={() => handleMethodSwitch(m)} 
              className={`pb-3 text-xs sm:text-sm font-bold transition-all relative flex-shrink-0 ${method === m ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {m === 'phone' 
                ? (mode === 'login' ? '手机验证' : mode === 'register' ? '手机号注册' : '手机找回') 
                : (mode === 'login' ? '密码登录' : mode === 'register' ? '邮箱注册' : '邮箱找回')}
              {method === m && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full animate-in fade-in" />}
            </button>
          ))}
        </div>

        {message.text && (
          <div className={`mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium border animate-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
            {message.text}
          </div>
        )}

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} autoComplete="off">
          
          {(mode !== 'forgot' || resetStep === 1) && (
            <>
              {method === 'phone' ? (
                <Input 
                  label="手机号码" type="tel" placeholder="请输入手机号" autoComplete="off"
                  leftElement={<input type="text" className="w-10 sm:w-12 bg-transparent text-slate-800 font-bold text-xs sm:text-sm outline-none" value={formData.areaCode} onChange={e => setFormData({...formData, areaCode: e.target.value})}/>}
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required
                />
              ) : (
                <Input label={mode === 'login' ? "账号" : "邮箱地址"} type="text" placeholder={mode === 'login' ? "手机号 / 邮箱" : "name@example.com"} autoComplete="off" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              )}

              {needsVerification && (
                <Input 
                  label="图形验证码" placeholder="右侧字符" autoComplete="off" value={formData.captchaInput} onChange={e => setFormData({...formData, captchaInput: e.target.value})}
                  rightElement={<img src={captchaData.img} alt="captcha" onClick={refreshCaptcha} className="h-8 sm:h-9 w-20 sm:w-24 object-cover rounded-lg cursor-pointer hover:opacity-80 bg-slate-100"/>}
                />
              )}

              {needsVerification && (
                <Input 
                  label="动态验证码" placeholder="6位验证码" maxLength={6} autoComplete="off" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                  rightElement={<button type="button" disabled={countdown > 0} onClick={handleSendCode} className="text-indigo-600 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 hover:bg-indigo-50 rounded-lg disabled:text-gray-300">{countdown > 0 ? `${countdown}s` : '获取验证码'}</button>}
                />
              )}
            </>
          )}

          {( (mode === 'forgot' && resetStep === 2) || (mode === 'login' && method === 'email') || mode === 'register' ) && (
            <div className="space-y-2 animate-in fade-in duration-500">
              <Input 
                label={mode === 'forgot' ? "新密码" : (mode === 'register' ? "设置密码" : "密码")} 
                type="password" placeholder="请输入密码" autoComplete="new-password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
              />
              {mode !== 'login' && formData.password && (
                <div className="px-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">强度: {passwordInfo.text}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${passwordInfo.score >= s ? passwordInfo.color : 'bg-slate-100'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(mode === 'register' || (mode === 'forgot' && resetStep === 2)) && (
            <Input label="确认密码" type="password" placeholder="再次输入密码" autoComplete="new-password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} error={formData.confirmPassword && formData.password !== formData.confirmPassword ? '密码输入不一致' : ''} required />
          )}

          {mode === 'login' && (
            <div className="flex flex-wrap items-center justify-between gap-y-2 px-1 text-[10px] sm:text-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-3 sm:gap-4">
                {method === 'email' && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={rememberPassword} onChange={handleRememberChange} className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-50 transition-all" />
                      <span className="text-gray-500 group-hover:text-slate-700 font-medium transition-colors">记住密码</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={autoLogin} onChange={handleAutoLoginChange} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all" />
                      <span className="text-gray-500 group-hover:text-slate-700 font-medium transition-colors">自动登录</span>
                    </label>
                  </>
                )}
              </div>
              <button type="button" onClick={() => switchMode('forgot')} className="font-bold text-indigo-600 hover:text-indigo-500 underline underline-offset-2 transition-colors">忘记密码？</button>
            </div>
          )}

          <Button 
            loading={loading} type="submit" 
            disabled={(mode !== 'forgot' && !agreed) || loading}
            className={`h-11 sm:h-12 shadow-xl rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold transition-all ${ (mode !== 'forgot' && !agreed) ? 'grayscale opacity-70 cursor-not-allowed' : 'shadow-indigo-100 hover:-translate-y-0.5 active:translate-y-0'}`}
          >
            {mode === 'login' ? '进入系统' : mode === 'register' ? '立即注册' : (resetStep === 1 ? '下一步' : '重置密码')}
          </Button>
        </form>

        {mode !== 'forgot' && (
          <div className="mt-8 sm:mt-10 text-center">
            <label className="inline-flex items-start justify-center gap-2 cursor-pointer group px-2">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all" />
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium text-left sm:text-center">
                我已阅读并同意 <a href="#" className="text-slate-600 font-bold hover:text-indigo-600 px-0.5 transition-colors">《服务协议》</a> 与 <a href="#" className="text-slate-600 font-bold hover:text-indigo-600 px-0.5 transition-colors">《隐私政策》</a>
              </p>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}