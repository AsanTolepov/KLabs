import React, { useState } from 'react';
import { TaskConfig, SubjectType, AIResult } from '../types';
import { Loader2, Zap, Sun, HelpCircle, Star, Sprout, FlaskConical } from 'lucide-react';
import { getAIHint, gradeTaskWithAI } from '../services/geminiService';

interface TaskLabProps {
  config: TaskConfig;
  onSuccess: (result: AIResult) => void;
}

const TaskLab: React.FC<TaskLabProps> = ({ config, onSuccess }) => {
  const [params, setParams] = useState(config.initialParams);
  const [isGrading, setIsGrading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [startTime] = useState(Date.now());

  // Ranglar (Kimyo uchun)
  const getSolutionColor = (ph: number) => {
    if (ph < 3) return 'bg-red-500';
    if (ph < 5) return 'bg-orange-400';
    if (ph < 6.5) return 'bg-yellow-300';
    if (ph >= 6.5 && ph <= 7.5) return 'bg-green-400'; // Neytral
    if (ph > 7.5 && ph < 10) return 'bg-blue-400';
    return 'bg-purple-600';
  };

  const handleSliderChange = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const requestHint = async () => {
    setLoadingHint(true);
    // Agar API ishlamasa, oddiy yordam beramiz
    setTimeout(() => {
        setHint("Maqsadli qiymatga yetish uchun slayderlarni sekinroq o'zgartirib ko'ring.");
        setLoadingHint(false);
    }, 1000);
    // Aslida bu yerda: const hintText = await getAIHint(config, params, 'nudge');
  };

  const submitTask = async () => {
    setIsGrading(true);
    const timeTaken = (Date.now() - startTime) / 1000;
    
    // AI Simulyatsiyasi (Haqiqiy hisoblash)
    // Fizika: I = V / R (yoki boshqa formulalar)
    // Kimyo: pH target
    // Biologiya: Average target
    
    let calculatedScore = 0;
    let currentVal = 0;

    if (config.type === SubjectType.PHYSICS) {
        // Om qonuni
        if (params.resistance && params.resistance > 0) {
            currentVal = params.voltage / params.resistance;
        } else {
            currentVal = params.voltage; // Fallback
        }
    } else if (config.type === SubjectType.BIOLOGY) {
        currentVal = (params.light + params.co2) / 2; // O'rtacha o'sish
        if (config.targetValue === 70) currentVal = params.light; // Yurak urishi uchun
    } else {
        currentVal = params.ph || params.electrons || 0;
    }

    // Baholash
    const diff = Math.abs(currentVal - config.targetValue);
    if (diff <= config.tolerance) {
        calculatedScore = 100;
    } else {
        calculatedScore = Math.max(0, 100 - (diff * 10));
    }
    
    // 2 soniyadan keyin natijani qaytaramiz
    setTimeout(() => {
        setIsGrading(false);
        onSuccess({
            score: Math.round(calculatedScore),
            explanation: calculatedScore > 80 
                ? "Barakalla! Siz laboratoriya topshirig'ini a'lo darajada bajardingiz." 
                : "Yaxshi harakat, lekin qiymatlar biroz noaniq. Qayta urinib ko'ring.",
            confidence: 1
        });
    }, 1500);
  };

  // --- RENDERERS ---

  // 1. KIMYO LABORATORIYASI
  const renderChemistryLab = () => {
    const ph = params.ph || 7;
    const volume = params.volume || 50;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-48 border-b-4 border-x-4 border-gray-300 rounded-b-3xl bg-white/30 overflow-hidden mb-6 backdrop-blur-sm shadow-inner">
           <div 
            className={`absolute bottom-0 w-full transition-all duration-700 ease-in-out ${getSolutionColor(ph)} opacity-80`}
            style={{ height: `${Math.min(volume, 100)}%` }}
           />
           <div className="absolute bottom-4 left-8 w-2 h-2 bg-white rounded-full animate-bounce opacity-50"></div>
           <div className="absolute bottom-10 right-10 w-3 h-3 bg-white rounded-full animate-bounce opacity-50" style={{ animationDelay: '0.5s'}}></div>
        </div>

        <div className="w-full space-y-4">
           <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <span className="font-bold text-gray-700 text-sm">Kislota (H+)</span>
              <button 
                onClick={() => setParams(p => ({ ...p, ph: Math.max(0, (p.ph || 7) - 0.5), volume: Math.min(100, (p.volume||50) + 5) }))}
                className="bg-red-500 text-white px-3 py-2 rounded-lg active:scale-95 transition-transform text-xs font-bold"
              >Tomizish</button>
           </div>
           <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <span className="font-bold text-gray-700 text-sm">Asos (OH-)</span>
              <button 
                onClick={() => setParams(p => ({ ...p, ph: Math.min(14, (p.ph || 7) + 0.5), volume: Math.min(100, (p.volume||50) + 5) }))}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg active:scale-95 transition-transform text-xs font-bold"
              >Tomizish</button>
           </div>
        </div>
        <div className="mt-4 font-mono text-xl bg-gray-800 text-green-400 px-4 py-2 rounded-lg shadow-lg">
          pH: {ph.toFixed(1)}
        </div>
      </div>
    );
  };

  // 2. FIZIKA LABORATORIYASI
  const renderPhysicsLab = () => {
    const voltage = params.voltage || 0;
    const resistance = params.resistance || 1;
    const current = voltage / resistance;
    
    return (
      <div className="flex flex-col items-center w-full">
        <div className="relative w-full h-32 bg-gray-800 rounded-xl mb-6 flex items-center justify-center border-2 border-gray-600 shadow-inner">
           <div className="absolute top-2 left-3 text-gray-500 text-[10px] font-mono">MULTIMETER</div>
           <Zap className={`w-12 h-12 ${current > config.targetValue + 1 ? 'text-red-500 animate-pulse' : 'text-yellow-400'} transition-colors duration-300`} />
           <div className="absolute bottom-2 right-4 font-mono text-2xl text-white">
             {current.toFixed(2)} A
           </div>
        </div>

        <div className="w-full space-y-4">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between mb-1">
              <label className="font-bold text-xs text-gray-700">Kuchlanish (V)</label>
              <span className="font-mono text-blue-600 text-sm">{voltage} V</span>
            </div>
            <input 
              type="range" min="1" max="50" step="0.5"
              value={voltage}
              onChange={(e) => handleSliderChange('voltage', parseFloat(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between mb-1">
              <label className="font-bold text-xs text-gray-700">Qarshilik (Ω)</label>
              <span className="font-mono text-orange-500 text-sm">{resistance} Ω</span>
            </div>
            <input 
              type="range" min="1" max="100" step="1"
              value={resistance}
              onChange={(e) => handleSliderChange('resistance', parseFloat(e.target.value))}
              className="w-full accent-orange-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  };

  // 3. BIOLOGIYA LABORATORIYASI
  const renderBiologyLab = () => {
    const light = params.light || 0;
    const co2 = params.co2 || 0;
    const growth = (light + co2) / 2; // O'rtacha o'sish
    
    return (
      <div className="flex flex-col items-center w-full">
        <div className="relative w-full h-40 bg-sky-100 rounded-xl mb-6 overflow-hidden flex items-end justify-center border border-sky-200 shadow-inner">
           <Sun 
            className="absolute top-4 right-4 text-yellow-500 transition-all duration-500" 
            style={{ width: 20 + (light/2), height: 20 + (light/2), opacity: light / 100 }}
           />
           <Sprout 
            className="text-green-600 transition-all duration-700 ease-out" 
            style={{ width: 30 + (growth * 1.2), height: 30 + (growth * 1.2) }} 
            strokeWidth={1.5}
           />
           <div className="absolute inset-0 bg-blue-500 mix-blend-overlay transition-opacity duration-300 pointer-events-none" style={{ opacity: co2 / 200 }}></div>
        </div>

        <div className="w-full space-y-4">
           <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between mb-1">
              <label className="font-bold text-xs text-gray-700">Yorug'lik (%)</label>
              <span className="font-mono text-yellow-600 text-sm">{light}%</span>
            </div>
            <input 
              type="range" min="0" max="100"
              value={light}
              onChange={(e) => handleSliderChange('light', parseFloat(e.target.value))}
              className="w-full accent-yellow-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

           <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between mb-1">
              <label className="font-bold text-xs text-gray-700">CO₂ / Suv</label>
              <span className="font-mono text-gray-600 text-sm">{co2} birlik</span>
            </div>
            <input 
              type="range" min="0" max="100"
              value={co2}
              onChange={(e) => handleSliderChange('co2', parseFloat(e.target.value))}
              className="w-full accent-gray-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  };

  // --- UNIVERSAL RENDERER (Oppoq ekranni oldini olish uchun) ---
  const renderGenericLab = () => {
      return (
          <div className="w-full">
             <div className="flex justify-center mb-6">
                <FlaskConical className="w-16 h-16 text-indigo-400 animate-pulse" />
             </div>
             {Object.keys(params).map((key) => (
                 <div key={key} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-3">
                    <div className="flex justify-between mb-1">
                        <label className="font-bold text-xs text-gray-700 capitalize">{key}</label>
                        <span className="font-mono text-indigo-600 text-sm">{params[key]}</span>
                    </div>
                    <input 
                        type="range" min="0" max="100" step="1"
                        value={params[key]}
                        onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                 </div>
             ))}
          </div>
      )
  }

  // Qaysi birini ko'rsatishni tanlaymiz
  let content;
  // Biz bu yerda parameterlarga qarab aniqlaymiz
  if (config.type === SubjectType.CHEMISTRY && params.hasOwnProperty('ph')) {
      content = renderChemistryLab();
  } else if (config.type === SubjectType.PHYSICS && params.hasOwnProperty('voltage')) {
      content = renderPhysicsLab();
  } else if (config.type === SubjectType.BIOLOGY && params.hasOwnProperty('light')) {
      content = renderBiologyLab();
  } else {
      // Agar birortasi tushmasa, UNIVERSAL ni ko'rsatamiz (Oppoq ekran bo'lmaydi)
      content = renderGenericLab();
  }

  return (
    <div className="bg-slate-50 p-4 rounded-3xl shadow-inner border border-slate-200">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
            <h3 className="font-bold text-lg text-gray-800">Laboratoriya</h3>
            <p className="text-xs text-gray-500 leading-tight mt-1 max-w-[200px]">{config.instructions}</p>
        </div>
        <button 
          onClick={requestHint}
          disabled={loadingHint}
          className="text-xs flex items-center bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-200 transition-colors font-semibold"
        >
          {loadingHint ? <Loader2 className="w-3 h-3 animate-spin" /> : <HelpCircle className="w-3 h-3 mr-1" />}
          Yordam
        </button>
      </div>

      {hint && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800 animate-in slide-in-from-top-2">
          <span className="font-bold">💡 AI Maslahati:</span> {hint}
        </div>
      )}

      {content}

      <div className="mt-8">
        <button
          onClick={submitTask}
          disabled={isGrading}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transform transition-all active:scale-95 flex items-center justify-center
            ${isGrading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110'}
          `}
        >
          {isGrading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Tekshirilmoqda...
            </>
          ) : (
            <>
              Natijani Topshirish <Star className="w-5 h-5 ml-2 fill-yellow-400 text-yellow-400" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskLab;