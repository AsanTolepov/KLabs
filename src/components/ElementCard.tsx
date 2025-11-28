import React from 'react';
import { ElementData } from '../types';
import { playInteractionSound } from '../services/soundService';
import { Info } from 'lucide-react';

interface ElementCardProps {
  element: ElementData;
  isSelected: boolean;
  onSelect: (element: ElementData) => void;
  onViewDetails: (element: ElementData) => void;
}

const getCategoryColor = (category: string): string => {
  const c = category.toLowerCase();
  // Ranglar logikasi o'zgarishsiz qoladi...
  if (c.includes('ishqoriy') && !c.includes('yer')) return 'bg-red-100 text-red-700 border-red-200';
  if (c.includes('yer')) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (c.includes("o'tish")) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (c.includes('galogen')) return 'bg-green-100 text-green-700 border-green-200';
  if (c.includes('asil') || c.includes('inert')) return 'bg-purple-100 text-purple-700 border-purple-200';
  if (c.includes('nometall')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (c.includes('metalloid')) return 'bg-teal-100 text-teal-700 border-teal-200';
  if (c.includes('lantanoid')) return 'bg-pink-100 text-pink-700 border-pink-200';
  if (c.includes('aktinoid')) return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const ElementCard: React.FC<ElementCardProps> = ({ element, isSelected, onSelect, onViewDetails }) => {
  const colorClass = getCategoryColor(element.category);
  
  const handleClick = () => {
    playInteractionSound(isSelected ? 'deselect' : 'select');
    onSelect(element);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-between p-1.5 rounded-lg border transition-all duration-200 cursor-pointer aspect-[4/5]
        active:scale-95 shadow-sm group select-none
        ${isSelected 
          ? 'border-blue-600 ring-2 ring-blue-300 bg-blue-50 z-10 scale-105' 
          : `${colorClass} hover:border-gray-400`
        }
      `}
    >
      {/* Info tugmasi */}
      <button 
        onClick={(e) => { e.stopPropagation(); onViewDetails(element); }}
        className={`absolute top-1 left-1 p-0.5 rounded-full ${isSelected ? 'text-blue-600' : 'text-current opacity-40'}`}
      >
        <Info className="w-3 h-3" />
      </button>

      {/* Oksidlanish darajasi */}
      <span className="text-[9px] font-bold opacity-60 absolute top-1 right-1">
        {element.oxid[0] > 0 ? `+${element.oxid[0]}` : element.oxid[0]}
      </span>

      {/* Simvol va Nom */}
      <div className="flex flex-col items-center justify-center flex-grow mt-2">
        <span className="text-xl font-bold leading-none mb-1">{element.symbol}</span>
        <span className="text-[9px] text-center leading-tight line-clamp-1 px-0.5 w-full overflow-hidden">
          {element.name}
        </span>
      </div>
    </div>
  );
};

export default ElementCard;