import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, GraduationCap } from 'lucide-react';
import { COURSES } from '../constants';

const SubjectGradesScreen = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const course = COURSES.find(c => c.id === subjectId);

  if (!course) return <div>Fan topilmadi</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm mr-4">
          <ChevronLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
          <p className="text-gray-500 text-sm">Sinfni tanlang</p>
        </div>
      </div>

      <div className="grid gap-4">
        {course.grades.map((grade) => (
          <button
            key={grade.grade}
            onClick={() => navigate(`/app/course/${subjectId}/grade/${grade.grade}`)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 text-white text-xl font-bold`} style={{ backgroundColor: course.color }}>
                {grade.grade}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-800 text-lg">{grade.grade}-Sinf</h3>
                <p className="text-gray-400 text-xs">{grade.lessons.length} ta mavzu</p>
              </div>
            </div>
            <GraduationCap className="text-gray-300 w-6 h-6" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectGradesScreen;