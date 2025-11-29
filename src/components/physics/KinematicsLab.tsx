import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Wind, Download, Settings2, Activity, ArrowLeft } from 'lucide-react';
import { CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';
import { EnvParams, PhysicalObject, SimulationState } from '../../types';
import { calculateNextState, INITIAL_STATE } from '../../services/physicsEngine';

const OBJECT_TYPES: PhysicalObject[] = [
  { id: 'steel_ball', name: "Po'lat Shar", mass: 5, area: 0.05, dragCoefficient: 0.47, frictionCoefficient: 0.1, color: '#3b82f6', shape: 'sphere' },
  { id: 'wood_block', name: "Yog'och", mass: 2, area: 0.1, dragCoefficient: 1.05, frictionCoefficient: 0.5, color: '#f97316', shape: 'cube' },
  { id: 'aero_car', name: 'Aero', mass: 10, area: 0.08, dragCoefficient: 0.25, frictionCoefficient: 0.05, color: '#84cc16', shape: 'cube' },
];

// Ekranda 1 metr necha pikselga tengligini belgilaymiz
const PX_PER_METER = 15; 

const KinematicsLab: React.FC = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedObjId, setSelectedObjId] = useState<string>(OBJECT_TYPES[0].id);
  const [simState, setSimState] = useState<SimulationState>(INITIAL_STATE);
  const [dataHistory, setDataHistory] = useState<any[]>([]);
  const [env, setEnv] = useState<EnvParams>({ gravity: 9.81, airDensity: 1.225, windSpeed: 0, rampAngle: 10 }); // Boshlanishiga 10 gradus
  const [v0, setV0] = useState(0); // Boshlang'ich tezlik 0 dan boshlanishi mantiqiyroq (dumalab ketishi uchun)
  const [activeTab, setActiveTab] = useState<'controls' | 'charts'>('controls');

  const requestRef = useRef<number | null>(null);
  const activeObj = OBJECT_TYPES.find(o => o.id === selectedObjId) || OBJECT_TYPES[0];

  const animate = useCallback(() => {
    if (!isRunning) return;
    setSimState(prev => {
      // Fizika dvigatelini chaqiramiz
      const next = calculateNextState(prev, activeObj, env, {x: v0, y:0});
      
      // Tarixni saqlash (Grafiklar uchun)
      if (Math.floor(next.t * 60) % 10 === 0) {
        setDataHistory(h => {
            const newData = [...h, {
                time: Number(next.t.toFixed(2)), velocity: Number(next.velocity.x.toFixed(2)),
                displacement: Number(next.displacement.toFixed(2)), acceleration: Number(next.acceleration.x.toFixed(2))
            }];
            return newData.slice(-50); 
        });
      }
      return next;
    });
    requestRef.current = requestAnimationFrame(animate);
  }, [isRunning, activeObj, env, v0]);

  useEffect(() => {
    if (isRunning) { requestRef.current = requestAnimationFrame(animate); } 
    else { if (requestRef.current) cancelAnimationFrame(requestRef.current); }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isRunning, animate]);

  const handleReset = () => { setIsRunning(false); setSimState({ ...INITIAL_STATE, velocity: { x: v0, y: 0 } }); setDataHistory([]); };
  const handleStartPause = () => {
    if (!isRunning && simState.t === 0) { setSimState(s => ({ ...s, velocity: { x: v0, y: 0 } })); }
    setIsRunning(!isRunning);
  };
  
  const exportData = () => {
      const csvContent = "data:text/csv;charset=utf-8,Vaqt (s),Tezlik (m/s),Tezlanish (m/s^2),Ko'chish (m)\n" + dataHistory.map(row => `${row.time},${row.velocity},${row.acceleration},${row.displacement}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", "kinematika_malumotlari.csv");
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 relative overflow-hidden">
      
      {/* HEADER: Orqaga tugmasi */}
      <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white rounded-full shadow-md text-slate-600 hover:text-slate-900 border border-slate-200 active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
      </div>

      {/* 1. SIMULYATSIYA MAYDONI (45%) */}
      <div className="h-[45%] relative overflow-hidden bg-slate-100 border-b border-slate-200">
        {/* Orqa fon panjarasi */}
        <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed bg-opacity-5 flex items-center justify-center overflow-hidden">
          
          {/* 
             ASOSIY SAHNA KONTEYNERI 
             Biz butun sahnani (yer + shar) bitta div ichiga solib, o'sha divni aylantiramiz.
             Shunda shar har doim yerga yopishib turadi.
          */}
          <div 
            className="relative w-[120%] h-1 bg-transparent flex items-center transition-transform duration-500 ease-out"
            style={{
                // Butun sahnani nishablik burchagiga qarab aylantiramiz
                transform: `rotate(${env.rampAngle}deg)`,
                transformOrigin: 'center center'
            }}
          >
              {/* YER (Chiziq) */}
              <div className="w-full h-1.5 bg-slate-400 rounded shadow-sm relative">
                  {/* Masofa belgilari (Yerning ustida turadi) */}
                  <div className="absolute top-4 left-[10%] text-[9px] text-slate-400 -rotate-90 opacity-70">0m</div>
                  <div className="absolute top-4 left-[40%] text-[9px] text-slate-400 -rotate-90 opacity-70">10m</div>
                  <div className="absolute top-4 left-[70%] text-[9px] text-slate-400 -rotate-90 opacity-70">20m</div>
              </div>

              {/* OBYEKT (Shar yoki Kub) */}
              <div 
                className="absolute z-20 flex items-center justify-center"
                style={{
                    width: '50px', 
                    height: '50px',
                    // Shar har doim chiziqning ustida turishi uchun bottom: 100% qilamiz
                    // va ozgina pastga tushiramiz (translateY) chiziqqa tegib turishi uchun
                    bottom: '6px', 
                    
                    // Harakatlanish: Faqat X o'qi bo'yicha siljiydi (transform rotate kerak emas, konteyner aylangan)
                    left: '10%', // Boshlang'ich nuqta
                    transform: `
                        translateX(${simState.position.x * PX_PER_METER}px) 
                        rotate(${activeObj.shape === 'sphere' ? simState.position.x * 20 : 0}deg)
                    `,
                    backgroundColor: activeObj.color,
                    borderRadius: activeObj.shape === 'sphere' ? '50%' : '6px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)', // Realistik soya
                    transition: isRunning ? 'none' : 'transform 0.1s linear'
                }}
              >
                 {/* Obyekt ichidagi yaltiroq effekt */}
                 <div className="w-full h-full bg-gradient-to-tr from-black/20 to-white/30 rounded-[inherit]"></div>
                 
                 {/* Agar g'ildirak bo'lsa, aylanishi ko'rinishi uchun chiziq */}
                 {activeObj.shape === 'sphere' && (
                     <div className="absolute w-full h-0.5 bg-white/50 rotate-45"></div>
                 )}
              </div>
          </div>
          
          {/* HUD Stats (O'zgarmas joyda turadi) */}
          <div className="absolute top-4 right-4 pointer-events-auto">
             <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-2 rounded-xl shadow-sm min-w-[90px]">
                <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Jonli</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                </div>
                <div className="space-y-0.5">
                    <StatCompact label="t" value={simState.t.toFixed(1)} unit="s" />
                    <StatCompact label="v" value={simState.velocity.x.toFixed(1)} unit="m/s" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. BOSHQARUV PANELI */}
      <div className="flex-1 bg-white flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 rounded-t-2xl -mt-4 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10">
            <button onClick={() => setActiveTab('controls')} className={`flex-1 py-3 text-xs font-extrabold flex items-center justify-center gap-2 ${activeTab === 'controls' ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50' : 'text-slate-400'}`}>
                <Settings2 size={16} /> SOZLAMALAR
            </button>
            <button onClick={() => setActiveTab('charts')} className={`flex-1 py-3 text-xs font-extrabold flex items-center justify-center gap-2 ${activeTab === 'charts' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-slate-400'}`}>
                <Activity size={16} /> GRAFIKLAR
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-10">
            {activeTab === 'controls' ? (
                <div className="space-y-5 max-w-md mx-auto">
                    {/* Play/Pause */}
                    <div className="flex gap-2">
                        <button onClick={handleStartPause} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${isRunning ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-cyan-600 text-white'}`}>
                            {isRunning ? <><Pause size={18} /> TO'XTATISH</> : <><Play size={18} /> BOSHLASH</>}
                        </button>
                        <button onClick={handleReset} className="px-4 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 border border-slate-200 active:scale-95">
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    {/* Obyekt Tanlash */}
                    <div className="grid grid-cols-3 gap-2">
                        {OBJECT_TYPES.map(obj => (
                            <button key={obj.id} onClick={() => setSelectedObjId(obj.id)} className={`p-2 rounded-lg border text-[10px] font-bold transition-all h-10 ${selectedObjId === obj.id ? 'bg-cyan-50 border-cyan-500 text-cyan-700 ring-1 ring-cyan-200' : 'bg-white border-slate-200 text-slate-500'}`}>
                                {obj.name}
                            </button>
                        ))}
                    </div>

                    <ControlSlider label="Boshlang'ich Tezlik (v0)" value={v0} min={0} max={50} unit="m/s" onChange={setV0} />
                    
                    {/* Nishablik Slideri */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-slate-600">Nishablik (Qiyalik)</span>
                            <span className="font-mono text-cyan-700 bg-white border px-1.5 rounded text-[10px]">{env.rampAngle}°</span>
                        </div>
                        <input type="range" min={0} max={45} step={1} value={env.rampAngle} onChange={(e) => setEnv(prev => ({...prev, rampAngle: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-600" />
                        <div className="flex justify-between text-[8px] text-slate-400 mt-1">
                            <span>Tekis (0°)</span>
                            <span>Tik (45°)</span>
                        </div>
                    </div>
                    
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-600">Shamol</label>
                            <div className="flex items-center gap-1 text-slate-500">
                                <Wind size={12} /> <span className="text-[10px] font-mono">{env.windSpeed} m/s</span>
                            </div>
                        </div>
                        <input type="range" min={-20} max={20} step={1} value={env.windSpeed} onChange={(e) => setEnv(prev => ({...prev, windSpeed: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-500" />
                    </div>
                     <button onClick={exportData} className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"><Download size={14} /> CSV YUKLASH</button>
                </div>
            ) : (
                <div className="space-y-3">
                    <Chart title="Tezlik" color="#0891b2" data={dataHistory} dataKey="velocity" />
                    <Chart title="Ko'chish" color="#7c3aed" data={dataHistory} dataKey="displacement" />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const StatCompact: React.FC<{label: string, value: string | number, unit: string}> = ({label, value, unit}) => (<div className="flex justify-between w-full gap-2"><span className="text-[10px] text-slate-400">{label}</span><span className="text-xs font-mono font-bold text-slate-700">{value}<span className="text-[8px] ml-0.5 text-slate-400">{unit}</span></span></div>);
const ControlSlider: React.FC<{ label: string, value: number, min: number, max: number, unit?: string, step?: number, onChange?: (v: number) => void, disabled?: boolean }> = ({ label, value, min, max, unit, step=1, onChange, disabled }) => (<div className={disabled ? 'opacity-50 pointer-events-none' : ''}><div className="flex justify-between text-xs mb-1"><span className="font-bold text-slate-600">{label}</span><span className="font-mono text-cyan-700 bg-cyan-50 px-1.5 rounded text-[10px]">{value} {unit}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange && onChange(parseFloat(e.target.value))} disabled={disabled} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-600" /></div>);
const Chart: React.FC<{title: string, data: any[], dataKey: string, color: string}> = ({title, data, dataKey, color}) => (<div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm p-2 flex flex-col"><div className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: color}}></div> {title}</div><div className="flex-1 -ml-2"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} /><XAxis dataKey="time" hide /><YAxis stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} width={25} /><Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '10px'}} itemStyle={{color: color}} /><Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div></div>);

export default KinematicsLab;