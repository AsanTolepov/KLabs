import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { COURSES } from '../constants';
import { Atom, Flame, Zap, Sprout, Play, Star, TrendingUp } from 'lucide-react';

const HomeScreen = ({ user }: { user: User }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F4F8] pb-24 relative overflow-hidden">
      {/* ORQA FON EFFEKTLARI (BLOBS) */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[20%] left-[20%] w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>

      {/* HEADER QISMI */}
      <div className="pt-8 px-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-0.5">Xush kelibsiz,</p>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
              {user.name.split(' ')[0]} <span className="inline-block animate-wave">👋</span>
            </h2>
          </div>
          
          {/* XP Karti */}
          <div className="bg-white/80 backdrop-blur-sm p-2 pl-3 pr-4 rounded-2xl shadow-sm border border-white/50 flex items-center space-x-2 transition-transform hover:scale-105">
             <div className="bg-orange-100 p-1.5 rounded-full">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
             </div>
             <div className="flex flex-col leading-none">
                <span className="font-black text-gray-800 text-sm">{user.xp}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">ball</span>
             </div>
          </div>
        </div>

        {/* KUNLIK VAZIFA BANNERI (Hero Section) */}
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group cursor-pointer transition-transform active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-3">
                <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md border border-white/10 flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-300 fill-yellow-300" /> Kunlik Vazifa
                </span>
            </div>
            <h3 className="font-bold text-xl mb-1 w-2/3 leading-tight">Kimyo laboratoriyasini bajaring</h3>
            <p className="text-blue-100 text-sm mb-4 opacity-90">Noyob "Alkimyogar" nishonini yutib oling!</p>
            
            <button className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-50 transition flex items-center">
              <Play className="w-4 h-4 mr-2 fill-current" /> Boshlash
            </button>
          </div>
          {/* Dekorativ Ikonka */}
          <Atom className="absolute -right-4 -bottom-4 w-36 h-36 text-white opacity-10 group-hover:scale-110 transition-transform duration-500 rotate-12" />
        </div>

        {/* KURSLAR BO'LIMI */}
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-gray-800">Mening Kurslarim</h3>
            <span className="text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1 rounded-full">Barchasi</span>
        </div>

        <div className="grid gap-5 pb-10">
          {COURSES.map((course, index) => {
              const Icon = course.icon === 'Atom' ? Atom : course.icon === 'Zap' ? Zap : Sprout;
              
              // Har bir kurs uchun o'ziga xos gradient va ranglar
              const bgGradient = 
                course.id === 'chemistry' ? 'from-blue-500/10 to-cyan-500/10 border-blue-100' :
                course.id === 'physics' ? 'from-orange-500/10 to-amber-500/10 border-orange-100' :
                'from-green-500/10 to-emerald-500/10 border-green-100';

              const iconBg = 
                course.id === 'chemistry' ? 'bg-blue-100 text-blue-600' :
                course.id === 'physics' ? 'bg-orange-100 text-orange-600' :
                'bg-green-100 text-green-600';

              return (
                  <div 
                    key={course.id} 
                    onClick={() => navigate(`/app/course/${course.id}`)}
                    className={`bg-gradient-to-br ${bgGradient} bg-white p-5 rounded-[2rem] shadow-sm border flex items-center hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden`}
                  >
                      {/* Kichik dekorativ doira */}
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-bl-[4rem] transition-all group-hover:scale-125`}></div>

                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-5 shadow-sm ${iconBg} relative z-10`}>
                          <Icon className="w-8 h-8 transform group-hover:rotate-12 transition-transform duration-300" />
                      </div>
                      
                      <div className="relative z-10 flex-1">
                          <h4 className="font-black text-lg text-gray-800 mb-1">{course.title}</h4>
                          <div className="flex items-center text-gray-500 text-xs font-medium mb-3">
                              <span className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100 mr-2">
                                {course.lessons.length} Dars
                              </span>
                              <TrendingUp className="w-3 h-3 mr-1" /> 25% Bajarildi
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-full rounded-full ${course.id === 'chemistry' ? 'bg-blue-500' : course.id === 'physics' ? 'bg-orange-500' : 'bg-green-500'}`} 
                                style={{ width: '25%' }}
                              ></div>
                          </div>
                      </div>
                  </div>
              )
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;