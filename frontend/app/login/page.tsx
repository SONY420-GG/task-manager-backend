'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { useLang } from '../../components/LanguageContext';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const { t, setLang, lang } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed: ' + (err.response ? 'Invalid credentials' : 'Cannot connect to server'));
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
            <h1 className="text-4xl font-bold text-white mb-2">{t.login}</h1>
            <p className="text-gray-300">Welcome back! Please enter your details.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t.email}</label>
              <input 
                type="email" 
                placeholder="your@email.com" 
                required
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition" 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-300">{t.password}</label>
                <Link href="/forgot-password" title="Coming soon" className="text-xs text-blue-400 hover:text-blue-300 transition">
                  {t.forgotPassword}
                </Link>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition" 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : t.btn}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a1a1a] px-2 text-gray-500">Or continue with</span></div>
            </div>

            <div className="flex justify-center">
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login failed')}
                  theme="filled_black"
                  shape="pill"
                />
              ) : (
                <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  Google Client ID not configured. Please check .env.local
                </div>
              )}
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              {t.register} 
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium ml-1 transition">{t.regLink}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
