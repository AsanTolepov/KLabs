import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Loader2, Flame, Zap } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { User } from '../types';

const LeaderboardScreen = () => {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("xp", "desc"), limit(20));
        
        const querySnapshot = await getDocs(q);
        const usersList: User[] = [];

        querySnapshot.forEach((doc) => {
          // @ts-ignore
          usersList.push({ id: doc.id, ...doc.data() });
        });

        setLeaders(usersList);

        if (currentUserId) {
            // @ts-ignore
            const myIndex = usersList.findIndex(u => u.uid === currentUserId);
            if (myIndex !== -1) {
                setCurrentUserRank(myIndex + 1);
                setCurrentUserData(usersList[myIndex]);
            } else {
                setCurrentUserRank(21); 
            }
        }
      } catch (error) {
        console.error("Xato:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentUserId]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  const top1 = leaders[0];
  const top2 = leaders[1];
  const top3 = leaders[2];
  const restUsers = leaders.slice(3, 20);

  // @ts-ignore
  const getAvatar = (u) => u?.photoURL ? <img src={u.photoURL} className="w-full h-full rounded-full object-cover"/> : "🎓";

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-20 max-w-md mx-auto w-full">
            <h1 className="text-xl font-bold flex items-center gap-2 justify-center text-gray-800">
                <Trophy className="text-yellow-500 fill-yellow-500 w-6 h-6" /> Reyting
            </h1>
        </div>

        {/* Main Container */}
        <div className="max-w-md mx-auto w-full relative">
            
            {/* SHOXSUPA (TOP 3) - O'ZGARTIRILDI (Balandliklar pasaytirildi) */}
            <div className="flex justify-center items-end mb-4 mt-6 gap-2 px-4">
                
                {/* 2-o'rin (Chapda) */}
                <div className="flex flex-col items-center w-1/3">
                    {top2 && (
                        <>
                            <div className="w-12 h-12 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center text-xl shadow-lg relative z-10">
                                {getAvatar(top2)}
                                <div className="absolute -bottom-2 bg-gray-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">#2</div>
                            </div>
                            <p className="font-bold text-[10px] mt-2 text-center line-clamp-1 text-gray-700">{top2.name}</p>
                            <p className="text-[10px] text-blue-600 font-bold mb-1">{top2.xp} XP</p>
                            
                            {/* Pedestal 2 - Balandligi h-14 ga tushirildi */}
                            <div className="h-14 w-full bg-gradient-to-t from-gray-300 to-gray-100 rounded-t-lg shadow-sm opacity-90"></div>
                        </>
                    )}
                </div>

                {/* 1-o'rin (O'rtada) */}
                <div className="flex flex-col items-center w-1/3 z-10">
                    {top1 && (
                        <>
                            <Crown className="text-yellow-500 animate-bounce w-6 h-6 mb-0.5" />
                            <div className="w-16 h-16 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center text-3xl shadow-xl relative z-10">
                                {getAvatar(top1)}
                                <div className="absolute -bottom-2.5 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">#1</div>
                            </div>
                            <p className="font-bold text-xs mt-3 text-center line-clamp-1 text-gray-800">{top1.name}</p>
                            <p className="text-xs text-blue-600 font-black mb-1">{top1.xp} XP</p>
                            
                            {/* Pedestal 1 - Balandligi h-20 ga tushirildi */}
                            <div className="h-20 w-full bg-gradient-to-t from-yellow-300 to-yellow-100 rounded-t-xl shadow-md"></div>
                        </>
                    )}
                </div>

                {/* 3-o'rin (O'ngda) */}
                <div className="flex flex-col items-center w-1/3">
                    {top3 && (
                        <>
                            <div className="w-12 h-12 rounded-full bg-orange-100 border-4 border-orange-300 flex items-center justify-center text-xl shadow-lg relative z-10">
                                {getAvatar(top3)}
                                <div className="absolute -bottom-2 bg-orange-400 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">#3</div>
                            </div>
                            <p className="font-bold text-[10px] mt-2 text-center line-clamp-1 text-gray-700">{top3.name}</p>
                            <p className="text-[10px] text-blue-600 font-bold mb-1">{top3.xp} XP</p>
                            
                            {/* Pedestal 3 - Balandligi h-10 ga tushirildi */}
                            <div className="h-10 w-full bg-gradient-to-t from-orange-300 to-orange-100 rounded-t-lg shadow-sm opacity-90"></div>
                        </>
                    )}
                </div>
            </div>

            {/* RO'YXAT (4-20) */}
            <div className="px-4 space-y-2.5">
                {restUsers.map((u, index) => (
                    <div key={index} className={`flex items-center p-3 rounded-xl border ${u.uid === currentUserId ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-100'} shadow-sm`}>
                        <span className="w-6 text-center font-bold text-gray-400 text-sm">#{index + 4}</span>
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm mx-3 border border-gray-200">{getAvatar(u)}</div>
                        <div className="flex-1">
                            <p className={`font-bold text-sm line-clamp-1 ${u.uid === currentUserId ? 'text-blue-700' : 'text-gray-800'}`}>{u.name}</p>
                            <div className="flex gap-2 text-[10px] text-gray-400">
                                <span>{u.level}-daraja</span>
                                {u.streak > 0 && <span className="text-orange-500 flex items-center"><Flame className="w-3 h-3 mr-0.5"/> {u.streak}</span>}
                            </div>
                        </div>
                        <span className="font-bold text-indigo-600 text-sm">{u.xp} XP</span>
                    </div>
                ))}
            </div>
        </div>

        {/* SIZNING NATIJANGIZ (PASTKI PANEL) */}
        {currentUserData && currentUserRank && currentUserRank > 3 && (
            <div className="fixed bottom-[70px] left-0 right-0 mx-auto w-[92%] max-w-md z-30 animate-slide-up">
                <div className="bg-gray-900 text-white p-3 rounded-xl shadow-2xl flex justify-between items-center border border-gray-700 backdrop-blur-sm bg-opacity-95">
                    <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-yellow-400 border-r border-gray-600 pr-3 pl-1">
                            #{currentUserRank}
                        </div>
                        <div>
                            <p className="font-bold text-sm">Sening Natijang</p>
                            <div className="flex gap-3 text-xs text-gray-300">
                                <span className="flex items-center"><Flame className="w-3 h-3 text-orange-500 mr-1"/> {currentUserData.streak || 0} kun</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-lg font-black text-blue-400 mr-2">{currentUserData.xp} XP</div>
                </div>
            </div>
        )}
    </div>
  );
};

export default LeaderboardScreen;