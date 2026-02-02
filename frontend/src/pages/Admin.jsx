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
        <div className="relative">
            {/* Broadcast Alert Popup */}
            {showBroadcastAlert && latestBroadcast && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-lg">
                        <div className="bg-white/20 p-2 rounded-full">
                            <CheckCircle size={28} />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Broadcast Sent!</p>
                            <p className="text-sm text-white/90 truncate max-w-[300px]">"{latestBroadcast.message}"</p>
                            <p className="text-xs text-white/70 mt-1">From: {latestBroadcast.source}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Broadcast Section */}
                <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Send size={20} className="text-blue-600" />
                        Send Broadcast Alert
                    </h2>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Source</label>
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="w-full p-2 rounded border border-gray-300 bg-gray-50 text-gray-800"
                            >
                                <option>Lifexia Safety Team</option>
                                <option>FDA</option>
                                <option>WHO</option>
                                <option>Ministry of Health</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Message</label>
                            <textarea
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                rows="5"
                                className="w-full p-3 rounded border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Type safety alert message..."
                            ></textarea>
                        </div>

                        <button
                            onClick={sendBroadcast}
                            disabled={!broadcastMsg.trim()}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-md transition flex items-center justify-center gap-2"
                        >
                            <Bell size={18} />
                            Broadcast to All Users
                        </button>
                        {status && (
                            <p className={`text-center font-semibold ${status.includes('✅') ? 'text-green-600' : 'text-gray-700'}`}>
                                {status}
                            </p>
                        )}
                    </div>
                </div>

                {/* Sent Broadcasts Section */}
                <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6 flex flex-col h-[calc(100vh-140px)]">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-600" />
                        Sent Broadcasts
                        {sentBroadcasts.length > 0 && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                {sentBroadcasts.length}
                            </span>
                        )}
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {sentBroadcasts.length === 0 ? (
                            <div className="text-center text-gray-400 mt-10">
                                <Bell size={40} className="mx-auto mb-2 opacity-30" />
                                <p>No broadcasts sent yet</p>
                                <p className="text-sm">Send your first broadcast!</p>
                            </div>
                        ) : (
                            sentBroadcasts.map((b, i) => (
                                <div key={i} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition">
                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                        <span className="font-bold text-green-700 flex items-center gap-1">
                                            <CheckCircle size={12} /> Sent
                                        </span>
                                        <span>{b.timestamp} • {b.date}</span>
                                    </div>
                                    <p className="text-gray-800 text-sm font-medium mb-2">"{b.message}"</p>
                                    <p className="text-xs text-gray-500">Source: {b.source}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Inbox Section */}
                <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6 flex flex-col h-[calc(100vh-140px)]">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <MessageSquare size={20} className="text-green-600" />
                            WhatsApp Inbox
                        </h2>
                        <button onClick={fetchMessages} className="text-gray-500 hover:text-blue-600 transition">
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {messages.length === 0 ? (
                            <p className="text-center text-gray-400 mt-10">No messages</p>
                        ) : (
                            messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-lg border hover:shadow-md transition cursor-pointer ${m.isBroadcast
                                            ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                                            : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span className={`font-bold ${m.isBroadcast ? 'text-red-600' : 'text-gray-700'}`}>
                                            {m.sender}
                                        </span>
                                        <span>{m.timestamp}</span>
                                    </div>
                                    <p className="text-gray-800 text-sm">{m.message}</p>
                                    {m.isBroadcast && (
                                        <span className="inline-block mt-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                                            BROADCAST ALERT
                                        </span>
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
