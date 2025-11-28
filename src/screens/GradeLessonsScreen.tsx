import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, PlayCircle, Lock, CheckCircle } from 'lucide-react';
import { COURSES } from '../constants';

const GradeLessonsScreen = ({ userProgress }: { userProgress: any }) => {
  const { subjectId, gradeId } = useParams();
  const navigate = useNavigate();
  
  const course = COURSES.find(c => c.id === subjectId);
  const gradeLevel = course?.grades.find(g => g.grade === Number(gradeId));

  if (!gradeLevel) return <div>Sinf topilmadi</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 p-4 border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft />
        </button>
        <h2 className="font-bold text-gray-800 truncate">{gradeLevel.title}</h2>
      </div>

      <div className="p-4 space-y-4">
        {gradeLevel.lessons.map((lesson, index) => {
            // Oldingi dars bajarilganmi? (Progressiv ochilish uchun ixtiyoriy)
            const progress = userProgress[lesson.id] || {};
            const isCompleted = progress.taskCompleted;
            
            return (
              <div 
                key={lesson.id} 
                onClick={() => navigate(`/app/lesson/${lesson.id}`)}
                className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-all"
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                  <img src={lesson.thumbnail} className="w-full h-full object-cover opacity-80" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isCompleted ? (
                        <div className="bg-green-500 rounded-full p-1"><CheckCircle className="text-white w-4 h-4" /></div>
                    ) : (
                        <PlayCircle className="text-white w-8 h-8" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-gray-800 line-clamp-2 mb-1">{index + 1}. {lesson.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{lesson.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                        ⏱ {lesson.duration}
                    </span>
                    {progress.score > 0 && (
                        <span className="text-[10px] font-bold bg-yellow-50 text-yellow-600 px-2 py-1 rounded-md">
                            ⭐ {progress.score} ball
                        </span>
                    )}
                  </div>
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default GradeLessonsScreen;