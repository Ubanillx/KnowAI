// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Users, Activity, TrendingUp } from 'lucide-react'; // 引入图标
import AuthPage from './pages/AuthPage';
import DashboardLayout from './pages/Dashboard/index';
import UserManagement from './pages/Dashboard/UserManagement';
import Settings from './pages/Dashboard/Settings';
import ProtectedRoute from './components/ProtectedRoute';

// 概览组件：移到外面定义并确保在路由中使用
const Overview = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="mb-8">
      <h1 className="text-3xl font-black text-slate-900">欢迎回来 ✨</h1>
      <p className="text-slate-500 mt-2 font-medium">这是您今天的 KnowAI 系统运行快照</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: '总用户量', value: '24,512', icon: <Users size={24} />, color: 'blue' },
        { label: '今日活跃', value: '1,284', icon: <Activity size={24} />, color: 'indigo' },
        { label: '增长率', value: '+12.5%', icon: <TrendingUp size={24} />, color: 'emerald' }
      ].map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            card.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
            card.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {card.icon}
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  </div>
);

// 必须使用 export default 来修复 main.tsx 的报错
export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* 这里正确使用了 Overview */}
          <Route index element={<Overview />} /> 
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}