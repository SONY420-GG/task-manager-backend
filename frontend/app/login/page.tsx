'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api'; // ໄຟລ໌ເຊື່ອມຕໍ່ API ທີ່ເຮົາສ້າງໄວ້ໃນ lib/

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      
      // ເກັບ Token ໄວ້ໃນ localStorage
      localStorage.setItem('token', res.data.token);
      
      // ໄປໜ້າ Dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login ບໍ່ສຳເລັດ, ກະລຸນາກວດສອບຂໍ້ມູນ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-lg rounded-lg w-96">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">Login</h1>
        
        {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" required
            className="w-full p-2 mt-1 border rounded focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" required
            className="w-full p-2 mt-1 border rounded focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full p-2 text-white rounded ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'Login'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          ຍັງບໍ່ມີບັນຊີ? <a href="/register" className="text-blue-600 hover:underline">ລົງທະບຽນ</a>
        </p>
      </form>
    </div>
  );
}