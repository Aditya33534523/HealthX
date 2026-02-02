import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
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
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Full screen background image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(/lifexia-logo.png)',
                }}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80" />

            {/* Netflix-style Header with Logo */}
            <header className="relative z-20 px-6 md:px-12 py-6">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.jpg"
                        alt="Lifexia"
                        className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover shadow-lg ring-2 ring-white/20"
                    />
                    <h1 className="text-3xl md:text-4xl font-bold text-emerald-400 tracking-tight drop-shadow-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Lifexia
                    </h1>
                </div>
            </header>

            {/* Login Form - Glass Effect */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 md:p-12 shadow-2xl shadow-black/50">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-white/60 mb-8">
                        {isRegister ? 'Join Lifexia for personalized health assistance' : 'Sign in to access your AI health assistant'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-4 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-white/40 transition-all hover:bg-white/15"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-4 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-white/40 transition-all hover:bg-white/15"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600/90 hover:bg-emerald-500 backdrop-blur-sm text-white font-semibold py-4 rounded-xl text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (isRegister ? 'Creating Account...' : 'Signing In...') : (isRegister ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-white/60 text-base">
                            {isRegister ? 'Already have an account? ' : 'New to Lifexia? '}
                            <span
                                className="text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer font-medium transition-colors"
                                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            >
                                {isRegister ? 'Sign in' : 'Sign up now'}
                            </span>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-6 px-6 md:px-12">
                <p className="text-white/30 text-sm text-center">
                    © 2026 Lifexia. AI Health Assistant. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default Login;
