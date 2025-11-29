import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Activity, ArrowRight } from 'lucide-react';

const PhysicsLab = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Fizika Laboratoriyasi</h1>
      <p className="text-slate-600 mb-8">Virtual tajribalar o'tkazing va qonuniyatlarni o'rganing.</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Kinematika Kartasi */}
        <div 
          onClick={() => navigate('/app/lab/physics/kinematics')}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
        >
          <div className="h-40 bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
             <Activity size={64} className="text-white opacity-80 group-hover:scale-110 transition-transform" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Kinematika va Dinamika</h3>
            <p className="text-slate-500 text-sm mb-4">
              Harakat qonunlari, tezlik, tezlanish va kuchlarni real vaqt rejimida simulyatsiya qiling. Grafiklar va ma'lumotlarni tahlil qiling.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              Tajribani boshlash <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        </div>

        {/* Elektronika Kartasi */}
        <div 
          onClick={() => navigate('/app/lab/physics/electronics')}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
        >
          <div className="h-40 bg-gradient-to-r from-violet-600 to-purple-400 flex items-center justify-center">
             <Zap size={64} className="text-white opacity-80 group-hover:scale-110 transition-transform" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Elektr Zanjirlari</h3>
            <p className="text-slate-500 text-sm mb-4">
              Rezistorlar, kondensatorlar va manbalar yordamida murakkab sxemalar tuzing. Tok va kuchlanishni o'lchang.
            </p>
            <div className="flex items-center text-violet-600 font-medium">
              Sxemani yig'ish <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsLab;