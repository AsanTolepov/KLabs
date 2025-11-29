import React, { useState, useEffect } from 'react';
import { Panel, Slider } from './ui/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Play, RotateCcw, Flame, Activity } from 'lucide-react';

export const Enzymes: React.FC<{ onContextUpdate: (data: string) => void }> = ({ onContextUpdate }) => {
  const [temperature, setTemperature] = useState(37); // Optimum ~37-40
  const [pH, setPh] = useState(7); // Optimum ~7
  const [substrate, setSubstrate] = useState(50);
  const [products, setProducts] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [data, setData] = useState<{time: number, product: number}[]>([]);

  // Samaradorlikni hisoblash
  const getEfficiency = () => {
    let tempFactor = 0;
    if (temperature < 45) {
       tempFactor = 1 - Math.pow((temperature - 37) / 37, 2);
    } else {
       tempFactor = Math.max(0, 1 - (temperature - 37) / 5); 
    }
    const phFactor = Math.max(0, 1 - Math.pow((pH - 7) / 3, 2));
    return Math.max(0, tempFactor * phFactor);
  };

  useEffect(() => {
    const eff = getEfficiency();
    onContextUpdate(`Enzymes: Temp ${temperature}°C, pH ${pH}, Efficiency ${(eff * 100).toFixed(1)}%`);
  }, [temperature, pH, substrate, products, onContextUpdate]);

  // Reaksiya vaqti
  useEffect(() => {
    if (!isRunning || substrate <= 0) return;
    const interval = setInterval(() => {
      setTime(t => t + 1);
      const efficiency = getEfficiency();
      const rate = efficiency * (substrate / 50) * 5; // Tezlikni oshirdim vizual ko'rinishi uchun

      if (substrate > 0) {
        const change = Math.min(substrate, rate);
        setSubstrate(s => Math.max(0, s - change));
        setProducts(p => p + change);
        setData(prev => [...prev, { time: time, product: products + change }]);
      } else {
        setIsRunning(false);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, temperature, pH, substrate, products, time]);

  const reset = () => {
    setIsRunning(false);
    setSubstrate(50);
    setProducts(0);
    setTime(0);
    setData([]);
  };

  const efficiency = getEfficiency();
  const enzymeState = efficiency > 0.8 ? 'Faol' : efficiency > 0.1 ? 'Sekin' : 'Denaturatsiya';
  const enzymeColor = efficiency > 0.8 ? 'bg-emerald-500' : efficiency > 0.1 ? 'bg-amber-500' : 'bg-slate-400';

  return (
    // ASOSIY CONTAINER: Ustma-ust joylashuv (flex-col)
    <div className="flex flex-col gap-6 p-4 w-full max-w-lg mx-auto pb-24">
       
       {/* 1. VIZUALIZATSIYA (TEPADA) */}
       <div className="w-full aspect-video bg-slate-100 rounded-3xl border border-slate-200 relative overflow-hidden flex items-center justify-center shadow-inner">
          
          {/* Ferment (Katta doira) */}
          <div className={`w-32 h-32 ${enzymeColor} rounded-full flex items-center justify-center transition-all duration-500 relative shadow-lg border-4 border-white z-10`}>
             {/* Og'iz (Active Site) */}
             <div className="absolute top-0 w-12 h-12 bg-slate-100 rounded-b-full translate-y-[-10px]" /> 
             <div className="text-white font-bold text-xs mt-4 opacity-90">KATALAZA</div>
          </div>
          
          {/* Substratlar (Suzib yuruvchi) */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: Math.ceil(substrate / 2) }).map((_, i) => (
                <div key={`sub-${i}`} className="absolute w-3 h-3 bg-blue-500 rounded-full opacity-70 transition-all duration-1000"
                    style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
            ))}
            {Array.from({ length: Math.ceil(products / 2) }).map((_, i) => (
                <div key={`prod-${i}`} className="absolute w-2 h-2 bg-emerald-400 rounded-full opacity-80 shadow-sm animate-pulse"
                    style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
            ))}
          </div>

          {/* Holat Info */}
          <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
             Samaradorlik: {(efficiency * 100).toFixed(0)}%
          </div>
          <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm flex items-center gap-1">
             <Activity className="w-3 h-3" /> {enzymeState}
          </div>
       </div>

       {/* 2. BOSHQARUV (O'RTADA) */}
       <Panel title="Reaksiya Shartlari" className="w-full">
          <div className="space-y-6">
             <Slider label="Harorat (°C)" value={temperature} min={0} max={60} onChange={setTemperature} unit="°C" />
             <Slider label="pH Darajasi" value={pH} min={1} max={14} onChange={setPh} />
             
             <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => setIsRunning(!isRunning)} 
                  disabled={substrate <= 0}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-md transition-all active:scale-95
                    ${isRunning ? 'bg-red-500' : 'bg-emerald-500'} ${substrate <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRunning ? <span className="flex items-center gap-2">To'xtatish</span> : <span className="flex items-center gap-2"><Play className="w-4 h-4" /> Boshlash</span>}
                </button>
                <button onClick={reset} className="px-4 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors active:scale-95">
                  <RotateCcw className="w-5 h-5" />
                </button>
             </div>
          </div>
       </Panel>

       {/* 3. GRAFIK (PASTDA) */}
       <Panel title="Natijalar Grafigi" className="w-full">
          <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                  <Line type="monotone" dataKey="product" stroke="#10b981" strokeWidth={3} dot={false} name="Mahsulot" />
               </LineChart>
             </ResponsiveContainer>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
             <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Substrat (xomashyo)</span>
                <span>Mahsulot</span>
             </div>
             <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${(substrate/50)*100}%` }}></div>
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(products/50)*100}%` }}></div>
             </div>
          </div>
       </Panel>

    </div>
  );
};