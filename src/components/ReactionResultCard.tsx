import React, { useEffect, useState } from 'react';
import { ReactionResult } from '../types';
import { CheckCircle2, AlertCircle, Info, Box, RefreshCw } from 'lucide-react';
import { playReactionSound } from '../services/soundService';
import MoleculeViewer from './MoleculeViewer';

interface ReactionResultCardProps {
  result: ReactionResult;
  onReset: () => void;
}

const ReactionResultCard: React.FC<ReactionResultCardProps> = ({ result, onReset }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const viz = result.visualization_plan;

  useEffect(() => {
    let soundType = 'none';
    if (viz.template.includes('flash')) soundType = 'exothermic_flash';
    else if (viz.template.includes('bubbles')) soundType = 'gas_evolution';

    playReactionSound(soundType, result.possible);
    setShowAnimation(true);
    const timer = setTimeout(() => setShowAnimation(false), viz.duration_ms || 2000);
    return () => clearTimeout(timer);
  }, [result, viz]);

  // Suv uchun maxsus ranglar legendasi
  const isWater = viz.recommended_3d_assets.product_model?.includes('water') || viz.recommended_3d_assets.product_model === 'h2o';

  return (
    <div className="w-full relative mt-4 animate-slideUp pb-6">
      <div className={`rounded-2xl border shadow-lg overflow-hidden bg-white ${result.possible ? 'border-green-200' : 'border-amber-200'}`}>
        
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${result.possible ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className="flex items-center gap-3">
            {result.possible ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            )}
            <div>
              <h3 className={`text-md font-bold leading-tight ${result.possible ? 'text-green-900' : 'text-amber-900'}`}>
                {result.possible ? 'Reaksiya Muvaffaqiyatli!' : 'Reaksiya Yo\'q'}
              </h3>
              {result.reaction_type && (
                 <p className="text-[10px] uppercase font-bold opacity-60 mt-0.5 tracking-wide text-slate-700">
                   {result.reaction_type}
                 </p>
              )}
            </div>
          </div>
          <button onClick={onReset} className="p-2 rounded-full hover:bg-white/60 transition-colors">
            <RefreshCw className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 3D Viewer Container - 4-rasm uslubida */}
          {result.possible && viz.recommended_3d_assets.product_model && (
            <div className="w-full h-60 bg-[#0F172A] rounded-xl overflow-hidden relative shadow-inner border border-slate-700">
                {/* Tepada label */}
                <div className="absolute top-3 left-3 z-10 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-mono text-white flex items-center gap-1.5 border border-white/10">
                    <Box className="w-3 h-3" /> 3D SIMULYATSIYA
                </div>

                {/* 3D Komponent */}
                <MoleculeViewer modelType={viz.recommended_3d_assets.product_model} colors={viz.colors} />

                {/* Pastda Legend (Tarkibi) - 4-rasmga o'xshash */}
                <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm p-2.5 rounded-lg border border-white/20 shadow-lg min-w-[100px]">
                  <p className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tarkibi</p>
                  <div className="space-y-1.5">
                    {isWater ? (
                      <>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                           <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm border border-red-600/20 block"></span>
                           Kislorod
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                           <span className="w-3 h-3 rounded-full bg-white shadow-sm border border-slate-300 block"></span>
                           Vodorod
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                           <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm block"></span>
                           Asosiy Atom
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                           <span className="w-3 h-3 rounded-full bg-slate-400 shadow-sm block"></span>
                           Bog'langan
                        </div>
                      </>
                    )}
                  </div>
                </div>
            </div>
          )}

          {/* Tushuntirish */}
          <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 flex gap-3">
             <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
             <p className="text-sm text-slate-700 leading-relaxed">
                {result.possible ? result.explanation : result.why_no_reaction}
             </p>
          </div>

          {/* Mahsulotlar */}
          {result.possible && result.products.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mahsulotlar</h4>
              <div className="flex flex-wrap gap-2">
                {result.products.map((product, idx) => (
                  <div key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md text-sm font-semibold border border-indigo-100">
                    {product}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactionResultCard;