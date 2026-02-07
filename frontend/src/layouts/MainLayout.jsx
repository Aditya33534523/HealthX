import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { History, LogOut, Map } from 'lucide-react';
import logo from '../assets/logo.jpg';
import api from '../utils/api';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show header on login page
    const isLoginPage = location.pathname === '/';

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (isLoginPage) {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Medical/Healthcare Background - Blue to Teal Gradient with ECG */}
            <div 
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: 'url("/Gemini_Generated_Image_6ar21u6ar21u6ar2.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            
            {/* Subtle overlay to ensure text readability */}
            <div className="fixed inset-0 bg-black/20 z-0" />

            {/* Floating Medical Icons Decorations */}
            <div className="fixed top-[15%] left-[8%] w-16 h-16 opacity-10 animate-pulse float" style={{ animationDelay: '0s' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
            </div>
            <div className="fixed top-[25%] right-[10%] w-14 h-14 opacity-10 animate-bounce float" style={{ animationDelay: '1.5s' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <div className="fixed bottom-[20%] left-[12%] w-12 h-12 opacity-10 float" style={{ animationDelay: '3s' }}>
                <svg viewBox="0 0 24 24" fill="white" strokeWidth="0">
                    <path d="M19.5 7.5h-4v-4h-7v4h-4v7h4v4h7v-4h4v-7z" />
                </svg>
            </div>
            <div className="fixed bottom-[30%] right-[15%] w-10 h-10 opacity-10 animate-pulse float" style={{ animationDelay: '2s' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            </div>
            <div className="fixed top-[45%] left-[5%] w-8 h-8 opacity-10 float" style={{ animationDelay: '4s' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            </div>

            <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center text-white m-4 rounded-2xl shadow-lg border border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                        <img src={logo} alt="Lifexia" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">LIFEXIA</h1>
                        <p className="text-xs text-slate-300">AI Health Assistant</p>
                    </div>
                </div>

                <nav className="flex items-center gap-4">
                    <Link to="/chat" className="hover:bg-slate-800/50 px-3 py-2 rounded-lg transition">Chat</Link>
                    <Link to="/map" className="hover:bg-slate-800/50 px-3 py-2 rounded-lg transition flex items-center gap-2">
                        <Map size={18} /> Map
                    </Link>
                    <Link to="/admin" className="hover:bg-slate-800/50 px-3 py-2 rounded-lg transition">Admin</Link>
                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition flex items-center gap-2">
                        <LogOut size={18} /> Logout
                    </button>
                </nav>
            </header>

            <main className="flex-1 container mx-auto p-4 mb-4 relative z-10">
                <div className="h-full rounded-2xl p-6 overflow-hidden relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;