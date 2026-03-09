import { useState, useEffect } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/auth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    username: '', password: '', confirmPassword: '', email: '', code: '' 
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  // 验证码倒计时状态
  const [countdown, setCountdown] = useState(0);

  // 处理倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!formData.email) return setMessage({ type: 'error', text: '请先输入邮箱' });
    try {
      await authService.sendEmailCode(formData.email);
      setCountdown(60); // 开启60秒倒计时
      setMessage({ type: 'success', text: '验证码发送成功（Mock）' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // 逻辑校验
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        return setMessage({ type: 'error', text: '两次输入的密码不一致' });
      }
      if (formData.password.length < 6) {
        return setMessage({ type: 'error', text: '密码至少需要6位' });
      }
      if (!formData.code) {
        return setMessage({ type: 'error', text: '请输入验证码' });
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        // 修改后 (访问 data 路径)
        const res = await authService.login(formData);
        // res.data 才是我们 Mock 返回的那个包含 token 和 user 的对象
        setMessage({ type: 'success', text: `欢迎回来，${res.data?.user.username}！` });
      } else {
        await authService.register(formData);
        setMessage({ type: 'success', text: '注册成功，请登录' });
        setIsLogin(true); // 注册成功自动切换到登录
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{isLogin ? '登录' : '注册'}</h2>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm text-center animate-pulse ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message.text}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* 注册特有字段：邮箱 */}
          {!isLogin && (
            <div className="space-y-4">
              <Input 
                label="电子邮箱" type="email" required placeholder="name@example.com"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input 
                    label="验证码" type="text" required placeholder="6位数字"
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <button 
                  type="button"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                  className="h-[42px] px-4 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                >
                  {countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码'}
                </button>
              </div>
            </div>
          )}

          <Input 
            label="用户名" type="text" required placeholder="请输入用户名"
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
          
          <Input 
            label="密码" type="password" required placeholder="请输入密码"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />

          {/* 注册特有字段：确认密码 */}
          {!isLogin && (
            <Input 
              label="确认密码" type="password" required placeholder="请再次输入密码"
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            />
          )}
          
          <Button loading={loading} type="submit">
            {isLogin ? '登录' : '注册'}
          </Button>
        </form>

        <div className="text-center pt-2">
          <button 
            onClick={() => { setIsLogin(!isLogin); setMessage({type: '', text: ''}); }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            {isLogin ? '还没有账号？点此注册' : '已有账号？点此登录'}
          </button>
        </div>
      </div>
    </div>
  );
}