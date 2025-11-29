import React, { useState, useEffect, useRef } from 'react';
import { Panel, Slider } from './ui/Layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Pause, RefreshCw, Thermometer } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'water' | 'solute';
  radius: number;
}

export const Osmosis: React.FC<{ onContextUpdate: (data: string) => void }> = ({ onContextUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [temperature, setTemperature] = useState(25); // Celsius
  const [soluteCount, setSoluteCount] = useState(10);
  const [membranePermeability, setMembranePermeability] = useState(50); // % chance for water to pass
  const [history, setHistory] = useState<{time: number, left: number, right: number}[]>([]);
  
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    onContextUpdate(`
      Osmosis Module.
      Temperature: ${temperature}°C.
      Solute Count: ${soluteCount} (Right Chamber).
      Membrane Permeability: ${membranePermeability}%.
      Running: ${isPlaying}.
      Water Level Imbalance: ${history.length > 0 ? (history[history.length-1].right - history[history.length-1].left).toFixed(1) : 0}.
    `);
  }, [temperature, soluteCount, membranePermeability, isPlaying, history, onContextUpdate]);

  // Init particles
  useEffect(() => {
    const particles: Particle[] = [];
    // Water molecules (Blue) - distributed evenly initially
    for (let i = 0; i < 200; i++) {
      particles.push({
        id: i,
        x: Math.random() * 600,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'water',
        radius: 3
      });
    }
    // Solute molecules (Red) - Only on RIGHT side initially
    for (let i = 0; i < soluteCount; i++) {
      particles.push({
        id: 1000 + i,
        x: 310 + Math.random() * 280, // Right side
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        type: 'solute',
        radius: 8 // Larger
      });
    }
    particlesRef.current = particles;
    setHistory([]);
    timeRef.current = 0;
  }, [soluteCount]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const membraneX = width / 2;
      const speedMultiplier = (temperature + 273) / 300; // Kinetic theory approx

      ctx.clearRect(0, 0, width, height);

      // Draw Membrane
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(membraneX, 0);
      ctx.lineTo(membraneX, height);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.setLineDash([]);

      let leftWater = 0;
      let rightWater = 0;

      particlesRef.current.forEach(p => {
        // Update Position
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Wall collisions
        if (p.x < p.radius || p.x > width - p.radius) p.vx *= -1;
        if (p.y < p.radius || p.y > height - p.radius) p.vy *= -1;

        // Membrane Logic
        if (Math.abs(p.x - membraneX) < 5) {
          if (p.type === 'solute') {
            // Solute bounces off membrane (impermeable to solute)
            p.vx *= -1;
            // Correction to prevent sticking
            p.x = p.x < membraneX ? membraneX - 6 : membraneX + 6;
          } else {
             // Water passes based on permeability
             if (Math.random() * 100 > membranePermeability) {
               p.vx *= -1;
               p.x = p.x < membraneX ? membraneX - 4 : membraneX + 4;
             }
          }
        }
        
        // Count for stats
        if (p.type === 'water') {
          if (p.x < membraneX) leftWater++;
          else rightWater++;
        }

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'water' ? '#0ea5e9' : '#ef4444';
        ctx.fill();
      });

      // Update History occasionally
      timeRef.current += 1;
      if (timeRef.current % 30 === 0) {
        setHistory(prev => {
          const newHistory = [...prev, { time: timeRef.current, left: leftWater, right: rightWater }];
          return newHistory.slice(-50); // Keep last 50 points
        });
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [isPlaying, temperature, membranePermeability]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-6">
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <Panel title="Eksperimental Parametrlar">
           <div className="space-y-6">
             <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-sm transition-all
                    ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-neon-green hover:bg-green-600'}`}
                >
                  {isPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                  {isPlaying ? 'PAUZA' : 'BOSHLASH'}
                </button>
                <button 
                  onClick={() => {
                    setIsPlaying(false);
                    setSoluteCount(prev => prev); // Trigger effect reset
                    setHistory([]);
                  }}
                  className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
             </div>

             <Slider label="Harorat (°C)" value={temperature} min={0} max={100} onChange={setTemperature} unit="°C" />
             <Slider label="Eritilgan Modda (O'ng taraf)" value={soluteCount} min={0} max={50} onChange={(v) => {setIsPlaying(false); setSoluteCount(v)}} />
             <Slider label="Membrana O'tkazuvchanligi" value={membranePermeability} min={0} max={100} onChange={setMembranePermeability} unit="%" />
             
             <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200">
               <div className="flex items-center gap-2 mb-2 font-bold text-neon-blue">
                 <Thermometer className="w-4 h-4" /> Fizika Dvigateli
               </div>
               <p className="text-xs leading-relaxed">
                 Zarrachalar Broun harakati qonuniga bo'ysunadi. Yuqori harorat tezlikni oshiradi.
                 Yarim o'tkazuvchan membrana suvni (ko'k) o'tkazadi, lekin erigan moddani (qizil) to'sadi.
               </p>
             </div>
           </div>
        </Panel>
        
        <Panel title="Konsentratsiya Gradienti" className="flex-1">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={history}>
               <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
               <XAxis dataKey="time" hide />
               <YAxis domain={[0, 200]} hide />
               <Tooltip contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b'}} itemStyle={{color: '#1e293b'}} />
               <Area type="monotone" dataKey="left" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} name="Suv (Chap)" />
               <Area type="monotone" dataKey="right" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Suv (O'ng)" />
             </AreaChart>
           </ResponsiveContainer>
        </Panel>
      </div>

      <div className="w-full lg:w-2/3 bg-slate-100 border border-slate-200 rounded-xl relative overflow-hidden shadow-inner">
         <canvas 
           ref={canvasRef} 
           width={800} 
           height={600} 
           className="w-full h-full object-contain"
         />
         <div className="absolute top-4 left-4 text-xs font-mono font-bold text-sky-700 bg-white/80 px-2 py-1 rounded">Kamera A (Toza Suv)</div>
         <div className="absolute top-4 right-4 text-xs font-mono font-bold text-rose-600 bg-white/80 px-2 py-1 rounded">Kamera B (Eritma)</div>
      </div>
    </div>
  );
};