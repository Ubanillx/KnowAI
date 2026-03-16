import { useState, useEffect } from 'react';
// ✅ 修复点 1：使用 type 关键字导入 MockUser 类型
import { authService, type MockUser } from '../../services/auth';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function Settings() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const USERS_KEY = 'know_ai_users';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 获取个人资料逻辑参考 auth.ts [cite: 117]
        const res = await authService.getProfile();
        if (res.data) {
          setUser(res.data); // [cite: 119]
          setNickname(res.data.nickname); // [cite: 114]
        }
      } catch (err) {
        console.error("获取用户信息失败", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // 模拟数据库更新逻辑
      const users: MockUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      
      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return { ...u, nickname: nickname };
        }
        return u;
      });

      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      setMessage({ type: 'success', text: '个人信息已更新' });
    } catch (err) {
      setMessage({ type: 'error', text: '保存失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-gray-400">正在加载用户信息...</div>;

  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">系统设置</h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">管理你的账号信息与系统偏好</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sm:p-10">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-50">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-md"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center cursor-pointer">
                <span className="text-white text-[10px]">✎</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">个人头像</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 或 SVG 格式</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Input 
              label="用户昵称" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              placeholder="请输入新的昵称"
              required
            />
            
            <Input 
              label="关联账号" 
              value={user.email || user.phone || ''} 
              disabled 
              placeholder="未绑定"
            />
          </div>

          {message.text && (
            <div className={`p-4 rounded-2xl text-sm font-medium border ${
              message.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <div className="pt-4">
            <Button 
              type="submit" 
              loading={loading}
              className="w-full sm:w-auto px-10 bg-indigo-600 shadow-xl shadow-indigo-100"
            >
              保存更改
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}