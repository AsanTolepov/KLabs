import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Nucleotide, DnaStrand } from '../types';
import { Panel } from './ui/Layout';
import { Check, RotateCw, RefreshCw } from 'lucide-react';

const BASE_COLORS = {
  A: 'bg-green-500 shadow-sm border border-green-600/20 text-white',
  T: 'bg-red-500 shadow-sm border border-red-600/20 text-white',
  G: 'bg-yellow-500 shadow-sm border border-yellow-600/20 text-white',
  C: 'bg-blue-500 shadow-sm border border-blue-600/20 text-white',
};

const PAIRS: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };

export const DNA: React.FC<{ onContextUpdate: (data: string) => void }> = ({ onContextUpdate }) => {
  const [templateStrand, setTemplateStrand] = useState<DnaStrand>([]);
  const [userStrand, setUserStrand] = useState<(Nucleotide | null)[]>([]);
  const [completed, setCompleted] = useState(false);

  // Initialize Template
  useEffect(() => {
    reset();
  }, []);

  const reset = () => {
    const bases: ('A'|'T'|'G'|'C')[] = ['A', 'C', 'G', 'T', 'A', 'G', 'C', 'T'];
    const newTemplate = bases.map((base, i) => ({
      id: `temp-${i}`,
      base,
      x: 0,
      y: 0,
      isFixed: true
    }));
    setTemplateStrand(newTemplate);
    setUserStrand(new Array(bases.length).fill(null));
    setCompleted(false);
  };

  useEffect(() => {
    const filledCount = userStrand.filter(Boolean).length;
    const isFull = filledCount === templateStrand.length;
    
    // Check correctness
    let correct = 0;
    userStrand.forEach((n, i) => {
       if (n && PAIRS[n.base] === templateStrand[i].base) correct++;
    });

    onContextUpdate(`
      DNA Assembly Module.
      Target Length: ${templateStrand.length}.
      Bases Placed: ${filledCount}.
      Correct Pairs: ${correct}.
      Status: ${completed ? 'Double Helix Formed' : 'Assembly in progress'}.
    `);

    if (isFull && correct === templateStrand.length) {
      setTimeout(() => setCompleted(true), 500);
    }
  }, [userStrand, templateStrand, completed, onContextUpdate]);

  const handleDrop = (baseType: 'A'|'T'|'G'|'C', index: number) => {
     const newStrand = [...userStrand];
     newStrand[index] = { id: `user-${Date.now()}`, base: baseType, x: 0, y: 0 };
     setUserStrand(newStrand);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-6">
       <div className="w-full lg:w-1/4 flex flex-col gap-6">
         <Panel title="Nukleotidlar">
            <div className="grid grid-cols-2 gap-4">
               {(Object.keys(BASE_COLORS) as Array<'A'|'T'|'G'|'C'>).map((base) => (
                 <motion.div 
                   key={base}
                   drag
                   dragSnapToOrigin
                   whileDrag={{ scale: 1.2, zIndex: 50 }}
                   className={`h-24 rounded-lg ${BASE_COLORS[base]} flex items-center justify-center text-3xl font-black cursor-grab active:cursor-grabbing`}
                 >
                   {base}
                 </motion.div>
               ))}
            </div>
            <div className="mt-6 text-sm text-slate-500 text-center">
               Qolip zanjiriga mos keluvchi asoslarni surib joylashtiring.
               <br/>
               <span className="text-green-600 font-bold">A ↔ T</span> | <span className="text-blue-600 font-bold">G ↔ C</span>
            </div>
         </Panel>
         
         <button onClick={reset} className="w-full py-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 text-slate-700 font-bold transition-colors shadow-sm">
           <RefreshCw className="w-5 h-5" /> Ketma-ketlikni Qayta Tiklash
         </button>
       </div>

       <div className="w-full lg:w-3/4 bg-slate-100 border border-slate-200 rounded-xl p-8 relative overflow-y-auto flex justify-center shadow-inner">
          {completed ? (
            <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
               <RotateCw className="w-24 h-24 text-neon-green animate-spin-slow mb-6" />
               <h2 className="text-3xl font-bold text-slate-800 mb-2">Qo'sh Spiral Yig'ildi!</h2>
               <p className="text-neon-blue font-bold">100% Genetik Moslik</p>
            </div>
          ) : (
            <div className="flex gap-8 py-10">
               {/* Backbone Left (Template) */}
               <div className="flex flex-col gap-2">
                 {templateStrand.map((n, i) => (
                   <div key={n.id} className="flex items-center">
                      <div className="w-4 h-16 bg-slate-400 rounded-l-full mr-1" /> {/* Sugar Phosphate */}
                      <div className={`w-16 h-16 rounded-r-lg ${BASE_COLORS[n.base]} flex items-center justify-center text-xl font-bold shadow-sm`}>
                        {n.base}
                      </div>
                   </div>
                 ))}
               </div>

               {/* Hydrogen Bonds */}
               <div className="flex flex-col gap-2 pt-6">
                  {templateStrand.map((_, i) => (
                     <div key={i} className="h-8 flex flex-col justify-between">
                        <div className="w-8 border-t-2 border-dashed border-slate-300 my-auto" />
                     </div>
                  ))}
               </div>

               {/* Backbone Right (Drop Zones) */}
               <div className="flex flex-col gap-2">
                 {userStrand.map((n, i) => (
                   <div key={i} className="flex items-center">
                      <motion.div 
                        className={`w-16 h-16 rounded-l-lg flex items-center justify-center text-xl font-bold transition-colors border-2 ${
                           n 
                           ? BASE_COLORS[n.base] + ' border-transparent' 
                           : 'bg-white border-dashed border-slate-300 text-slate-400'
                        }`}
                      >
                         {n ? n.base : '?'}
                         
                         {/* Quick-fill helper for interaction demo */}
                         {!n && (
                           <div className="absolute flex gap-1 -right-40 opacity-0 hover:opacity-100 transition-opacity bg-white border border-slate-200 p-2 rounded shadow-lg z-20">
                             {['A','T','G','C'].map(b => (
                               <button 
                                 key={b} 
                                 onClick={() => handleDrop(b as any, i)}
                                 className={`w-6 h-6 text-[10px] rounded ${BASE_COLORS[b as keyof typeof BASE_COLORS]} flex items-center justify-center`}
                               >
                                 {b}
                               </button>
                             ))}
                           </div>
                         )}
                      </motion.div>
                      <div className="w-4 h-16 bg-slate-400 rounded-r-full ml-1" />
                   </div>
                 ))}
               </div>
            </div>
          )}
          
          <div className="absolute bottom-4 left-0 w-full text-center text-xs text-slate-400">
             Mos keluvchi asosni tanlash uchun bo'sh kataklarning ustiga bosing
          </div>
       </div>
    </div>
  );
};