import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CircuitBoard from './CircuitBoard';
import { CircuitComponent, ComponentType } from '../../types';
import { Trash2, Battery, Lightbulb, Radio, ArrowLeft, Zap, Plus } from 'lucide-react';

// Komponentlar shablonlari
const COMPONENT_TEMPLATE = [
  { type: ComponentType.BATTERY, label: 'Batareya', icon: <Battery />, defaultProps: { voltage: 9 } },
  { type: ComponentType.RESISTOR, label: 'Rezistor', icon: <div className="w-6 h-2 bg-transparent rounded-full border-2 border-slate-600" />, defaultProps: { resistance: 100 } },
  { type: ComponentType.LAMP, label: 'Chiroq', icon: <Lightbulb />, defaultProps: { resistance: 10 } },
  { type: ComponentType.SWITCH, label: 'Kalit', icon: <div className="w-4 h-4 border-b-2 border-slate-600 -rotate-45 origin-bottom-left" />, defaultProps: { isOn: false } },
  { type: ComponentType.CAPACITOR, label: 'Kondensator', icon: <div className="flex gap-1"><div className="w-0.5 h-4 bg-slate-600"/><div className="w-0.5 h-4 bg-slate-600"/></div>, defaultProps: { capacitance: 0.001 } },
  { type: ComponentType.VOLTMETER, label: 'Voltmetr', icon: <div className="w-5 h-5 rounded-full border-2 border-cyan-600 flex items-center justify-center text-[8px] font-bold text-cyan-600">V</div>, defaultProps: {} },
  { type: ComponentType.AMMETER, label: 'Ampermetr', icon: <div className="w-5 h-5 rounded-full border-2 border-lime-600 flex items-center justify-center text-[8px] font-bold text-lime-600">A</div>, defaultProps: {} },
  { type: ComponentType.WIRE, label: 'Sim', icon: <div className="w-full h-0.5 bg-amber-600" />, defaultProps: {} },
];

const ElectronicsLab: React.FC = () => {
  const navigate = useNavigate();
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [dragType, setDragType] = useState<ComponentType | null>(null);

  const handleDragStart = (type: ComponentType) => { setDragType(type); };

  const handleAddComponent = (type: ComponentType) => {
    const template = COMPONENT_TEMPLATE.find(c => c.type === type);
    if (!template) return;
    const newComponent: CircuitComponent = {
      id: Math.random().toString(36).substr(2, 9), 
      type: type, x: 5, y: 5, rotation: 0,
      properties: { ...template.defaultProps }, nodes: [] 
    };
    setComponents(prev => [...prev, newComponent]);
  };

  const handleDrop = (x: number, y: number) => {
    if (!dragType) return;
    const template = COMPONENT_TEMPLATE.find(c => c.type === dragType);
    if (!template) return;
    const newComponent: CircuitComponent = {
      id: Math.random().toString(36).substr(2, 9), 
      type: dragType, x: x, y: y, rotation: 0,
      properties: { ...template.defaultProps }, nodes: [] 
    };
    setComponents(prev => [...prev, newComponent]);
    setDragType(null);
  };

  const clearBoard = () => setComponents([]);

  return (
    // MANA SHU YERDA 'pb-[90px]' QO'SHILDI.
    // Bu butun sahifaning tagidan 90px bo'sh joy qoldiradi, shunda Menyu hech narsani yopmaydi.
    <div className="flex flex-col h-[100vh] bg-slate-50 relative overflow-hidden pb-[90px]">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-slate-200 h-14 flex items-center px-4 shadow-sm z-40 shrink-0 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200">
                <ArrowLeft size={20} />
            </button>
            <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">Elektr Zanjiri</span>
          </div>
          <button onClick={clearBoard} className="text-red-500 p-2 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1">
              <Trash2 size={16} /> <span className="hidden sm:inline">TOZALASH</span>
          </button>
      </div>

      {/* --- DOSKA (FLEX-1, BOR BO'SH JOYNI EGALLAYDI) --- */}
      <div className="flex-1 relative w-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden">
        <CircuitBoard 
            components={components} 
            setComponents={setComponents} 
            onDrop={handleDrop} 
        />
        {components.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0">
              <div className="text-center bg-white/60 backdrop-blur p-6 rounded-3xl border border-slate-200">
                 <Zap size={48} className="mx-auto text-slate-400 mb-2" />
                 <p className="text-slate-500 font-mono text-sm font-bold">Maydon bo'sh</p>
                 <p className="text-[10px] text-slate-400">Pastdagi elementni bosing</p>
              </div>
           </div>
        )}
      </div>

      {/* --- PASTKI PANEL (KOMPONENTLAR) --- */}
      {/* Bu panel endi tagida emas, balki header va footer o'rtasidagi joyning eng pastida turadi */}
      <div className="h-auto bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 flex flex-col shrink-0">
        <div className="overflow-x-auto hide-scrollbar p-3 w-full">
            <div className="flex gap-3 w-max px-2"> 
                {COMPONENT_TEMPLATE.map((item) => (
                    <div 
                        key={item.type} 
                        draggable 
                        onDragStart={() => handleDragStart(item.type)}
                        onClick={() => handleAddComponent(item.type)} 
                        className="flex flex-col items-center justify-center gap-2 min-w-[70px] h-[70px] bg-white border border-slate-200 rounded-2xl active:scale-90 active:border-cyan-500 active:bg-cyan-50 transition-all shadow-sm cursor-pointer select-none group"
                    >
                        <div className="text-slate-600 group-active:text-cyan-600">
                            {item.icon}
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight text-center leading-none group-active:text-cyan-600">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ElectronicsLab;