import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Panel, Slider } from './ui/Layout';
import { SlideType } from '../../types';
import { Droplets, MousePointer2, ScanEye } from 'lucide-react';

const SLIDES: SlideType[] = [
  { id: 'onion', name: 'Piyoz', type: 'onion', image: 'bg-amber-100' },
  { id: 'cheek', name: 'Yonoq', type: 'cheek', image: 'bg-rose-100' },
  { id: 'bacteria', name: 'Bakteriya', type: 'bacteria', image: 'bg-slate-200' },
];

export const Microscope: React.FC<{ onContextUpdate: (data: string) => void }> = ({ onContextUpdate }) => {
  const [activeSlide, setActiveSlide] = useState<SlideType | null>(null);
  const [magnification, setMagnification] = useState(1);
  const [focus, setFocus] = useState(0);
  const [light, setLight] = useState(50);
  const [stain, setStain] = useState<'none' | 'iodine' | 'methylene'>('none');
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    onContextUpdate(`Microscope: ${activeSlide?.name || 'None'}, Mag: ${magnification}x`);
  }, [activeSlide, magnification, focus, stain, light, onContextUpdate]);

  const blurAmount = Math.abs(focus - 50) * 0.4;
  const zoomScale = magnification === 1 ? 1 : magnification === 2 ? 2.5 : 8;
  const brightness = light / 50;
  const stainColor = stain === 'iodine' ? 'rgba(234, 179, 8, 0.4)' : stain === 'methylene' ? 'rgba(37, 99, 235, 0.4)' : 'transparent';

  return (
    // ASOSIY CONTAINER: Doimo flex-col (ustma-ust)
    <div className="flex flex-col gap-6 p-4 pb-24 w-full max-w-lg mx-auto">
      
      {/* 1-QISM: MIKROSKOP KO'ZI (TEPADA) */}
      <div className="w-full">
         {/* Container - Kvadrat shaklni saqlaydi */}
         <div className="w-full aspect-square relative mx-auto shadow-2xl rounded-full border-4 border-white ring-4 ring-slate-100 overflow-hidden bg-slate-900">
            
            {/* Qorong'u chetlar (Vinyetka) */}
            <div className="absolute inset-0 z-20 pointer-events-none" 
                style={{ background: 'radial-gradient(circle, transparent 55%, #0f172a 90%)' }} 
            />

            {/* Harakatlanuvchi qism */}
            <div className="w-full h-full relative cursor-move touch-none"
                onMouseMove={(e) => { if (e.buttons === 1) setStagePosition(p => ({ x: p.x + e.movementX, y: p.y + e.movementY })); }}
                onTouchMove={(e) => { /* Mobile touch logic */ }}
            >
            {activeSlide ? (
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                    style={{
                        filter: `blur(${blurAmount}px) brightness(${brightness})`,
                        transform: `scale(${zoomScale}) translate(${stagePosition.x / zoomScale}px, ${stagePosition.y / zoomScale}px)`
                    }}
                >
                    {/* Namuna Foni */}
                    <div className={`w-[180%] h-[180%] relative ${
                        activeSlide.type === 'onion' ? 'bg-yellow-50' : 
                        activeSlide.type === 'cheek' ? 'bg-rose-50' : 'bg-gray-100'
                    }`}>
                        {/* To'qima Patterni */}
                        <div className="absolute inset-0 w-full h-full opacity-60" 
                            style={{
                                backgroundColor: stainColor,
                                backgroundImage: activeSlide.type === 'onion' 
                                ? 'linear-gradient(45deg, #000 1px, transparent 1px)' 
                                : 'radial-gradient(#000 1px, transparent 1px)',
                                backgroundSize: '60px 60px'
                            }}
                        />
                        {/* Hujayralar (Piyoz) */}
                        {activeSlide.type === 'onion' && (
                            <div className="w-full h-full grid grid-cols-12 gap-0.5 p-10">
                               {Array.from({length: 80}).map((_, i) => (
                                   <div key={i} className="border border-slate-400/40 relative h-16 flex items-center justify-center">
                                       <div className={`w-3 h-3 rounded-full transition-opacity duration-500 ${stain === 'iodine' ? 'bg-amber-700 opacity-80' : 'bg-slate-400 opacity-10'}`}></div>
                                   </div>
                               ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10">
                    <div className="bg-slate-800/80 p-4 rounded-full backdrop-blur-sm mb-3 shadow-lg">
                       <ScanEye className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-slate-300">Namunani tanlang</p>
                </div>
            )}
            </div>
         </div>
         
         {/* Info Label */}
         <div className="mt-3 text-center">
            <span className="bg-slate-800 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
                {activeSlide ? `${activeSlide.name} • ${magnification === 1 ? '40x' : magnification === 2 ? '100x' : '400x'}` : 'Namuna yo\'q'}
            </span>
         </div>
      </div>

      {/* 2-QISM: NAMUNA TANLASH (O'RTADA) */}
      <Panel title="Namuna To'plami" className="w-full">
          <div className="grid grid-cols-3 gap-3">
            {SLIDES.map((slide) => (
              <motion.button
                key={slide.id}
                onClick={() => { setActiveSlide(slide); setStain('none'); setFocus(0); }}
                className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                  activeSlide?.id === slide.id 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md' 
                    : 'border-slate-100 bg-white text-slate-500 hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full border shadow-inner ${slide.image}`} />
                <span className="text-xs font-bold">{slide.name}</span>
              </motion.button>
            ))}
          </div>
      </Panel>

      {/* 3-QISM: SOZLAMALAR (PASTDA) */}
      <Panel title="Sozlamalar" className="w-full">
          <div className="space-y-6">
             {/* Zoom */}
             <div>
               <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-wider">Kattalashtirish</label>
               <div className="flex bg-slate-100 p-1 rounded-xl">
                 {[1, 2, 3].map((m) => (
                   <button
                     key={m}
                     onClick={() => setMagnification(m)}
                     className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${
                       magnification === m ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
                     }`}
                   >
                     {m === 1 ? '4x' : m === 2 ? '10x' : '40x'}
                   </button>
                 ))}
               </div>
             </div>

             {/* Sliders */}
             <Slider label="Fokus (Aniqlik)" value={focus} min={0} max={100} onChange={setFocus} />
             <Slider label="Yorug'lik" value={light} min={0} max={100} onChange={setLight} unit="%" />
             
             {/* Bo'yoqlar */}
             <div>
               <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-wider">Bo'yoqlar</label>
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setStain('iodine')} className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all ${stain === 'iodine' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                      <div className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200"></div> Yod
                  </button>
                  <button onClick={() => setStain('methylene')} className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all ${stain === 'methylene' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                      <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200"></div> Metilen
                  </button>
               </div>
             </div>
          </div>
      </Panel>

    </div>
  );
};