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
        <div className="min-h-screen animated-bg flex flex-col">
            <header className="bg-slate-900/90 backdrop-blur-none sticky top-0 z-50 px-6 py-4 flex justify-between items-center text-white m-4 rounded-2xl shadow-lg border border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                        <img src={logo} alt="Lifexia" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Lifexia</h1>
                        <p className="text-xs text-slate-300">AI Health Assistant</p>
                    </div>
                </div>

                <nav className="flex items-center gap-4">
                    <Link to="/chat" className="hover:bg-slate-800 px-3 py-2 rounded-lg transition">Chat</Link>
                    <Link to="/map" className="hover:bg-slate-800 px-3 py-2 rounded-lg transition flex items-center gap-2">
                        <Map size={18} /> Map
                    </Link>
                    <Link to="/admin" className="hover:bg-slate-800 px-3 py-2 rounded-lg transition">Admin</Link>
                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition flex items-center gap-2">
                        <LogOut size={18} /> Logout
                    </button>
                </nav>
            </header>

            <main className="flex-1 container mx-auto p-4 mb-4">
                <div className="h-full rounded-2xl p-6 overflow-hidden relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
