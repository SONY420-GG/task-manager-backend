'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useLang } from '../../components/LanguageContext';
import { FaUserCircle, FaArrowLeft, FaSave, FaCheckCircle, FaUser } from 'react-icons/fa';
import Link from 'next/link';

export default function ProfilePage() {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setName(res.data.name);
        setEmail(res.data.email);
        setCreatedAt(res.data.createdAt);
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess(false);
    try {
      await api.patch('/auth/profile', { name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors font-bold text-sm uppercase tracking-widest">
          <FaArrowLeft /> {t.backToDashboard}
        </Link>

        <div className="bg-[#1e293b] rounded-3xl p-8 md:p-12 border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              {name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">{t.profile}</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{t.memberSince} {new Date(createdAt).toLocaleDateString()}</p>
          </div>

          {success && (
            <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400 text-sm font-bold animate-in slide-in-from-top-4">
              <FaCheckCircle /> {t.profileUpdated}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">{t.name}</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">{t.email}</label>
              <input 
                type="email" 
                value={email}
                disabled
                className="w-full bg-[#0f172a]/50 border border-gray-800/50 rounded-2xl py-4 px-6 text-sm text-gray-500 font-bold cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-600 mt-3 font-bold uppercase italic">Email cannot be changed.</p>
            </div>

            <button 
              type="submit" 
              disabled={updating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 font-black text-xs uppercase tracking-[0.2em] active:scale-[0.98] disabled:opacity-50 mt-10"
            >
              {updating ? '...' : <><FaSave /> {t.saveChanges}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
