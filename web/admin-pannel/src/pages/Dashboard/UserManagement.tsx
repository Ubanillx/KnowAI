import { useState, useEffect } from 'react';
import { Button } from '../../components/Button';

// 定义用户类型（参考 auth.ts 中的 MockUser）
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

  // 1. 从 localStorage 加载用户数据
  const loadUsers = () => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 2. 删除用户功能（模拟）
  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该用户吗？')) {
      const updatedUsers = users.filter(user => user.id !== id);
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">用户管理</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">查看并管理系统中注册的所有用户信息</p>
        </div>
        <Button className="bg-indigo-600 shadow-lg shadow-indigo-100 px-6">
          新增用户
        </Button>
      </div>

      {/* 用户列表表格 */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">用户信息</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">账号详情</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">注册时间</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm" />
                      <span className="font-bold text-slate-700">{user.nickname}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {user.email || user.phone || '未绑定'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors opacity-0 group-hover:opacity-100"
                    >
                      删除账号
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                  暂无用户数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}