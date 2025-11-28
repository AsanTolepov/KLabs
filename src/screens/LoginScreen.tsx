import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { auth, db, googleProvider } from '../services/firebase'; 
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile, 
    signInWithPopup,
    setPersistence, 
    browserLocalPersistence,
    AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuccess = () => {
    navigate('/app', { replace: true }); // /welcome o'rniga /app ga yo'naltirish ishonchliroq
  };

  // Email/Parol orqali kirish
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        await setPersistence(auth, browserLocalPersistence);

        if (isSignUp) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: name });
            
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                xp: 0,
                level: 1,
                badges: [],
                progress: {}
            });
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
        handleSuccess(); 
    } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') setError("Bu email band.");
        else if (err.code === 'auth/invalid-credential') setError("Email yoki parol xato.");
        else setError("Xatolik: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  // Google Login (WEBVIEW UCHUN MAXSUS)
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
        // 1. Sessiyani saqlashni majburlaymiz
        await setPersistence(auth, browserLocalPersistence);

        // 2. POPUP orqali ochish
        // Median ilovasida bu alohida oyna ochadi, Redirect EMAS.
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // 3. Foydalanuvchi bazada bormi tekshiramiz
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: user.displayName || "Student",
                email: user.email,
                xp: 0,
                level: 1,
                badges: [],
                progress: {}
            });
        }
        
        handleSuccess();
        
    } catch (err: any) {
        console.error("Google Login Error Full:", err);
        
        // Xatoliklarni aniqroq ko'rsatish
        const errorCode = err.code;
        
        if (errorCode === 'auth/popup-closed-by-user') {
            setError("Kirish oynasi yopildi.");
        } else if (errorCode === 'auth/popup-blocked') {
            setError("Brauzer oynasi bloklandi. Ruxsat bering.");
        } else if (errorCode === 'auth/cancelled-popup-request') {
            setError("Jarayon bekor qilindi.");
        } else {
            // Eng muhim joy: Agar WebView sababli bo'lsa:
            setError(`Xatolik: ${err.message}. Internetni tekshiring.`);
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-center px-6">
      <div className="relative z-10 w-full max-w-sm mx-auto">
        
        <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-3xl shadow-xl shadow-blue-200">
                <Atom className="w-12 h-12 text-blue-600" />
            </div>
        </div>

        <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-gray-800 mb-2">
                {isSignUp ? "Ro'yxatdan o'tish" : "Xush kelibsiz!"}
            </h1>
            <p className="text-gray-500">O'qishni boshlash uchun kiring</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-white">
            
            {/* Google Button */}
            <button 
                onClick={handleGoogleLogin}
                type="button"
                disabled={loading}
                className="w-full bg-white border border-gray-200 text-gray-700 p-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center mb-4"
            >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 4.66c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google orqali kirish
            </button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">yoki email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl text-center font-bold border border-red-100">
                        {error}
                    </div>
                )}

                {isSignUp && (
                    <div className="bg-gray-50 rounded-xl flex items-center px-4 border border-gray-100 focus-within:border-blue-500 transition-all">
                        <User className="text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Ismingiz" 
                            className="w-full bg-transparent p-4 outline-none text-gray-700"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}
                 
                <div className="bg-gray-50 rounded-xl flex items-center px-4 border border-gray-100 focus-within:border-blue-500 transition-all">
                    <Mail className="text-gray-400 w-5 h-5" />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full bg-transparent p-4 outline-none text-gray-700"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="bg-gray-50 rounded-xl flex items-center px-4 border border-gray-100 focus-within:border-blue-500 transition-all">
                    <Lock className="text-gray-400 w-5 h-5" />
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Parol" 
                        className="w-full bg-transparent p-4 outline-none text-gray-700"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-5 h-5 text-gray-400"/> : <Eye className="w-5 h-5 text-gray-400"/>}
                    </button>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>
                            {isSignUp ? "Ro'yxatdan o'tish" : "Kirish"}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                    )}
                </button>
            </form>
        </div>

        <div className="mt-6 text-center">
            <p className="text-gray-500 font-medium text-sm">
                {isSignUp ? "Hisobingiz bormi?" : "Hali hisobingiz yo'qmi?"}
                <button 
                    onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                    className="ml-2 text-blue-600 font-bold hover:underline"
                >
                    {isSignUp ? "Kirish" : "Ro'yxatdan o'ting"}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;