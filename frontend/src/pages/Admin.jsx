import { useState, useEffect } from 'react';
import { Send, RefreshCw, MessageSquare, CheckCircle, Bell } from 'lucide-react';
import api from '../utils/api';

const Admin = () => {
    // Mock initial messages
    const [messages, setMessages] = useState([
        { sender: "User +91 9876543210", message: "Hi, I need info on insulin availability.", timestamp: "10:30 AM" },
        { sender: "User +91 9123456780", message: "Is the generic medicine store open on Sunday?", timestamp: "10:32 AM" },
        { sender: "User +91 9988776655", message: "Can I get a discount on bulk purchase?", timestamp: "10:35 AM" },
        { sender: "User +91 8877665544", message: "Thank you for the location info!", timestamp: "10:40 AM" },
        { sender: "User +91 7766554433", message: "Reporting a fake medicine shop near me.", timestamp: "10:45 AM" }
    ]);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [source, setSource] = useState('Lifexia Safety Team');
    const [status, setStatus] = useState('');
    const [sentBroadcasts, setSentBroadcasts] = useState([]);
    const [showBroadcastAlert, setShowBroadcastAlert] = useState(false);
    const [latestBroadcast, setLatestBroadcast] = useState(null);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/whatsapp/messages');
            if (res.data.success) {
                setMessages(res.data.messages);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        // Mock mode: Disable live fetch to show realistic logs
        // fetchMessages(); 
        // const interval = setInterval(fetchMessages, 10000);
        // return () => clearInterval(interval);
    }, []);

    const sendBroadcast = async () => {
        if (!broadcastMsg.trim()) return;
        setStatus('Sending...');

        const newBroadcast = {
            message: broadcastMsg,
            source: source,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString()
        };

        // Mock broadcast for demo
        setTimeout(() => {
            setStatus('✅ Broadcast Sent Successfully!');
            setLatestBroadcast(newBroadcast);
            setSentBroadcasts(prev => [newBroadcast, ...prev]);

            // Add broadcast to inbox as a sent message
            const inboxMessage = {
                sender: `📢 BROADCAST - ${source}`,
                message: broadcastMsg,
                timestamp: newBroadcast.timestamp,
                isBroadcast: true
            };
            setMessages(prev => [inboxMessage, ...prev]);

            setShowBroadcastAlert(true);
            setBroadcastMsg('');

            // Hide alert after 5 seconds
            setTimeout(() => {
                setShowBroadcastAlert(false);
                setStatus('');
            }, 5000);
        }, 1000);
    };

    return (
        <div className="relative font-['Outfit'] h-[calc(100vh-140px)]">
            {/* Broadcast Alert Popup */}
            {showBroadcastAlert && latestBroadcast && (
                <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 animate-in zoom-in duration-500">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-5 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-5 border border-white/20 backdrop-blur-xl">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <p className="font-black text-xl tracking-tight uppercase">Broadcast Signal Sent</p>
                            <p className="text-sm text-white/90 font-medium truncate max-w-[300px]">"{latestBroadcast.message}"</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Broadcast Section */}
                <div className="glass-panel p-8 flex flex-col border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                    <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Send size={20} className="text-blue-400" />
                        </div>
                        Broadcast Console
                    </h2>

                    <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Authority Source</label>
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="w-full glass-input appearance-none bg-white/5"
                            >
                                <option className="bg-slate-900">Lifexia Safety Team</option>
                                <option className="bg-slate-900">FDA</option>
                                <option className="bg-slate-900">WHO</option>
                                <option className="bg-slate-900">Ministry of Health</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Emergency Message</label>
                            <textarea
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                rows="6"
                                className="glass-input resize-none"
                                placeholder="Transmit vital health safety alerts to all connected devices..."
                            ></textarea>
                        </div>

                        <button
                            onClick={sendBroadcast}
                            disabled={!broadcastMsg.trim()}
                            className="w-full relative overflow-hidden group disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-red-600 blur-lg group-hover:blur-xl transition-all opacity-40" />
                            <div className="relative glass-btn bg-red-600/80 hover:bg-red-600 border-none shadow-red-600/20">
                                <Bell size={18} />
                                <span className="uppercase tracking-widest font-black text-xs">Transmit to all users</span>
                            </div>
                        </button>
                        {status && (
                            <p className={`text-center font-bold text-xs uppercase tracking-widest animate-pulse ${status.includes('✅') ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {status}
                            </p>
                        )}
                    </div>
                </div>

                {/* Sent Broadcasts Section */}
                <div className="glass-panel p-8 flex flex-col border-white/5 h-full">
                    <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <CheckCircle size={20} className="text-emerald-400" />
                        </div>
                        Signal Log
                        {sentBroadcasts.length > 0 && (
                            <span className="bg-emerald-500 text-white px-3 py-0.5 rounded-full text-[10px] font-black">
                                {sentBroadcasts.length}
                            </span>
                        )}
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {sentBroadcasts.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <Bell size={64} className="mx-auto mb-4" />
                                <p className="font-bold uppercase tracking-widest text-xs">No active alerts</p>
                            </div>
                        ) : (
                            sentBroadcasts.map((b, i) => (
                                <div key={i} className="glass-card p-5 border-emerald-500/20 bg-emerald-500/5 group hover:bg-emerald-500/10 transition-all duration-500">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Finalized
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500">{b.timestamp}</span>
                                    </div>
                                    <p className="text-white text-sm font-medium mb-3 leading-relaxed">"{b.message}"</p>
                                    <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center gap-2">
                                        Source: <span className="text-slate-300">{b.source}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Inbox Section */}
                <div className="glass-panel p-8 flex flex-col border-white/5 h-full">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <MessageSquare size={20} className="text-blue-400" />
                            </div>
                            Neural Link
                        </h2>
                        <button onClick={fetchMessages} className="p-2 hover:bg-white/5 rounded-lg transition-all text-slate-400 hover:text-white">
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {messages.length === 0 ? (
                            <p className="text-center py-20 opacity-30 font-bold uppercase tracking-widest text-xs">Inbox empty</p>
                        ) : (
                            messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`glass-card p-5 border-white/5 group transition-all duration-500 cursor-pointer ${m.isBroadcast
                                        ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                                        : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${m.isBroadcast ? 'text-red-400' : 'text-blue-400'}`}>
                                            {m.sender}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500">{m.timestamp}</span>
                                    </div>
                                    <p className="text-slate-200 text-sm font-medium leading-relaxed">{m.message}</p>
                                    {m.isBroadcast && (
                                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                            <span className="text-[9px] font-black text-red-400 tracking-widest uppercase">Global Alert Mode</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Admin;
