import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FlaskConical, ChevronLeft } from 'lucide-react';

import ElementCard from '../../components/ElementCard'; 
import Beaker from '../../components/Beaker';
import ReactionResultCard from '../../components/ReactionResultCard';
import ElementDetailModal from '../../components/ElementDetailModal';
import { ELEMENTS } from '../../constants';
import { ElementData, ReactionResult } from '../../types';
import { analyzeReaction } from '../../services/geminiService';

const ChemistryLab: React.FC = () => {
  const navigate = useNavigate();
  const [selectedElements, setSelectedElements] = useState<ElementData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<ReactionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewingElement, setViewingElement] = useState<ElementData | null>(null);

  const filteredElements = useMemo(() => {
    return ELEMENTS.filter(el => 
      el.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      el.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const toggleElement = (element: ElementData) => {
    if (isAnalyzing) return;
    
    // Agar element allaqachon tanlangan bo'lsa, uni olib tashlaymiz
    if (selectedElements.find(e => e.symbol === element.symbol)) {
      setSelectedElements(prev => prev.filter(e => e.symbol !== element.symbol));
    } else {
      // Maksimum 5 ta element
      if (selectedElements.length < 5) {
        setSelectedElements(prev => [...prev, element]);
      }
    }
  };

  const removeElement = (element: ElementData) => {
    if (isAnalyzing) return;
    setSelectedElements(prev => prev.filter(e => e.symbol !== element.symbol));
  };

  const clearAll = () => {
    if (isAnalyzing) return;
    setSelectedElements([]);
    setResult(null);
  };

  const handleReact = async () => {
    if (selectedElements.length < 2) return;
    setIsAnalyzing(true);
    setResult(null);
    
    // Ekranni pastga silliq tushirish (UX uchun)
    setTimeout(() => {
        const element = document.getElementById('reaction-area');
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      // --- MUHIM TUZATISH SHU YERDA ---
      // Lokal bazamiz simvollar bilan ishlaydi ("H-O"), shuning uchun .symbol yuboramiz
      const reactantSymbols = selectedElements.map(e => e.symbol);
      
      // AI va Lokal bazaga murojaat
      const analysis = await analyzeReaction(reactantSymbols);
      setResult(analysis);
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-40">
      
      {/* Header - Fixed bo'lib turadi */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 active:scale-95 transition-transform">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Virtual Kimyo</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 flex flex-col gap-6">
        
        {/* 1. Qidiruv paneli (Sticky) */}
        <div className="sticky top-14 z-30 bg-slate-50 pb-2 pt-1">
          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm ring-1 ring-slate-100 focus-within:ring-indigo-300 transition-all">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Element qidirish..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 2. Elementlar ro'yxati */}
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

        {/* Bo'sh joy */}
        <div className="h-4"></div>

        {/* 3. Reaksiya Kamerasi */}
        <div id="reaction-area" className="scroll-mt-24">
            <Beaker 
            selectedElements={selectedElements}
            onRemove={removeElement}
            onClear={clearAll}
            onReact={handleReact}
            isAnalyzing={isAnalyzing}
            />
        </div>
        
        {/* 4. Natija kartasi */}
        {result && (
          <div className="animate-slideUp">
             <ReactionResultCard result={result} onReset={() => setResult(null)} />
          </div>
        )}

      </main>

      {/* Element haqida ma'lumot Modali */}
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