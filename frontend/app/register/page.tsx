'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { useLang } from '../../components/LanguageContext';
import axios from 'axios';

export default function RegisterPage() {
  const { t, setLang, lang } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { name, email, password });
      router.push('/login');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Registration failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div className="absolute top-8 right-8 z-10 flex gap-2">
        <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-md transition ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>EN</button>
        <button onClick={() => setLang('lo')} className={`px-3 py-1 rounded-md transition ${lang === 'lo' ? 'bg-blue-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>ລາວ</button>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 mx-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">{t.regLink}</h1>
            <p className="text-gray-300">Create an account to start managing your tasks.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t.name}</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                required
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition" 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t.email}</label>
              <input 
                type="email" 
                placeholder="your@email.com" 
                required
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition" 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t.password}</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition" 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-600/30"
            >
              {isLoading ? 'Processing...' : t.regLink}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account? 
              <Link href="/login" className="text-green-400 hover:text-green-300 font-medium ml-1 transition">{t.login}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
