import { useState, useEffect } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell, // 重新放回 UI 中使用
  ChevronRight, 
  UserCircle, 
  Menu 
} from 'lucide-react';
import { authService } from '../../services/auth';
// 移除未使用的 Button 导入，解决 TS6133
import { THEME } from '../ui/theme';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [nickname, setNickname] = useState('管理员');

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
    `flex items-center gap-3 px-3 py-2 ${THEME.RADIUS} transition-all duration-200 font-semibold ${
      isActive 
      ? 'bg-blue-50 text-blue-600 border border-blue-100/50' 
      : 'text-slate-500 hover:bg-slate-100'
    }`;

  return (
    <div className={`flex h-screen ${THEME.COLORS.BG_MAIN} text-slate-900`}>
      {/* 侧边栏 */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r ${THEME.COLORS.BORDER} flex flex-col p-4 transition-all duration-300`}>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className={`flex-shrink-0 w-10 h-10 bg-blue-600 ${THEME.RADIUS} flex items-center justify-center shadow-lg shadow-blue-200`}>
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          {!isCollapsed && <span className="text-lg font-black tracking-tight">KnowAI</span>}
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavLink to="/dashboard" end className={navClass} title="控制台">
            <LayoutDashboard size={20} /> {!isCollapsed && "控制台概览"}
          </NavLink>
          <NavLink to="/dashboard/users" className={navClass} title="用户管理">
            <Users size={20} /> {!isCollapsed && "用户管理"}
          </NavLink>
          <NavLink to="/dashboard/settings" className={navClass} title="系统设置">
            <SettingsIcon size={20} /> {!isCollapsed && "系统设置"}
          </NavLink>
        </nav>
      </aside>

      {/* 内容区 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`h-14 bg-white border-b ${THEME.COLORS.BORDER} flex items-center justify-between px-4`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400">管理后台</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-blue-600">{breadcrumbMap[location.pathname] || '未知'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 重新启用 Bell 解决警告 */}
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-6 w-[1px] bg-slate-100 mx-1"></div>

            <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-100 rounded-full bg-slate-50">
               <UserCircle size={18} className="text-blue-600" />
               <span className="text-xs font-bold text-slate-700">{nickname}</span>
            </div>

            <button 
              onClick={() => authService.logout().then(() => navigate('/login'))}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="退出登录"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className={`flex-1 ${THEME.PAGE_PADDING} overflow-y-auto`}>
        {/* 直接渲染 Outlet，不再使用 max-w 限制 */}
        <Outlet />
        </main>
      </div>
    </div>
  );
}