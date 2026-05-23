'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { useLang } from '../../components/LanguageContext';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const { t, setLang, lang } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    return regex.test(pass);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters (!@#$%^&*).');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { name, email, password });
      router.push('/login'); // ລົງທະບຽນແລ້ວໄປໜ້າລັອກອິນເລີຍ
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Registration failed: ' + (err.response ? 'Invalid data' : 'Cannot connect to server'));
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError('');
    console.log("Google Credential Response:", credentialResponse);
    try {
      const res = await api.post('/auth/google-login', { token: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Backend Google Login error:", err);
      setError(err.response?.data?.message || 'Google Login failed. Please try again.');
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
              <p className="text-[10px] text-gray-400 mt-1">Must include: A-Z, a-z, 0-9, and special char (@#$!%*).</p>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-600/30"
            >
              {isLoading ? 'Processing...' : t.regLink}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a1a1a] px-2 text-gray-500">Or continue with</span></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login failed')}
                theme="filled_black"
                shape="pill"
              />
            </div>
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
