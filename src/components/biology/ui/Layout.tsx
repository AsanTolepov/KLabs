import React from 'react';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4 ${className}`}>
    <h3 className="font-bold text-slate-700 border-b border-slate-100 pb-2">{title}</h3>
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {children}
    </div>
  </div>
);

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, onChange, unit = '' }) => (
  <div>
    <div className="flex justify-between mb-2 text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="font-mono font-bold text-slate-800">{value}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);