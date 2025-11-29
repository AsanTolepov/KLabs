import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { CircuitComponent, ComponentType } from '../../types';
import { solveCircuit } from '../../services/circuitSolver';
import { RotateCw, Play, Pause, RotateCcw, MousePointer2, Cable, Trash } from 'lucide-react';

interface Props {
  components: CircuitComponent[];
  setComponents: (c: CircuitComponent[]) => void;
  onDrop: (x: number, y: number) => void;
}

const GRID_SIZE = 40; // Katakcha o'lchami
type ToolMode = 'select' | 'wire';

const CircuitBoard: React.FC<Props> = ({ components, setComponents, onDrop }) => {
  const boardRef = useRef<HTMLDivElement>(null);
  
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<{x: number, y: number} | null>(null);
  
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{x: number, y: number} | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [simulationResult, setSimulationResult] = useState({ nodes: {}, currents: {} });
  
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const capacitorVoltagesRef = useRef<Record<string, number>>({});

  // --- KUCHAYTIRILGAN KOORDINATA ANIQLASH (MUHIM QISM) ---
  const getSmartCoords = (e: React.MouseEvent | React.DragEvent) => {
    if (!boardRef.current) return { x: 0, y: 0 };
    const rect = boardRef.current.getBoundingClientRect();
    
    const clientX = 'clientX' in e ? e.clientX : (e as React.TouchEvent).touches?.[0]?.clientX || 0;
    const clientY = 'clientY' in e ? e.clientY : (e as React.TouchEvent).touches?.[0]?.clientY || 0;

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // 1. Grid bo'yicha aniq koordinata (float emas, integer)
    const gridX = Math.round(mouseX / GRID_SIZE);
    const gridY = Math.round((mouseY - 20) / GRID_SIZE); // 20px offset padding uchun

    // 2. Mavjud komponent uchlarini qidirish (Magnit effekti)
    let bestDist = 0.6; // Grid katakchasining 60% masofasida bo'lsa yopishadi
    let snapTarget = null;

    components.forEach(c => {
        // Komponentning boshi
        const dx1 = Math.abs(c.x - gridX);
        const dy1 = Math.abs(c.y - gridY);
        if (dx1 < bestDist && dy1 < bestDist) {
            snapTarget = { x: c.x, y: c.y };
        }

        // Komponentning oxiri (aylanishni hisobga olgan holda)
        const len = c.properties.length || 3;
        let endX = c.x;
        let endY = c.y;

        if (c.rotation === 0) endX += len;
        else if (c.rotation === 90) endY += len;
        else if (c.rotation === 180) endX -= len;
        else if (c.rotation === 270) endY -= len;

        const dx2 = Math.abs(endX - gridX);
        const dy2 = Math.abs(endY - gridY);
        if (dx2 < bestDist && dy2 < bestDist) {
            snapTarget = { x: endX, y: endY };
        }
    });

    // Agar yaqin uch topilsa, o'shani qaytaramiz, aks holda oddiy grid
    if (snapTarget) {
        setSnapIndicator(snapTarget);
        return snapTarget;
    }
    
    setSnapIndicator(null);
    return { x: gridX, y: gridY };
  };

  // --- TOPOLOGIYA VA SIMULYATSIYA ---
  const topology = useMemo(() => {
    const pinMap = new Map<string, string>();
    let nodeCounter = 0;
    const connections: Record<string, string[]> = {}; 
    
    // Barcha komponentlarni aylantirib, uchlarini (Node) aniqlaymiz
    const componentsWithNodes = components.map(c => {
        const len = c.properties.length || 3;
        let p2x = c.x, p2y = c.y;

        // 2-uchning koordinatasini hisoblash
        if (c.rotation === 0) p2x += len;
        else if (c.rotation === 90) p2y += len;
        else if (c.rotation === 180) p2x -= len;
        else if (c.rotation === 270) p2y -= len;

        // Muhim: Koordinatalarni yaxlitlash (xatolikni oldini olish uchun)
        const pins = [
            {x: Math.round(c.x), y: Math.round(c.y)}, 
            {x: Math.round(p2x), y: Math.round(p2y)}
        ];
        const nodeIds: string[] = [];

        pins.forEach(p => {
            // Koordinata kaliti. Masalan: "5,10"
            // Agar 3 ta sim shu nuqtada tugasa, ularning hammasi bitta Node (tugun) bo'ladi.
            const key = `${p.x},${p.y}`;
            if (!pinMap.has(key)) pinMap.set(key, `n${nodeCounter++}`);
            const nodeId = pinMap.get(key)!;
            nodeIds.push(nodeId);
            
            if (!connections[nodeId]) connections[nodeId] = [];
            connections[nodeId].push(c.id);
        });
        return { ...c, nodes: nodeIds };
    });
    return { nodes: Array.from(new Set(pinMap.values())), connections, componentsWithNodes };
  }, [components]);

  const updateSimulation = useCallback((dt: number) => {
      try {
          if (components.length === 0) return;
          const result = solveCircuit(topology.componentsWithNodes, topology.nodes, topology.connections, capacitorVoltagesRef.current);
          setSimulationResult(result as any);
      } catch (e) {
          // Xatolik bo'lsa jimgina o'tkazib yuboramiz
      }
  }, [topology, components]);

  const animate = (timeNow: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timeNow;
      const dt = Math.min((timeNow - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timeNow;
      if (isPlaying) { setSimTime(t => t + dt); updateSimulation(dt); }
      requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => { requestRef.current = requestAnimationFrame(animate); return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); }; }, [isPlaying, updateSimulation]);
  useEffect(() => { updateSimulation(0); }, [topology]);

  // --- HODISALAR (HANDLERS) ---
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const { x, y } = getSmartCoords(e);
    if (!isNaN(x) && !isNaN(y)) {
        onDrop(x, y);
    }
    setSnapIndicator(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolMode !== 'wire') return;
    const coords = getSmartCoords(e);
    setDragStart(coords);
    setDragCurrent(coords);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (toolMode === 'wire') {
        const coords = getSmartCoords(e);
        setDragCurrent(coords); // Sim chizilayotganda uchni yangilab turamiz
    }
  };

  const handleMouseUp = () => {
    if (toolMode !== 'wire' || !dragStart || !dragCurrent) {
        setDragStart(null); setDragCurrent(null); return;
    }
    
    // Sim chizish logikasi
    const dx = dragCurrent.x - dragStart.x;
    const dy = dragCurrent.y - dragStart.y;
    
    // Faqat gorizontal yoki vertikal chizishga majburlash
    let len = 0, rot = 0;
    if (Math.abs(dx) >= Math.abs(dy)) { 
        len = Math.abs(dx); 
        rot = dx >= 0 ? 0 : 180; 
    } else { 
        len = Math.abs(dy); 
        rot = dy >= 0 ? 90 : 270; 
    }

    // Uzunlikni yaxlitlash (Juda muhim: 3.99 -> 4 bo'lishi kerak)
    len = Math.round(len);

    if (len > 0) {
        const newWire: CircuitComponent = {
            id: Math.random().toString(36).substr(2, 9),
            type: ComponentType.WIRE,
            x: dragStart.x, 
            y: dragStart.y, 
            rotation: rot,
            properties: { length: len }, 
            nodes: []
        };
        setComponents([...components, newWire]);
    }
    setDragStart(null); setDragCurrent(null);
  };

  const handleComponentClick = (id: string, e: React.MouseEvent) => {
    if (toolMode === 'wire') return;
    e.stopPropagation();
    const comp = components.find(c => c.id === id);
    if (comp && comp.type === ComponentType.SWITCH) {
        setComponents(components.map(c => c.id === id ? { ...c, properties: { ...c.properties, isOn: !c.properties.isOn } } : c));
    } else { setSelectedId(id); }
  };

  const handleRotate = () => {
    if (!selectedId) return;
    setComponents(components.map(c => c.id === selectedId ? { ...c, rotation: (c.rotation + 90) % 360 } : c));
  };
  const handleDelete = () => {
    if (!selectedId) return;
    setComponents(components.filter(c => c.id !== selectedId));
    setSelectedId(null);
  };

  // --- RENDERING (CHIZISH) ---
  
  // Chizilayotgan sharpali sim (Ghost Wire)
  let ghostWire = null;
  if (dragStart && dragCurrent && toolMode === 'wire') {
      const dx = dragCurrent.x - dragStart.x, dy = dragCurrent.y - dragStart.y;
      let len = 0, rot = 0;
      if (Math.abs(dx) >= Math.abs(dy)) { len = Math.abs(dx); rot = dx >= 0 ? 0 : 180; } 
      else { len = Math.abs(dy); rot = dy >= 0 ? 90 : 270; }
      len = Math.round(len); // Vizual ko'rinishda ham yaxlitlaymiz
      if (len > 0) ghostWire = { id: 'ghost', type: ComponentType.WIRE, x: dragStart.x, y: dragStart.y, rotation: rot, properties: { length: len }, nodes: [] } as CircuitComponent;
  }

  return (
    <div 
      ref={boardRef} 
      className={`w-full h-full relative ${toolMode === 'wire' ? 'cursor-crosshair' : 'cursor-default'}`}
      onDragOver={handleDragOver} onDrop={handleDrop} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
      onClick={() => setSelectedId(null)}
    >
      {/* Asboblar paneli */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto z-50">
          <div className="bg-white shadow-lg border border-slate-200 rounded-xl p-1.5 flex flex-col gap-1">
             <button 
                onClick={() => setToolMode('select')} 
                className={`p-3 rounded-lg transition-all ${toolMode === 'select' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                title="Tanlash"
             >
                <MousePointer2 size={20} />
             </button>
             <button 
                onClick={() => setToolMode('wire')} 
                className={`p-3 rounded-lg transition-all ${toolMode === 'wire' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                title="Sim (Kabel)"
             >
                <Cable size={20} />
             </button>
          </div>
      </div>

      {/* Simulyatsiya boshqaruv */}
      <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto z-50">
          <div className="bg-white shadow-lg border border-slate-200 rounded-xl p-1.5 flex items-center gap-1">
             <button onClick={() => setIsPlaying(!isPlaying)} className={`p-2.5 rounded-lg flex items-center justify-center ${isPlaying ? 'bg-amber-100 text-amber-600' : 'bg-cyan-50 text-cyan-600'}`}>
                 {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
             </button>
             <button onClick={() => { setIsPlaying(false); setSimTime(0); capacitorVoltagesRef.current = {}; updateSimulation(0); }} className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-lg">
                 <RotateCcw size={20} />
             </button>
             <div className="px-2 text-xs font-mono text-slate-400 border-l">{simTime.toFixed(1)}s</div>
          </div>
      </div>

      {/* Magnit indikatori (Yashil doiracha) */}
      {snapIndicator && (<div className="absolute w-4 h-4 rounded-full bg-green-500/50 border border-green-600 shadow-[0_0_10px_rgba(34,197,94,0.8)] z-40 pointer-events-none -translate-x-1/2 -translate-y-1/2" style={{ left: snapIndicator.x * GRID_SIZE, top: snapIndicator.y * GRID_SIZE + 20 }} />)}

      {/* Komponentlar */}
      {components.map(comp => (
        <ComponentRenderer 
            key={comp.id} 
            data={comp} 
            isSelected={selectedId === comp.id} 
            isWireMode={toolMode === 'wire'} 
            onClick={(e) => handleComponentClick(comp.id, e)} 
            simData={simulationResult} 
            capVoltage={capacitorVoltagesRef.current[comp.id] || 0} 
        />
      ))}
      
      {/* Chizilayotgan sim */}
      {ghostWire && <ComponentRenderer data={ghostWire} isSelected={false} isWireMode={true} onClick={() => {}} simData={{nodes:{}, currents:{}}} capVoltage={0} isGhost={true} />}

      {/* O'chirish / Aylantirish */}
      {selectedId && !isPlaying && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-50">
           <button onClick={handleRotate} className="p-3 bg-white text-slate-600 rounded-full shadow-xl hover:scale-110 transition-transform border border-slate-100"><RotateCw size={24} /></button>
           <button onClick={handleDelete} className="p-3 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform"><Trash size={24} /></button>
        </div>
      )}
    </div>
  );
};

const ComponentRenderer: React.FC<{ data: CircuitComponent, isSelected: boolean, isWireMode: boolean, onClick: (e: React.MouseEvent) => void, simData: any, capVoltage: number, isGhost?: boolean }> = ({ data, isSelected, isWireMode, onClick, simData, capVoltage, isGhost }) => {
    const gridLen = data.properties.length || 3;
    const length = gridLen * GRID_SIZE;
    const current = simData.currents[data.id] || 0;
    
    if (data.type === ComponentType.WIRE) {
        return (
            <div className={`absolute flex items-center justify-center ${isGhost ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                style={{ left: data.x * GRID_SIZE, top: data.y * GRID_SIZE, width: length, height: GRID_SIZE, transform: `rotate(${data.rotation}deg)`, transformOrigin: '0px 20px', zIndex: isSelected ? 30 : 10 }} onClick={onClick}>
                 <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full ${isGhost ? 'bg-amber-300 border-dashed border-amber-500' : 'bg-amber-600'} ${isSelected ? 'ring-2 ring-cyan-400' : ''}`} />
                 {!isGhost && !isWireMode && Math.abs(current) > 0.01 && (<div className="absolute -top-4 bg-slate-800 text-[9px] text-white px-1 rounded">{current.toFixed(2)}A</div>)}
            </div>
        );
    }
    
    let content = null;
    if(data.type === ComponentType.BATTERY) content = <div className="flex items-center gap-1"><div className="w-0.5 h-6 bg-slate-600"/><div className="w-0.5 h-3 bg-slate-600"/><div className="w-0.5 h-6 bg-slate-600"/><div className="w-0.5 h-3 bg-slate-600"/></div>;
    else if(data.type === ComponentType.RESISTOR) content = <div className="w-full h-3 border-2 border-slate-600 bg-white rounded-sm"/>;
    else if(data.type === ComponentType.LAMP) { const b = Math.min(Math.abs(current)*10,1); content = <div className={`w-8 h-8 rounded-full border-2 border-slate-500 bg-slate-200 flex items-center justify-center relative overflow-hidden ${b>0.1?`shadow-[0_0_15px_rgba(250,204,21,${b})]`:''}`}><div className="absolute inset-0 bg-yellow-400 transition-opacity" style={{opacity:b}}/><span className="relative z-10 text-xs">X</span></div>; }
    else if(data.type === ComponentType.SWITCH) content = <div className="w-full h-full flex items-center justify-center"><div className={`w-8 h-1 bg-slate-700 transition-transform origin-left ${data.properties.isOn?'rotate-0':'-rotate-30'}`}/></div>;
    else if(data.type === ComponentType.CAPACITOR) content = <div className="flex gap-1 items-center justify-center h-full"><div className="w-0.5 h-6 bg-slate-600"/><div className="w-0.5 h-6 bg-slate-600"/></div>;
    else if(data.type === ComponentType.VOLTMETER) content = <div className="w-8 h-8 rounded-full border-2 border-cyan-600 flex items-center justify-center bg-white text-cyan-700 font-bold text-xs">V</div>;
    else if(data.type === ComponentType.AMMETER) content = <div className="w-8 h-8 rounded-full border-2 border-lime-600 flex items-center justify-center bg-white text-lime-700 font-bold text-xs">A</div>;

    return (
        <div className={`absolute flex items-center justify-center ${isSelected ? 'z-40' : 'z-20'} cursor-grab active:cursor-grabbing`}
            style={{ left: data.x * GRID_SIZE, top: data.y * GRID_SIZE, width: length, height: GRID_SIZE, transform: `rotate(${data.rotation}deg)`, transformOrigin: '0px 20px' }} onClick={onClick}>
            
            {/* Ulanish nuqtalari (Vizual yordam uchun) */}
            <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-slate-400 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:bg-cyan-400"/>
            <div className="absolute right-0 top-1/2 w-1.5 h-1.5 bg-slate-400 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-cyan-400"/>
            
            <div className="h-0.5 w-4 bg-slate-400 absolute left-0"/> <div className="h-0.5 w-4 bg-slate-400 absolute right-0"/>
            <div className={`mx-4 flex-1 flex items-center justify-center ${isSelected ? 'ring-2 ring-cyan-500 rounded p-1' : ''}`}>
                {content || <div className="text-[8px]">{data.type}</div>}
            </div>
        </div>
    );
}

export default CircuitBoard;