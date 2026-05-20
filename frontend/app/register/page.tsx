'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api'; // ອ້າງອີງໄປຫາໄຟລ໌ api.ts ທີ່ເຮົາສ້າງໄວ້

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // ສົ່ງຂໍ້ມູນໄປຫາ Backend ທີ່ Path /api/auth/register
      await api.post('/auth/register', { name, email, password });
      
      // ຖ້າສຳເລັດ ໃຫ້ຍ້າຍໄປໜ້າ Login
      alert('ລົງທະບຽນສຳເລັດ! ກະລຸນາເຂົ້າສູ່ລະບົບ');
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'ລົງທະບຽນບໍ່ສຳເລັດ, ກະລຸນາກວດສອບອີກຄັ້ງ');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="p-8 bg-white shadow-lg rounded-lg w-96">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">ລົງທະບຽນ</h1>
        
        {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}
        
        <input 
          type="text" placeholder="ຊື່ຜູ້ໃຊ້" required
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setName(e.target.value)} 
        />
        <input 
          type="email" placeholder="Email" required
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="ລະຫັດຜ່ານ" required
          className="w-full p-2 mb-6 border rounded"
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <button type="submit" className="w-full p-2 text-white bg-green-600 rounded hover:bg-green-700">
          ລົງທະບຽນ
        </button>
        
        <p className="mt-4 text-center text-sm">
          ມີບັນຊີແລ້ວບໍ? <a href="/login" className="text-blue-600 hover:underline">ເຂົ້າສູ່ລະບົບ</a>
        </p>
      </form>
    </div>
  );
}