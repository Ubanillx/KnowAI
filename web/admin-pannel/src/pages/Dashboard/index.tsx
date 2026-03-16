import { useState, useEffect } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom'; // 引入 useLocation
import { 
  LayoutDashboard, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell, 
  ChevronRight, // 引入箭头图标
  UserCircle 
} from 'lucide-react';
import { authService } from '../../services/auth';
import { Button } from '../../components/Button';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation(); // 获取当前路由位置
  const [nickname, setNickname] = useState('管理员');

  // 1. 定义路径与中文名的映射表
  const breadcrumbMap: Record<string, string> = {
    '/dashboard': '控制台概览',
    '/dashboard/users': '用户管理',
    '/dashboard/settings': '系统设置',
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getProfile();
        if (res.data?.nickname) setNickname(res.data.nickname);
      } catch (e) {
        navigate('/login', { replace: true });
      }
    };
    fetchUser();
  }, [navigate]);

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
      isActive 
      ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50' 
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 侧边栏保持不变 */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800">KnowAI</span>
        </div>
        
        <nav className="flex-1 space-y-1.5">
          <NavLink to="/dashboard" end className={navClass}>
            <LayoutDashboard size={20} /> 控制台概览
          </NavLink>
          <NavLink to="/dashboard/users" className={navClass}>
            <Users size={20} /> 用户管理
          </NavLink>
          <NavLink to="/dashboard/settings" className={navClass}>
            <SettingsIcon size={20} /> 系统设置
          </NavLink>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-6 text-sm font-bold text-slate-700">
             <UserCircle size={24} className="text-blue-600" />
             {nickname}
          </div>
          <Button 
            onClick={() => authService.logout().then(() => navigate('/login'))} 
            className="w-full bg-slate-50 text-slate-500 hover:text-red-600 border border-slate-200 shadow-none"
          >
            <LogOut size={16} className="mr-2" /> 退出登录
          </Button>
        </div>
      </aside>

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 修改后的顶栏：移除搜索框，增加面包屑 */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <span className="text-slate-400">管理后台</span>
            <ChevronRight size={16} className="text-slate-300" />
            <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100/50">
              {breadcrumbMap[location.pathname] || '未知页面'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}