'use client';
import { useState, useEffect } from 'react';
import { useLang } from './LanguageContext';

interface Task {
  id?: number;
  title: string;
  description: string;
  status: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => Promise<void>;
  initialData?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSubmit, initialData }: TaskModalProps) {
  const { t } = useLang();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setStatus(initialData.status);
    } else {
      setTitle('');
      setDescription('');
      setStatus('DRAFT');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ title, description, status });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statuses = ['DRAFT', 'IN_PROGRESS', 'TESTING', 'DONE'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-lg rounded-3xl p-8 border border-gray-800 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold mb-6 text-white">{initialData ? t.edit : t.addTask}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t.title}</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-3.5 bg-[#0f172a] border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition" 
              placeholder="What needs to be done?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t.description}</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-[#0f172a] border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none transition" 
              placeholder="Add some details..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t.status}</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3.5 bg-[#0f172a] border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex gap-3 mt-8">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition"
            >
              {t.cancel}
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-2 px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {isSubmitting ? '...' : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
