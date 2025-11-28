import React from 'react';
import { Beaker as BeakerIcon, X, Atom, Zap } from 'lucide-react';
import { ElementData } from '../types';
import { playInteractionSound } from '../services/soundService';

interface BeakerProps {
  selectedElements: ElementData[];
  onRemove: (element: ElementData) => void;
  onReact: () => void;
  onClear: () => void;
  isAnalyzing: boolean;
}

const Beaker: React.FC<BeakerProps> = ({ selectedElements, onRemove, onReact, onClear, isAnalyzing }) => {
  const canReact = selectedElements.length >= 2;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Beaker Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <BeakerIcon className="w-5 h-5 text-indigo-600" />
          Reaksiya Kamerasi
        </h2>
        {selectedElements.length > 0 && (
          <button 
            onClick={() => { playInteractionSound('clear'); onClear(); }}
            className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded transition-colors"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* Beaker Body - Dashed Container */}
      <div className="p-4 bg-slate-50">
        <div className="min-h-[100px] rounded-xl border-2 border-dashed border-indigo-100 bg-white/50 p-3 relative transition-all">
          
          {selectedElements.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
              <Atom className="w-10 h-10 mb-1 opacity-40" />
              <p className="text-[11px] font-medium">Elementlarni tanlang</p>
            </div>
          ) : (
            /* 4-RASM USLUBIDAGI GRID */
            <div className="grid grid-cols-2 gap-2">
              {selectedElements.map((el) => (
                <div 
                  key={el.symbol} 
                  className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-100 relative group animate-scaleIn"
                >
                  {/* Circle Symbol */}
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                    {el.symbol}
                  </div>
                  
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-700 truncate">{el.name}</div>
                    <div className="text-[9px] text-slate-400 uppercase truncate">{el.category}</div>
                  </div>

                  {/* Close Button */}
                  <button 
                    onClick={() => { playInteractionSound('remove'); onRemove(el); }}
                    className="text-slate-300 hover:text-red-500 p-1 rounded-full hover:bg-slate-50 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 bg-white border-t border-slate-100">
        <button
          onClick={() => { if (canReact && !isAnalyzing) { playInteractionSound('mix'); onReact(); } }}
          disabled={!canReact || isAnalyzing}
          className={`
            w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98
            ${canReact 
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-200 hover:shadow-indigo-300' 
              : 'bg-slate-300 cursor-not-allowed shadow-none'
            }
          `}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Tahlil qilinmoqda...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-current" />
              <span>Aralashtirish va Reaksiya</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Beaker;