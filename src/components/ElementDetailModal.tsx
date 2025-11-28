import React from 'react';
import { ElementData } from '../types';
import { X } from 'lucide-react';

interface ElementDetailModalProps {
  element: ElementData;
  atomicNumber: number;
  onClose: () => void;
}

const ElementDetailModal: React.FC<ElementDetailModalProps> = ({ element, atomicNumber, onClose }) => {
  if (!element) return null;
  const approxMass = (atomicNumber * (atomicNumber < 20 ? 2.0 : 2.5)).toFixed(2);

  const getCategoryHeaderColor = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('ishqoriy')) return 'bg-red-200';
    if (c.includes('nometall')) return 'bg-blue-200';
    return 'bg-gray-200';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 relative ${getCategoryHeaderColor(element.category)}`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-1 bg-white/30 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-20 h-20 bg-white/90 rounded-xl shadow-lg flex flex-col items-center justify-center border-2 border-white/50">
              <span className="text-3xl font-bold text-slate-800">{element.symbol}</span>
              <span className="text-xs font-mono text-slate-500">{atomicNumber}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{element.name}</h2>
              <p className="uppercase text-xs font-medium text-slate-700">{element.category}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border">
              <div className="text-xs text-slate-400">Massasi</div>
              <div className="font-mono">~{approxMass} u</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border">
               <div className="text-xs text-slate-400">Holati</div>
               <div className="capitalize">{element.state}</div>
            </div>
          </div>
          
          <div>
             <h3 className="text-sm font-bold mb-1">Ma'lumot</h3>
             <p className="text-sm text-slate-600 bg-amber-50 p-3 rounded border border-amber-100">{element.notes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementDetailModal;