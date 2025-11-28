// src/components/AchievementPopup.tsx
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { X } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon: string;
  onClose: () => void;
}

const AchievementPopup = ({ title, description, icon, onClose }: Props) => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Ekranni o'lchami o'zgarsa konfetti buzilmasligi uchun
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Konfetti effekti (Ekran to'la) */}
      <Confetti 
        width={windowSize.width} 
        height={windowSize.height} 
        recycle={false} // 1 marta yog'ib to'xtaydi
        numberOfPieces={500} 
        gravity={0.2}
      />

      {/* Yutuq Kartochkasi */}
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm text-center relative transform scale-100 animate-bounce-slow border-4 border-yellow-400">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        <div className="text-6xl mb-4 animate-spin-slow">{icon}</div>
        
        <h2 className="text-yellow-500 font-black text-sm tracking-widest uppercase mb-2">
          Yangi Yutuq!
        </h2>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-500 mb-6">
          {description}
        </p>

        <button 
          onClick={onClose}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          Ajoyib!
        </button>
      </div>
    </div>
  );
};

export default AchievementPopup;