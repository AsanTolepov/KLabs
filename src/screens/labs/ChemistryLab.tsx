import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FlaskConical, ChevronLeft, Atom } from 'lucide-react';

// Komponentlar
import ElementCard from '../../components/ElementCard';
import Beaker from '../../components/Beaker';
import ReactionResultCard from '../../components/ReactionResultCard';
import ElementDetailModal from '../../components/ElementDetailModal';

// Ma'lumotlar va Turlar
import { ELEMENTS } from '../../constants';
import { ElementData, ReactionResult } from '../../types';
import { analyzeReaction } from '../../services/geminiService'; // Bu funksiya LOCAL_REACTIONS dan ma'lumot oladi

const ChemistryLab: React.FC = () => {
  const navigate = useNavigate();
  
  // State (Holat) o'zgaruvchilari
  const [selectedElements, setSelectedElements] = useState<ElementData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<ReactionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewingElement, setViewingElement] = useState<ElementData | null>(null);

  // Qidiruv bo'yicha filtrlash
  const filteredElements = useMemo(() => {
    return ELEMENTS.filter(el => 
      el.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      el.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Elementni tanlash yoki o'chirish
  const toggleElement = (element: ElementData) => {
    if (isAnalyzing) return;
    
    const exists = selectedElements.find(e => e.symbol === element.symbol);

    if (exists) {
      setSelectedElements(prev => prev.filter(e => e.symbol !== element.symbol));
    } else {
      if (selectedElements.length < 5) {
        setSelectedElements(prev => [...prev, element]);
      }
    }
  };

  // Beakerdan (idishdan) elementni o'chirish
  const removeElement = (element: ElementData) => {
    if (isAnalyzing) return;
    setSelectedElements(prev => prev.filter(e => e.symbol !== element.symbol));
  };

  // Hammasini tozalash
  const clearAll = () => {
    if (isAnalyzing) return;
    setSelectedElements([]);
    setResult(null);
  };

  // Reaksiyani boshlash
  const handleReact = async () => {
    if (selectedElements.length < 2) return;

    setIsAnalyzing(true);
    setResult(null);
    
    // UX: Ekranni pastga, reaksiya qismiga siljitish
    setTimeout(() => {
        const element = document.getElementById('reaction-area');
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      // 1. Tanlangan elementlar simvollarini olamiz
      const reactantSymbols = selectedElements.map(e => e.symbol);
      
      // 2. Servis orqali natijani olamiz (Bu LOCAL_REACTIONS bazasini tekshiradi)
      // Eslatma: analyzeReaction ichida alfasit bo'yicha saralash (sorting) bo'lishi kerak
      const analysis = await analyzeReaction(reactantSymbols);
      
      // 3. Natijani saqlaymiz
      setResult(analysis);
    } catch (error) {
      console.error("Reaksiya xatoligi:", error);
      // Xatolik bo'lsa ham bo'sh natija ko'rsatmaslik uchun alert yoki fallback qo'yish mumkin
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-40">
      
      {/* --- HEADER (Yuqori qism) --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm transition-all">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-indigo-200 shadow-lg">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Virtual Laboratoriya</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 flex flex-col gap-6">
        
        {/* 1. QIDIRUV PANELI (Sticky) */}
        <div className="sticky top-14 z-30 bg-slate-50 pb-2 pt-1 -mx-1 px-1">
          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm ring-1 ring-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Element qidirish (masalan: H, O, Na)..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 2. ELEMENTLAR RO'YXATI (Grid) */}
        {filteredElements.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {filteredElements.map((element) => (
              <ElementCard
                key={element.symbol}
                element={element}
                isSelected={!!selectedElements.find(e => e.symbol === element.symbol)}
                onSelect={toggleElement}
                onViewDetails={setViewingElement}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 flex flex-col items-center">
            <Atom className="w-12 h-12 mb-2 opacity-20" />
            <p>Bunday element topilmadi</p>
          </div>
        )}

        {/* Bo'sh joy ajratuvchi */}
        <div className="h-4"></div>

        {/* 3. REAKSIYA IDISHI (Beaker) */}
        <div id="reaction-area" className="scroll-mt-24 transition-all duration-500">
            <Beaker 
              selectedElements={selectedElements}
              onRemove={removeElement}
              onClear={clearAll}
              onReact={handleReact}
              isAnalyzing={isAnalyzing}
            />
        </div>
        
        {/* 4. NATIJA KARTASI (MoleculeViewer shu yerda ishlatilgan) */}
        {result && (
          <div className="animate-slideUp mb-8">
             <ReactionResultCard 
               result={result} 
               onReset={() => {
                 setResult(null);
                 // Ixtiyoriy: natijani yopganda elementlarni ham tozalash
                 // setSelectedElements([]); 
               }} 
             />
          </div>
        )}

      </main>

      {/* 5. ELEMENT BATAFSIL MA'LUMOTI (Modal) */}
      {viewingElement && (
        <ElementDetailModal 
          element={viewingElement} 
          atomicNumber={ELEMENTS.findIndex(e => e.symbol === viewingElement.symbol) + 1}
          onClose={() => setViewingElement(null)} 
        />
      )}
    </div>
  );
};

export default ChemistryLab;