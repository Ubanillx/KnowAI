import { useState, useEffect } from 'react';
import { THEME } from '../../components/ui/theme';
import { Trash2, Mail, Phone } from 'lucide-react'; // 建议引入图标

interface User {
  id: string;
  nickname: string;
  email?: string;
  phone?: string;
  avatar: string;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const USERS_KEY = 'know_ai_users';

  const loadUsers = () => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该用户吗？')) {
      const updatedUsers = users.filter(user => user.id !== id);
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* 头部区域：间距减少 */}
      <div className="flex justify-between items-center mb-4">
      </div>

      {/* 用户列表表格：圆角统一 */}
      <div className={`bg-white ${THEME.RADIUS} shadow-sm border ${THEME.COLORS.BORDER} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">用户信息</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">账号详情</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">注册时间</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} className={`w-8 h-8 ${THEME.RADIUS} border border-slate-100 shadow-sm`} />
                        <span className="text-sm font-bold text-slate-700">{user.nickname}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        {user.email ? <Mail size={12}/> : <Phone size={12}/>}
                        {user.email || user.phone || '未绑定'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400 text-xs italic">
                    暂无用户数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}