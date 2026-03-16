import { useState, useEffect } from 'react';
import { authService } from '../../services/auth';
import type { MockUser } from '../../types/auth'; // ✨ 从新的 types 目录导入
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { THEME } from '../../components/ui/theme';

export default function Settings() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getProfile();
        if (res.data) {
          setUser(res.data);
          setNickname(res.data.nickname);
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
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const users: MockUser[] = JSON.parse(localStorage.getItem('know_ai_users') || '[]');
      const updatedUsers = users.map(u => u.id === user.id ? { ...u, nickname } : u);
      localStorage.setItem('know_ai_users', JSON.stringify(updatedUsers));
      setMessage({ type: 'success', text: '个人信息已更新' });
    } catch (err) {
      setMessage({ type: 'error', text: '保存失败' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-4 text-gray-400 text-sm">正在加载...</div>;

  return (
    <div className="max-w-2xl animate-in fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-black text-slate-800">系统设置</h1>
        <p className="text-xs text-gray-400 font-medium">管理你的账号信息</p>
      </div>

      <div className={`bg-white ${THEME.RADIUS} shadow-sm border ${THEME.COLORS.BORDER} ${THEME.CARD_PADDING}`}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
            <img src={user.avatar} className={`w-14 h-14 ${THEME.RADIUS} border-2 border-white shadow-sm`} />
            <div>
              <p className="text-sm font-bold text-slate-800">个人头像</p>
              <p className="text-[10px] text-gray-400">JPG、PNG 或 SVG</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input label="用户昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
            <Input label="关联账号" value={user.email || user.phone || ''} disabled />
          </div>

          {message.text && (
            <div className={`p-3 ${THEME.RADIUS} text-xs font-medium border ${
              message.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full sm:w-auto px-8">
              保存更改
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}