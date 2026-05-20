'use client';
import { createContext, useContext, useState } from 'react';

type TranslationKeys = {
  login: string;
  email: string;
  password: string;
  btn: string;
  register: string;
  regLink: string;
  name: string;
  lang: string;
  dashboard: string;
  logout: string;
  tasks: string;
  noTasks: string;
  addTask: string;
  title: string;
  description: string;
  save: string;
  cancel: string;
};

const translations: Record<string, TranslationKeys> = {
  en: { 
    login: "Login", 
    email: "Email", 
    password: "Password", 
    btn: "Log in", 
    register: "Don't have an account? ", 
    regLink: "Register", 
    name: "Name", 
    lang: "en",
    dashboard: "Dashboard",
    logout: "Logout",
    tasks: "Your Tasks",
    noTasks: "No tasks found. Start by creating one!",
    addTask: "Add Task",
    title: "Title",
    description: "Description",
    save: "Save",
    cancel: "Cancel"
  },
  lo: { 
    login: "ເຂົ້າສູ່ລະບົບ", 
    email: "ອີເມວ", 
    password: "ລະຫັດຜ່ານ", 
    btn: "ຕົກລົງ", 
    register: "ຍັງບໍ່ມີບັນຊີ? ", 
    regLink: "ລົງທະບຽນ", 
    name: "ຊື່ຜູ້ໃຊ້", 
    lang: "lo",
    dashboard: "ແຜງຄວບຄຸມ",
    logout: "ອອກຈາກລະບົບ",
    tasks: "ວຽກຂອງທ່ານ",
    noTasks: "ບໍ່ພົບວຽກ. ເລີ່ມສ້າງວຽກໃໝ່!",
    addTask: "ເພີ່ມວຽກ",
    title: "ຫົວຂໍ້",
    description: "ລາຍລະອຽດ",
    save: "ບັນທຶກ",
    cancel: "ຍົກເລີກ"
  }
};

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState('en');
  const t = { ...translations[lang], lang };
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within a LanguageProvider');
  return context;
};
