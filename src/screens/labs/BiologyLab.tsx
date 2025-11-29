import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Microscope as MicroscopeIcon, Activity } from 'lucide-react';

// Komponentlar
import { Microscope } from '../../components/biology/Microscope';
import { Enzymes } from '../../components/biology/Enzymes';
import { LabAssistant } from '../../components/biology/LabAssistant';
import { ExperimentType } from '../../types';

// Faqat 2 ta bo'lim qoldirildi
const EXPERIMENTS = [
  { id: 'MICROSCOPE', title: 'Mikroskop', icon: MicroscopeIcon, color: 'bg-emerald-500' },
  { id: 'ENZYMES', title: 'Fermentlar', icon: Activity, color: 'bg-amber-500' }
];

const BiologyLab = () => {
  const navigate = useNavigate();
  const [activeExperiment, setActiveExperiment] = useState<ExperimentType>(null);
  const [aiContext, setAiContext] = useState<string>("");

  const renderExperiment = () => {
    switch (activeExperiment) {
      case 'MICROSCOPE': return <Microscope onContextUpdate={setAiContext} />;
      case 'ENZYMES': return <Enzymes onContextUpdate={setAiContext} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900 relative pb-safe">
      {/* Header */}
      <div className="bg-white shadow-sm p-3 flex items-center sticky top-0 z-20">
        <button 
          onClick={() => {
            if (activeExperiment) {
              setActiveExperiment(null);
              setAiContext("");
            } else {
              navigate(-1);
            }
          }} 
          className="p-2 hover:bg-gray-100 rounded-full mr-2 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 truncate">
          {activeExperiment ? EXPERIMENTS.find(e => e.id === activeExperiment)?.title : 'Biologiya'}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        {!activeExperiment ? (
          // --- MENU (2 ta tugma yonma-yon) ---
          <div className="p-4 grid grid-cols-2 gap-4 animate-in fade-in duration-500">
             {EXPERIMENTS.map((exp) => (
               <button
                 key={exp.id}
                 onClick={() => setActiveExperiment(exp.id as ExperimentType)}
                 className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 active:scale-95 transition-all flex flex-col items-center justify-center gap-3 aspect-square"
               >
                 {/* Katta Ikonka */}
                 <div className={`w-16 h-16 rounded-2xl ${exp.color} flex items-center justify-center text-white shadow-md`}>
                   <exp.icon className="w-8 h-8" />
                 </div>
                 {/* Nom */}
                 <h3 className="text-sm font-bold text-slate-700 text-center">{exp.title}</h3>
               </button>
             ))}
          </div>
        ) : (
          <div className="h-full w-full">
            {renderExperiment()}
          </div>
        )}
      </div>

      {/* AI Assistant */}
      {activeExperiment && (
        <LabAssistant experimentType={activeExperiment} contextData={aiContext} />
      )}
    </div>
  );
};

export default BiologyLab;