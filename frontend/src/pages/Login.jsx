import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Activity } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isRegister ? '/register' : '/login';
            const res = await api.post(endpoint, { email, password });
            if (res.data.success) {
                if (isRegister) {
                    setIsRegister(false);
                    setError('');
                    alert('Registered successfully! Please login.');
                } else {
                    navigate('/chat');
                }
            } else {
                setError(res.data.error || (isRegister ? 'Registration failed' : 'Login failed'));
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col font-['Outfit']">
            {/* Background Image - Pharmacy with floating pills */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("/Gemini_Generated_Image_3usb2j3usb2j3usb.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            
            {/* Dark overlay for better contrast */}
            <div className="absolute inset-0 bg-black/40 z-0" />

            {/* Decorative Floating Pills (matching the background theme) */}
            <div className="absolute top-[10%] left-[5%] w-16 h-8 bg-blue-500/20 rounded-full blur-xl animate-pulse float" style={{ animationDelay: '0s' }} />
            <div className="absolute top-[20%] right-[10%] w-12 h-24 bg-purple-500/20 rounded-full blur-xl animate-bounce float" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-[15%] left-[15%] w-20 h-10 bg-emerald-500/20 rounded-full blur-xl float" style={{ animationDelay: '2.5s' }} />
            <div className="absolute top-[60%] right-[5%] w-16 h-16 bg-pink-400/10 rounded-full blur-2xl float" style={{ animationDuration: '8s' }} />

            {/* Header */}
            <header className="relative z-20 px-6 md:px-12 py-8 flex justify-between items-center">
                <div className="flex items-center gap-4 group">
                    <div className="p-2.5 glass-panel group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <img
                            src="/logo.jpg"
                            alt="Lifexia"
                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            lifexia
                        </h1>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[4px] -mt-1">LIFEXIA AI</p>
                    </div>
                </div>
                <div className="hidden md:flex gap-6">
                    <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it works</button>
                    <button className="text-sm font-medium px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 backdrop-blur-sm transition-all">Help</button>
                </div>
            </header>

            {/* Login Form */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
                <div className="relative glass-card p-10 md:p-14 w-full max-w-lg border-white/5 backdrop-blur-3xl bg-slate-950/60">
                    <div className="absolute inset-0 bg-blue-900/20 blur-[120px] rounded-full" />
                    <div className="relative flex flex-col items-center mb-10">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl shadow-blue-500/20 float">
                            <Activity size={40} className="text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">{isRegister ? 'Create Account' : 'Sign In'}</h1>
                        <p className="text-slate-400 text-sm font-medium">
                            {isRegister ? 'Start your journey with Lifexia AI' : 'Continue to your health portal'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative">
                        <div className="space-y-2">
                            <label className="block text-slate-300 text-sm font-bold ml-1">Work Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-slate-300 text-sm font-bold ml-1">Pass-code</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-sm flex items-center gap-3 animate-head-shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-btn w-full mt-4"
                        >
                            {loading
                                ? (isRegister ? 'Creating Account...' : 'Authenticating...')
                                : (isRegister ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-8 text-center relative">
                        <p className="text-slate-400 text-sm">
                            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                            <button
                                className="text-white hover:text-blue-400 font-bold transition-all underline underline-offset-4 decoration-blue-500/30"
                                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                                type="button"
                            >
                                {isRegister ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    © 2026 lifexia intelligent systems
                </p>
                <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <button className="hover:text-white transition-colors">Privacy</button>
                    <button className="hover:text-white transition-colors">Terms</button>
                    <button className="hover:text-white transition-colors">Clinical Ethics</button>
                </div>
            </footer>
        </div>
    );
};


export default Login;