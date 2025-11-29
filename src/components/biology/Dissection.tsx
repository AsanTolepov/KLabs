import React, { useState, useEffect, useRef } from 'react';
import { Panel, Slider } from './ui/Layout';
import { Scissors, Grab, ScanEye, Activity, RefreshCw, Heart, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
type SpecimenType = 'heart' | 'leaf';
type ToolType = 'scalpel' | 'tweezers' | 'probe';
type PartStatus = 'intact' | 'incised' | 'removed';

interface AnatomyPart {
  id: string;
  name: string;
  description: string;
  layerIndex: number; // Lower is deeper
  status: PartStatus;
  path: string; // SVG Path d
  color: string;
  strokeColor?: string;
  requiresCut?: boolean; // If true, needs scalpel before tweezers
  pulse?: boolean; // If true, beats with heart rate
}

// --- DATA ---
const HEART_PARTS: AnatomyPart[] = [
  // Layer 3 (Deepest) - Internal Chambers
  {
    id: 'h-chambers',
    name: 'Ichki Kameralar',
    description: 'To\'rtta kamera: Klapanlar bilan ajratilgan bo\'lmachalar (yuqori) va qorinchalar (pastki).',
    layerIndex: 0,
    status: 'intact',
    path: 'M150 100 C 120 50, 50 100, 50 150 C 50 220, 150 280, 150 300 C 150 280, 250 220, 250 150 C 250 100, 180 50, 150 100',
    color: '#991b1b', // Dark red interior
    requiresCut: false,
    pulse: true
  },
  // Layer 2 - Myocardium (Muscle Wall)
  {
    id: 'h-myocardium',
    name: 'Miokard (Yurak mushagi)',
    description: 'Yurak qisqarishi uchun javob beradigan qalin mushak to\'qimasi.',
    layerIndex: 1,
    status: 'intact',
    path: 'M150 90 C 110 40, 40 90, 40 150 C 40 230, 150 310, 150 310 C 150 310, 260 230, 260 150 C 260 90, 190 40, 150 90 Z',
    color: '#ef4444', // Red muscle
    requiresCut: true,
    pulse: true
  },
  // Layer 1 (Top) - Pericardium
  {
    id: 'h-pericardium',
    name: 'Perikard',
    description: 'Yurakni himoya qilish va silliqlash uchun o\'rab turgan tolali qop.',
    layerIndex: 2,
    status: 'intact',
    path: 'M150 85 C 105 35, 35 85, 35 150 C 35 235, 150 320, 150 320 C 150 320, 265 235, 265 150 C 265 85, 195 35, 150 85 Z',
    color: '#e2e8f0', // White/Grey fibrous
    strokeColor: '#94a3b8',
    requiresCut: true,
    pulse: false // Sac doesn't beat as visibly
  }
];

const LEAF_PARTS: AnatomyPart[] = [
  // Layer 4 (Deepest) - Vascular Bundle
  {
    id: 'l-veins',
    name: 'Tomir Tutami',
    description: 'Suv va oziq moddalarni tashuvchi Ksema va Floema.',
    layerIndex: 0,
    status: 'intact',
    path: 'M50 200 L250 200 L250 250 L50 250 Z',
    color: '#dc2626', // Red/Blue veins
    requiresCut: false
  },
  // Layer 3 - Spongy Mesophyll
  {
    id: 'l-spongy',
    name: 'G\'ovak Mezofill',
    description: 'Gaz almashinuvi uchun havo bo\'shliqlari bo\'lgan siyrak hujayralar.',
    layerIndex: 1,
    status: 'intact',
    path: 'M40 150 L260 150 L260 200 L40 200 Z',
    color: '#86efac', // Light green
    requiresCut: true
  },
  // Layer 2 - Palisade Mesophyll
  {
    id: 'l-palisade',
    name: 'Ustunsimon Mezofill',
    description: 'Fotosintez uchun xloroplastlarga boy zich joylashgan ustunsimon hujayralar.',
    layerIndex: 2,
    status: 'intact',
    path: 'M40 100 L260 100 L260 150 L40 150 Z',
    color: '#16a34a', // Dark green
    requiresCut: true
  },
  // Layer 1 (Top) - Cuticle & Epidermis
  {
    id: 'l-epidermis',
    name: 'Yuqori Epidermis',
    description: 'Bargni suv yo\'qotishidan himoya qiluvchi mumsimon kutikula qatlami.',
    layerIndex: 3,
    status: 'intact',
    path: 'M30 80 L270 80 L270 100 L30 100 Z',
    color: '#a3e635', // Wax green
    strokeColor: '#ecfccb',
    requiresCut: true
  }
];

export const Dissection: React.FC<{ onContextUpdate: (data: string) => void }> = ({ onContextUpdate }) => {
  const [specimen, setSpecimen] = useState<SpecimenType>('heart');
  const [parts, setParts] = useState<AnatomyPart[]>(HEART_PARTS);
  const [tool, setTool] = useState<ToolType>('scalpel');
  const [heartRate, setHeartRate] = useState(70);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [cutPath, setCutPath] = useState<{x: number, y: number}[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Switch specimen handler
  useEffect(() => {
    setParts(specimen === 'heart' ? JSON.parse(JSON.stringify(HEART_PARTS)) : JSON.parse(JSON.stringify(LEAF_PARTS)));
    setSelectedPart(null);
    setCutPath([]);
  }, [specimen]);

  // Update AI Context
  useEffect(() => {
    const visibleLayers = parts.filter(p => p.status !== 'removed').map(p => p.name).join(', ');
    onContextUpdate(`
      Dissection Module.
      Specimen: ${specimen.toUpperCase()}.
      Active Tool: ${tool}.
      Heart Rate: ${heartRate} BPM.
      Visible Anatomy: ${visibleLayers}.
      Current Action: ${selectedPart ? `Inspecting ${parts.find(p => p.id === selectedPart)?.name}` : 'Ready'}.
    `);
  }, [specimen, parts, tool, heartRate, selectedPart, onContextUpdate]);

  const handleInteraction = (partId: string) => {
    const partIndex = parts.findIndex(p => p.id === partId);
    if (partIndex === -1) return;
    
    const part = parts[partIndex];

    // Tool Logic
    if (tool === 'scalpel') {
      if (part.status === 'intact' && part.requiresCut) {
        // Simple click to cut for this prototype (in real app, we'd check drag path)
        const newParts = [...parts];
        newParts[partIndex].status = 'incised';
        setParts(newParts);
        // Play cut animation sound or haptic here if available
      }
    } else if (tool === 'tweezers') {
      if (part.status === 'incised' || (!part.requiresCut && part.status === 'intact')) {
        // Remove part
        const newParts = [...parts];
        newParts[partIndex].status = 'removed';
        setParts(newParts);
        setSelectedPart(null);
      }
    } else if (tool === 'probe') {
      setSelectedPart(partId);
    }
  };

  const reset = () => {
    setParts(specimen === 'heart' ? JSON.parse(JSON.stringify(HEART_PARTS)) : JSON.parse(JSON.stringify(LEAF_PARTS)));
    setSelectedPart(null);
  };

  const renderedParts = [...parts].sort((a, b) => a.layerIndex - b.layerIndex);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-6 bg-lab-dark">
      {/* LEFT: CONTROLS */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6">
        
        {/* Specimen Selector */}
        <Panel title="Namuna">
          <div className="flex gap-2">
            <button 
              onClick={() => setSpecimen('heart')}
              className={`flex-1 py-4 rounded-xl flex flex-col items-center gap-2 transition-all border-2
                ${specimen === 'heart' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
              `}
            >
              <Heart className={`w-6 h-6 ${specimen === 'heart' ? 'fill-red-500 animate-pulse' : ''}`} />
              <span className="font-bold text-xs">ODAM YURAGI</span>
            </button>
            <button 
              onClick={() => setSpecimen('leaf')}
              className={`flex-1 py-4 rounded-xl flex flex-col items-center gap-2 transition-all border-2
                ${specimen === 'leaf' ? 'bg-green-50 border-green-500 text-green-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
              `}
            >
              <Leaf className="w-6 h-6" />
              <span className="font-bold text-xs">BARG KESIMI</span>
            </button>
          </div>
        </Panel>

        {/* Tool Selector */}
        <Panel title="Jarrohlik Asboblari">
          <div className="flex flex-col gap-3">
             {[
               { id: 'scalpel', icon: Scissors, label: 'Skalpel', desc: 'Butun to\'qima qatlamlarini kesish' },
               { id: 'tweezers', icon: Grab, label: 'Pinset', desc: 'Kesilgan qismlarni olib tashlash' },
               { id: 'probe', icon: ScanEye, label: 'Zond', desc: 'Organlarni aniqlash va tekshirish' },
             ].map((t) => (
               <button
                 key={t.id}
                 onClick={() => setTool(t.id as ToolType)}
                 className={`relative w-full p-3 rounded-lg flex items-center gap-4 text-left transition-all border
                    ${tool === t.id 
                      ? 'bg-blue-50 border-neon-blue text-slate-800 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
                 `}
               >
                 <t.icon className={`w-5 h-5 ${tool === t.id ? 'text-neon-blue' : 'text-slate-400'}`} />
                 <div>
                   <div className="font-bold text-sm">{t.label}</div>
                   <div className={`text-[10px] ${tool === t.id ? 'text-slate-600' : 'text-slate-400'}`}>{t.desc}</div>
                 </div>
                 {tool === t.id && <div className="absolute right-3 w-2 h-2 bg-neon-blue rounded-full animate-ping" />}
               </button>
             ))}
          </div>
        </Panel>

        {/* Info / Status */}
        <Panel title="Kuzatuvlar">
           {selectedPart ? (
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 rounded p-3 border border-slate-200"
             >
                <h4 className="text-neon-blue font-bold text-sm mb-1">{parts.find(p => p.id === selectedPart)?.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {parts.find(p => p.id === selectedPart)?.description}
                </p>
             </motion.div>
           ) : (
             <div className="text-xs text-slate-500 italic p-2 text-center">
               Anatomik tuzilmalarni tekshirish uchun Zond asbobidan foydalaning.
             </div>
           )}

           {specimen === 'heart' && (
             <div className="mt-6 pt-4 border-t border-slate-100">
               <div className="flex items-center gap-2 text-red-500 mb-2 font-bold text-xs">
                 <Activity className="w-4 h-4" /> TIRIKLIGINI KO'RSATKICHLARI
               </div>
               <Slider label="Yurak Urishi (BPM)" value={heartRate} min={40} max={180} onChange={setHeartRate} unit="" />
             </div>
           )}
        </Panel>

        <button onClick={reset} className="mt-auto py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors">
          <RefreshCw className="w-4 h-4" /> Namunani Qayta Tiklash
        </button>
      </div>

      {/* RIGHT: OPERATING TABLE */}
      <div className="w-full lg:w-3/4 bg-slate-200 rounded-2xl border-4 border-slate-300 shadow-xl relative overflow-hidden flex items-center justify-center">
         
         {/* Grid Background */}
         <div className="absolute inset-0 opacity-10" 
              style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
         />

         {/* Tool Cursor Follower */}
         <div className="absolute pointer-events-none z-50 text-slate-800 drop-shadow-lg" style={{ transform: 'translate(10px, 10px)' }}>
            {tool === 'scalpel' && <Scissors className="w-6 h-6 rotate-[-45deg]" />}
            {tool === 'tweezers' && <Grab className="w-6 h-6" />}
            {tool === 'probe' && <ScanEye className="w-6 h-6" />}
         </div>

         {/* SVG Container */}
         <div className="relative w-[400px] h-[400px]">
            <svg 
              ref={svgRef}
              viewBox="0 0 300 400" 
              className="w-full h-full drop-shadow-xl"
              style={{ overflow: 'visible' }}
            >
              <AnimatePresence>
                {renderedParts.map((part) => {
                  if (part.status === 'removed') return null;

                  // Heartbeat calculation
                  const beatDuration = 60 / heartRate;
                  
                  return (
                    <motion.g
                      key={part.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        // Apply heartbeat only to 'intact' or 'incised' pulse parts
                        scaleX: (part.pulse && specimen === 'heart') ? [1, 1.05, 1] : 1,
                        scaleY: (part.pulse && specimen === 'heart') ? [1, 1.05, 1] : 1,
                      }}
                      exit={{ opacity: 0, scale: 1.1, y: -50, rotate: 5 }}
                      transition={{ 
                        duration: 0.5,
                        scaleX: { duration: beatDuration, repeat: Infinity, ease: "easeInOut" },
                        scaleY: { duration: beatDuration, repeat: Infinity, ease: "easeInOut" }
                      }}
                      onClick={() => handleInteraction(part.id)}
                      className={`cursor-pointer transition-all duration-300
                         ${tool === 'scalpel' && part.status === 'intact' ? 'hover:brightness-110' : ''}
                         ${tool === 'tweezers' && part.status === 'incised' ? 'hover:brightness-125' : ''}
                         ${tool === 'probe' ? 'hover:brightness-110' : ''}
                      `}
                      style={{
                        transformOrigin: 'center center',
                        pointerEvents: 'all'
                      }}
                    >
                      {/* Main Shape */}
                      <path 
                        d={part.path} 
                        fill={part.color} 
                        stroke={part.strokeColor || 'rgba(0,0,0,0.2)'}
                        strokeWidth="2"
                        className="transition-colors"
                      />
                      
                      {/* Incision Mark */}
                      {part.status === 'incised' && (
                        <path 
                          d={part.path} 
                          fill="transparent" 
                          stroke="#ef4444" 
                          strokeWidth="3" 
                          strokeDasharray="5,5"
                          className="animate-pulse"
                        />
                      )}

                      {/* Texture Overlays */}
                      {specimen === 'leaf' && part.id.includes('palisade') && (
                         <pattern id="palisadePattern" width="10" height="20" patternUnits="userSpaceOnUse">
                            <rect width="8" height="18" fill="rgba(0,0,0,0.1)" rx="2" />
                         </pattern>
                      )}
                      
                      {/* Labels on hover (if probe) */}
                      {tool === 'probe' && (
                        <title>{part.name}</title>
                      )}
                    </motion.g>
                  );
                })}
              </AnimatePresence>
            </svg>
            
            {/* Visual Instruction Overlay */}
            <div className="absolute -bottom-10 w-full text-center pointer-events-none">
              <span className="bg-white/80 px-4 py-1 rounded-full text-xs text-slate-600 backdrop-blur-sm shadow-sm border border-slate-200">
                 {tool === 'scalpel' && "Kesish uchun ustki qatlamlarni bosing"}
                 {tool === 'tweezers' && "Kesilgan qatlamlarni olib tashlash uchun bosing"}
                 {tool === 'probe' && "Tuzilmalarni aniqlash uchun ustiga bosing/olib boring"}
              </span>
            </div>
         </div>
      </div>
    </div>
  );
};