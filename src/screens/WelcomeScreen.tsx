// src/screens/WelcomeScreen.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom } from 'lucide-react';

const WelcomeScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 2.5 soniyadan keyin Asosiy sahifaga o'tish
    const timer = setTimeout(() => {
      navigate('/app'); // Yoki '/' agar asosiy sahifa '/' bo'lsa
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-purple-500 opacity-20 rounded-full blur-3xl animate-float"></div>

      <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-blue-900/50 relative z-10 animate-bounce">
        <Atom className="w-16 h-16 text-blue-600 animate-spin" />
      </div>

      <h1 className="mt-8 text-3xl font-black text-white tracking-wide">
        Atomix Academy
      </h1>
      <p className="text-blue-200 mt-2 font-medium animate-pulse">
        Yuklanmoqda...
      </p>
    </div>
  );
};

export default WelcomeScreen;