'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useLang } from '../../components/LanguageContext';
import axios from 'axios';

interface Task {
  _id: string;
  title: string;
  description: string;
}

export default function DashboardPage() {
  const { t, setLang } = useLang();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get<Task[]>('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      await fetchTasks();
    };
    
    checkAuthAndFetch();
  }, [router, fetchTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await api.post('/tasks', { title: newTitle, description: newDesc });
      setNewTitle('');
      setNewDesc('');
      setShowAddForm(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to add task');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">{t.dashboard}</h1>
          <div className="flex gap-4 items-center">
            <div className="flex bg-white dark:bg-zinc-800 p-1 rounded-lg border dark:border-zinc-700 shadow-sm">
              <button onClick={() => setLang('en')} className={`px-3 py-1 text-sm font-medium rounded-md transition ${t.lang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}>EN</button>
              <button onClick={() => setLang('lo')} className={`px-3 py-1 text-sm font-medium rounded-md transition ${t.lang === 'lo' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}>ລາວ</button>
            </div>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition shadow-md shadow-red-500/20">{t.logout}</button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{t.tasks}</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {showAddForm ? t.cancel : t.addTask}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddTask} className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.title}</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-50 dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder={t.title}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.description}</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" 
                  placeholder={t.description}
                />
              </div>
              <button 
                type="submit" 
                disabled={isAdding}
                className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold transition disabled:opacity-50"
              >
                {isAdding ? '...' : t.save}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noTasks}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {tasks.map((task) => (
                <div key={task._id} className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold group-hover:text-blue-600 transition">{task.title}</h3>
                    <button onClick={() => handleDeleteTask(task._id)} className="text-gray-400 hover:text-red-500 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{task.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
