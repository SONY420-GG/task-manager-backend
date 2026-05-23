'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useLang } from '../../components/LanguageContext';
import { FaArrowLeft, FaChartPie, FaChartBar, FaTasks, FaCheckCircle, FaSpinner, FaFlask, FaInbox } from 'react-icons/fa';
import Link from 'next/link';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface Task {
  id: number;
  status: string;
}

export default function AnalyticsPage() {
  const { t } = useLang();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [router]);

  const chartData = useMemo(() => {
    const stats = {
      DRAFT: tasks.filter(t => t.status === 'DRAFT').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      TESTING: tasks.filter(t => t.status === 'TESTING').length,
      DONE: tasks.filter(t => t.status === 'DONE').length,
    };
    return [
      { name: 'Draft', value: stats.DRAFT, color: '#64748b' },
      { name: 'In Progress', value: stats.IN_PROGRESS, color: '#3b82f6' },
      { name: 'Testing', value: stats.TESTING, color: '#a855f7' },
      { name: 'Done', value: stats.DONE, color: '#22c55e' },
    ];
  }, [tasks]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors font-bold text-sm uppercase tracking-widest">
          <FaArrowLeft /> {t.backToDashboard}
        </Link>

        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">{t.analytics}</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">{t.taskStatus}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#1e293b] px-6 py-4 rounded-3xl border border-gray-800 shadow-xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{t.totalTasks}</p>
              <h3 className="text-2xl font-black">{tasks.length}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-[#1e293b] p-8 rounded-[40px] border border-gray-800 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <FaChartPie className="text-blue-500" />
              <h2 className="font-black text-xs uppercase tracking-widest text-gray-400">Distribution</h2>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-[#1e293b] p-8 rounded-[40px] border border-gray-800 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <FaChartBar className="text-purple-500" />
              <h2 className="font-black text-xs uppercase tracking-widest text-gray-400">Activity Level</h2>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {chartData.map((item, i) => (
            <div key={i} className="bg-[#1e293b]/50 p-6 rounded-3xl border border-gray-800/50 hover:bg-[#1e293b] transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{Math.round((item.value / (tasks.length || 1)) * 100)}%</span>
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{item.name}</h4>
              <p className="text-2xl font-black text-gray-400">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
