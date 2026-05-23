'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { useLang } from '../../components/LanguageContext';
import axios from 'axios';
import { 
  FaTasks, FaClock, FaPlus, 
  FaSignOutAlt, FaTrash, FaEdit, FaUserCircle,
  FaSearch, FaChartBar, FaCheckCircle, FaSpinner, FaFlask, FaInbox
} from 'react-icons/fa';
import TaskModal from '../../components/TaskModal';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface UserProfile {
  id: number;
  email: string;
  name: string;
}

export default function DashboardPage() {
  const { t, setLang, lang } = useLang();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, profileRes] = await Promise.all([
        api.get<Task[]>('/tasks'),
        api.get<UserProfile>('/auth/profile')
      ]);
      setTasks(tasksRes.data);
      setUser(profileRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [fetchData, router]);

  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, taskData);
      } else {
        await api.post('/tasks', taskData);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save task');
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm(lang === 'lo' ? 'ທ່ານແນ່ໃຈບໍ່ທີ່ຈະລຶບ?' : 'Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const columns = ['DRAFT', 'IN_PROGRESS', 'TESTING', 'DONE'];

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [tasks, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      draft: tasks.filter(t => t.status === 'DRAFT').length,
      progress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      testing: tasks.filter(t => t.status === 'TESTING').length,
      done: tasks.filter(t => t.status === 'DONE').length,
    };
  }, [tasks]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-400 animate-pulse font-medium tracking-wide text-sm uppercase">Loading Workspace...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0f172a] text-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1e293b] border-r border-gray-800/50 hidden lg:flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-10 px-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <FaTasks className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">TaskFlow</h2>
          </div>

          <nav className="space-y-1.5">
            <Link href="/dashboard" className="flex items-center gap-3.5 bg-blue-600/10 text-blue-400 p-4 rounded-2xl cursor-pointer transition-all border border-blue-500/10 font-bold text-sm">
              <FaInbox /> {t.dashboard}
            </Link>
            <Link href="/profile" className="flex items-center gap-3.5 text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 p-4 rounded-2xl cursor-pointer transition-all font-semibold text-sm">
              <FaUserCircle /> {t.profile}
            </Link>
            <Link href="/analytics" className="flex items-center gap-3.5 text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 p-4 rounded-2xl cursor-pointer transition-all font-semibold text-sm">
              <FaChartBar /> {t.analytics}
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-800/50 bg-[#1e293b]/50">
          <div className="flex items-center gap-4 mb-8 px-2">
            <div className="bg-gradient-to-tr from-blue-500 to-purple-500 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-xl shadow-blue-500/10 text-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-black truncate text-sm text-gray-100 uppercase tracking-tight">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate font-bold uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex bg-[#0f172a] p-1.5 rounded-2xl mb-6 border border-gray-800/50">
            <button onClick={() => setLang('en')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all duration-300 ${lang === 'en' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>EN</button>
            <button onClick={() => setLang('lo')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all duration-300 ${lang === 'lo' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>ລາວ</button>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 p-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-red-500/10"
          >
            <FaSignOutAlt /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f172a] relative">
        <header className="h-24 flex items-center justify-between px-8 md:px-12 border-b border-gray-800/40 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-10">
          <div className="flex items-center gap-8 flex-1">
            <div className="hidden md:block">
              <h1 className="text-2xl font-black tracking-tight">{t.dashboard}</h1>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Manage your flow</p>
            </div>
            
            <div className="relative flex-1 max-w-md ml-4">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input 
                type="text" 
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1e293b]/50 border border-gray-800/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-6">
            <button 
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3.5 rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-blue-500/20 font-black text-xs uppercase tracking-widest active:scale-95 border border-white/10"
            >
              <FaPlus /> <span>{t.addTask}</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {[
              { label: t.totalTasks, value: stats.total, icon: <FaTasks className="text-blue-400"/>, color: 'blue' },
              { label: 'Draft', value: stats.draft, icon: <FaInbox className="text-gray-400"/>, color: 'gray' },
              { label: 'Progress', value: stats.progress, icon: <FaSpinner className="text-blue-300 animate-spin-slow"/>, color: 'blue' },
              { label: 'Testing', value: stats.testing, icon: <FaFlask className="text-purple-400"/>, color: 'purple' },
              { label: 'Done', value: stats.done, icon: <FaCheckCircle className="text-green-400"/>, color: 'green' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#1e293b]/40 border border-gray-800/40 p-6 rounded-3xl hover:border-gray-700/60 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 bg-[#0f172a] rounded-xl border border-gray-800/50 group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Kanban Board */}
          <div className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar min-h-[600px]">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter(t => t.status === col);
              return (
                <div key={col} className="w-80 flex-shrink-0 flex flex-col">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full shadow-lg ${
                        col === 'DONE' ? 'bg-green-500 shadow-green-500/20' : 
                        col === 'TESTING' ? 'bg-purple-500 shadow-purple-500/20' : 
                        col === 'IN_PROGRESS' ? 'bg-blue-500 shadow-blue-500/20' : 'bg-gray-500 shadow-gray-500/20'
                      }`}></span>
                      <h2 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400">{col.replace('_', ' ')}</h2>
                    </div>
                    <span className="bg-[#1e293b] text-gray-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-gray-800/50">{colTasks.length}</span>
                  </div>

                  <div className="space-y-5 flex-1 pr-1">
                    {colTasks.length === 0 && (
                      <div className="border-2 border-dashed border-gray-800/30 rounded-3xl p-10 text-center bg-[#1e293b]/10">
                        <p className="text-[10px] text-gray-700 uppercase font-black tracking-widest">No Items</p>
                      </div>
                    )}
                    {colTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="bg-[#1e293b] p-6 rounded-3xl border border-gray-800 shadow-lg hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden cursor-default"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500"></div>
                        <div className="flex justify-between items-start mb-4 gap-3">
                          <h3 className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-2 text-[15px] leading-tight tracking-tight">{task.title}</h3>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button onClick={() => { setEditingTask(task); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"><FaEdit size={14}/></button>
                            <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"><FaTrash size={14}/></button>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-[13px] text-gray-500 line-clamp-3 mb-6 leading-relaxed font-medium">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-800/40">
                          <span className="text-[10px] font-black text-gray-600 uppercase flex items-center gap-2 tracking-widest">
                            <FaClock size={10} className="text-gray-700"/> {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                          <select 
                            value={task.status} 
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="bg-[#0f172a] text-[10px] font-black text-blue-500 uppercase outline-none cursor-pointer hover:bg-blue-500/10 rounded-xl px-3 py-1.5 transition-all border border-gray-800 hover:border-blue-500/20"
                          >
                            {columns.map(c => <option key={c} value={c} className="bg-[#1e293b] text-white">{c.replace('_', ' ')}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
