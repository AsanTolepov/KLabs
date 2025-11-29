import React, { useState, useRef } from 'react';
import { User } from '../types';
import { 
  LogOut, Settings, Flame, Zap, Lock, 
  Globe, Moon, Shield, Phone, X, Trash2, Edit2, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { signOut } from 'firebase/auth'; 
import { auth, db, storage } from '../services/firebase'; 
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ACHIEVEMENTS_LIST } from '../constants';
import { useTheme } from '../context/ThemeContext';

const ProfileScreen = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const nextLevelXp = (user.level + 1) * 500;
  const progressPercent = (user.xp / nextLevelXp) * 100;
  const userAchievements = user.achievements || {};
  const unlockedCount = Object.values(userAchievements).filter(val => val === true).length;

  const handleLogout = async () => {
      try { 
        await signOut(auth); 
        navigate('/login', { replace: true });
      } catch (e) { 
        console.error("Chiqishda xatolik:", e); 
      }
  };

  // ... Rasm yuklash funksiyalari o'zgarishsiz qoladi ...
  const handleImageClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setUploading(true);
        const file = e.target.files[0];
        try {
            const storageRef = ref(storage, `avatars/${user.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });
        } catch (error) {
            alert("Rasmni yuklab bo'lmadi.");
        } finally {
            setUploading(false);
        }
    }
  };
  const handleDeleteImage = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm("Profil rasmini o'chirmoqchimisiz?")) return;
      setUploading(true);
      try {
          const storageRef = ref(storage, `avatars/${user.uid}`);
          try { await deleteObject(storageRef); } catch (e) { }
          await updateDoc(doc(db, "users", user.uid), { photoURL: "" });
      } catch (error) { } finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-24 relative overflow-hidden transition-colors duration-300">
      
      {/* --- SETTINGS MODAL (YANGILANGAN) --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-end sm:items-center backdrop-blur-sm animate-in fade-in duration-200">
            {/* Oyna balandligi h-[85vh] qilib belgilandi */}
            <div className="bg-white dark:bg-gray-800 w-full max-w-md h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 transition-colors">
                
                {/* 1. Header (Qotib turadi) */}
                <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shrink-0">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Sozlamalar</h2>
                    <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                    </button>
                </div>
                
                {/* 2. Content (Aylanadi/Scroll bo'ladi) - flex-1 berilgan */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    
                    {/* Til */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Til Sozlamalari</p>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Ilova tili</span>
                            </div>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">O'zbek tili</span>
                        </div>
                    </div>

                    {/* Ko'rinish */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Ko'rinish</p>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
                                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Tungi rejim</span>
                            </div>
                            <div 
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>

                    {/* Xavfsizlik */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Xavfsizlik</p>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                            <div className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80">
                                <Shield className="w-5 h-5 text-green-600 dark:text-green-400"/>
                                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Maxfiylik siyosati</span>
                            </div>
                            <div className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 border-t border-gray-100 dark:border-gray-700">
                                <Phone className="w-5 h-5 text-orange-600 dark:text-orange-400"/>
                                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Biz bilan bog'lanish</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bo'sh joy (Scroll oxiri ko'rinishi uchun) */}
                    <div className="h-4"></div>
                </div>

                {/* 3. Footer (CHIQISH TUGMASI - Har doim pastda ko'rinadi) */}
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0 pb-8 sm:pb-4">
                    <button 
                        onClick={handleLogout} 
                        className="w-full p-3.5 bg-white dark:bg-gray-700 border-2 border-red-100 dark:border-red-900/30 text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                    >
                        <LogOut className="w-5 h-5"/> Hisobdan chiqish
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-2">Atomix Academy v1.0.5</p>
                </div>
            </div>
        </div>
      )}

      {/* ... QOLGAN KOD O'ZGARMAGAN (Header, Avatar, Statistika, Yutuqlar) ... */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 p-6 pb-16 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
         {/* Bu qismlar eski kodingizda bor, shunday qoldiring */}
         <div className="flex justify-between items-center mb-6 relative z-10">
          <h1 className="text-xl font-bold text-white">Mening Profilim</h1>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition border border-white/10 active:scale-90">
            <Settings className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex flex-col items-center relative z-10">
            <div className="relative mb-3 group">
                <div 
                    className="w-28 h-28 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-white/20 overflow-hidden cursor-pointer relative"
                    onClick={handleImageClick}
                >
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    ) : user.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-5xl">👨‍🎓</span>
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                {user.photoURL && !uploading && (
                    <button 
                        onClick={handleDeleteImage}
                        className="absolute bottom-0 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 border-2 border-white"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
                <div className="absolute top-0 -right-2 bg-yellow-400 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                    LVL {user.level}
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-blue-100 text-sm opacity-80">{user.email}</p>
        </div>
      </div>

      <div className="px-6 -mt-10 relative z-20">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="mb-5">
            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                <span>Jami Tajriba</span>
                <span className="text-blue-600 dark:text-blue-400">{user.xp} / {nextLevelXp} XP</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(progressPercent, 100)}%` }}></div>
            </div>
          </div>

          <div className="flex gap-4">
             <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl flex items-center gap-3 border border-orange-100 dark:border-orange-900/30">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm text-orange-500">
                    <Flame className="w-5 h-5 fill-current"/>
                </div>
                <div>
                    <div className="text-lg font-black text-gray-800 dark:text-gray-100 leading-none">{user.streak || 0}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Kun streak</div>
                </div>
             </div>

             <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl flex items-center gap-3 border border-blue-100 dark:border-blue-900/30">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm text-blue-500">
                    <Zap className="w-5 h-5 fill-current"/>
                </div>
                <div>
                    <div className="text-lg font-black text-gray-800 dark:text-gray-100 leading-none">{user.accuracy || 0}%</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Aniqlik</div>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-6 px-1">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 dark:text-white text-base">Yutuqlarim</h3>
                <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                    {unlockedCount}/{ACHIEVEMENTS_LIST.length}
                </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 pb-20">
            {ACHIEVEMENTS_LIST.map((ach) => {
                const isUnlocked = userAchievements[ach.id] === true;
                return (
                <div key={ach.id} className={`relative flex flex-col items-center justify-center p-2 py-3 rounded-2xl w-full transition-all duration-300 border ${isUnlocked ? 'bg-white dark:bg-gray-800 border-white dark:border-gray-700 shadow-sm shadow-blue-900/5 scale-100' : 'bg-slate-50 dark:bg-gray-800/50 border-slate-100 dark:border-gray-800 opacity-60 grayscale'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 shadow-sm ${isUnlocked ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800' : 'bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
                        {isUnlocked ? ach.icon : <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                    </div>
                    <div className="text-center w-full">
                        <h4 className={`text-[11px] font-bold leading-tight ${isUnlocked ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{ach.title}</h4>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;