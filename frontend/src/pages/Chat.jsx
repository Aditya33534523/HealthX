import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, Bot, Clock, MapPin, RefreshCw } from 'lucide-react';
import api from '../utils/api';

const SESSION_STORAGE_KEY = 'lifexia_chat_messages';

// Location intent patterns
const locationPatterns = [
    /(?:find|show|search|look for|locate|get|need|want)\s+(?:a\s+)?(.+?)\s+(?:hospital|clinic|medical|healthcare)s?\s+(?:near|nearby|close to|around|in my area|by me|near me)/i,
    /(.+?)\s+(?:hospital|clinic)s?\s+(?:near|nearby|close to|around|in my area|near me)/i,
    /(?:hospital|clinic)s?\s+(?:for|specializing in|that treat)\s+(.+?)\s+(?:near|nearby|close|around|near me)/i,
    /(?:nearby|nearest|close|closest)\s+(.+?)\s+(?:hospital|clinic|doctor|specialist)/i,
    /(?:where can i find|where is|looking for)\s+(?:a\s+)?(.+?)\s+(?:hospital|clinic|specialist|doctor)/i
];

const specialtyKeywords = {
    'orthopaedic': ['orthopedic', 'orthopaedic', 'bone', 'joint', 'fracture', 'ortho'],
    'gynaecology': ['gynae', 'gynecology', 'gynaecology', 'women', 'pregnancy', 'maternity', 'obstetr'],
    'multispeciality': ['multispeciality', 'multi specialty', 'general', 'all'],
    'medicine': ['medicine', 'physician', 'general medicine', 'internal'],
    'skin': ['skin', 'derma', 'dermatology']
};

const detectLocationIntent = (message) => {
    const lowerMsg = message.toLowerCase();

    // Check for "near me" or location keywords
    const hasLocationKeyword = lowerMsg.includes('near me') ||
        lowerMsg.includes('nearby') ||
        lowerMsg.includes('closest') ||
        lowerMsg.includes('nearest') ||
        lowerMsg.includes('around me');

    if (!hasLocationKeyword) return null;

    // Try to extract specialty
    for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
        for (const keyword of keywords) {
            if (lowerMsg.includes(keyword)) {
                return specialty;
            }
        }
    }

    // Generic hospital search
    if (lowerMsg.includes('hospital') || lowerMsg.includes('clinic')) {
        return 'all';
    }

    return null;
};

const Chat = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Save messages to sessionStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        // Load messages from sessionStorage
        const savedMessages = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages);
                if (parsed.length > 0) {
                    setMessages(parsed);
                    return; // Don't show welcome message if we have history
                }
            } catch (e) {
                console.error('Failed to parse saved messages', e);
            }
        }

        // Initial welcome message only if no saved messages
        setMessages([{
            text: "Hello! I'm Lifexia. Ask me anything about medicines, safety, or interactions. You can also ask me to find hospitals near you - try 'orthopedic hospital near me'!",
            isUser: false
        }]);

        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await api.get('/history');
            if (res.data.success) {
                setHistory(res.data.chats);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
        setInput('');

        // Check for location intent
        const locationSpecialty = detectLocationIntent(userMsg);
        if (locationSpecialty) {
            // Add bot response about redirecting
            const specialtyText = locationSpecialty === 'all' ? '' : ` for ${locationSpecialty}`;
            setMessages(prev => [...prev, {
                text: `I'll help you find hospitals${specialtyText} near you! Redirecting to the map...`,
                isUser: false,
                isMapRedirect: true,
                specialty: locationSpecialty
            }]);

            // Redirect to map after short delay
            setTimeout(() => {
                navigate(locationSpecialty === 'all' ? '/map' : `/map?specialty=${locationSpecialty}`);
            }, 1500);
            return;
        }

        setLoading(true);

        try {
            // Get user's location
            let lat = 23.0225, lon = 72.5714; // Default
            if (navigator.geolocation) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;
                } catch (e) {
                    console.log('Using default location');
                }
            }

            const res = await api.post('/chat', {
                message: userMsg,
                lat,
                lon
            });

            if (res.data.success) {
                setMessages(prev => [...prev, { text: res.data.response, isUser: false }]);
            } else {
                setMessages(prev => [...prev, { text: "Error: " + res.data.error, isUser: false }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { text: "Network Error", isUser: false }]);
        } finally {
            setLoading(false);
        }
    };

    const handleHistoryClick = (chat) => {
        // Add the historical conversation to current messages
        setMessages(prev => [
            ...prev,
            { text: chat.message, isUser: true },
            { text: chat.response, isUser: false }
        ]);
    };

    const clearSession = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setMessages([{
            text: "Hello! I'm Lifexia. Ask me anything about medicines, safety, or interactions. You can also ask me to find hospitals near you - try 'orthopedic hospital near me'!",
            isUser: false
        }]);
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 font-['Outfit'] relative">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative z-10">
                <div className="flex-1 overflow-y-auto pr-4 space-y-6 scroll-smooth">
                    {messages.length <= 1 && !loading && (
                        <div className="py-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                            <div className="flex flex-col items-center text-center mb-12">
                                <div className="w-24 h-24 glass-panel flex items-center justify-center mb-6 float shadow-blue-500/20">
                                    <Bot size={48} className="text-blue-400" />
                                </div>
                                <h2 className="text-5xl font-black text-white mb-2 tracking-tight">
                                    Hello! I'm <span className="text-blue-500">lifexia,</span>
                                </h2>
                                <p className="text-xl text-slate-400 font-medium">your AI Health Assistant</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-white/5 pt-10">
                                {[
                                    { title: "What is diabetes?", icon: "💊", color: "blue" },
                                    { title: "Medication safety?", icon: "🛡️", color: "emerald" },
                                    { title: "Find hospitals?", icon: "🏥", color: "purple" },
                                    { title: "Drug interactions?", icon: "🧪", color: "amber" },
                                    { title: "Dosage guides?", icon: "📊", color: "indigo" },
                                    { title: "Side effects?", icon: "⚠️", color: "red" }
                                ].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setInput(suggestion.title); }}
                                        className="glass-card p-6 text-left group hover:border-blue-500/50 transition-all duration-500"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-2xl">{suggestion.icon}</span>
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                <Send size={12} />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{suggestion.title}</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Learn more</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.length > 1 && messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`
                                max-w-[85%] p-5 rounded-3xl flex gap-4
                                ${msg.isUser
                                    ? 'bg-blue-600/90 text-white rounded-br-none shadow-xl shadow-blue-600/20'
                                    : 'glass-card rounded-bl-none border-white/10'}
                            `}>
                                <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.isUser ? 'bg-white/20' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {msg.isUser ? <User size={16} /> : msg.isMapRedirect ? <MapPin size={16} /> : <Bot size={16} />}
                                </div>
                                <div className="flex-1">
                                    {!msg.isUser && !msg.isMapRedirect && <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Lifexia Assistant</p>}
                                    <div className="whitespace-pre-wrap leading-relaxed text-[15px] font-medium">{msg.text}</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="glass-card p-5 rounded-3xl rounded-bl-none flex gap-2 items-center border-white/10">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                    <form onSubmit={handleSend} className="relative group">
                        <div className="absolute inset-0 bg-blue-500/10 blur-xl group-focus-within:bg-blue-500/20 transition-all rounded-full" />
                        <div className="relative flex gap-3 items-center">
                            <button
                                type="button"
                                onClick={() => setMessages([])}
                                className="p-4 glass-card rounded-2xl text-slate-400 hover:text-white transition-all border-white/5 flex items-center gap-2 whitespace-nowrap"
                            >
                                <RefreshCw size={18} />
                                <span className="text-sm font-bold hidden md:inline">Clear</span>
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask lifexia anything..."
                                className="flex-1 glass-input py-5 pr-16 shadow-2xl"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input}
                                className="absolute right-3 p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-90"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sidebar History */}
            <div className={`w-80 glass-panel p-6 hidden xl:flex flex-col border-white/5`}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                            <Clock size={18} className="text-blue-400" />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-widest">Journal</h3>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="glass-card p-6 text-center border-dashed">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">Your health consultation history will appear here</p>
                        </div>
                    ) : (
                        history.map((h, i) => (
                            <div
                                key={i}
                                className="glass-card p-4 hover:border-blue-500/30 cursor-pointer group"
                                onClick={() => handleHistoryClick(h)}
                            >
                                <p className="text-white font-bold truncate text-sm mb-1 group-hover:text-blue-400 transition-colors">{h.message}</p>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">{new Date(h.timestamp).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="glass-card p-4 bg-blue-600/10 border-blue-500/20">
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Need Help?</p>
                        <button className="w-full py-2 bg-blue-600 rounded-lg text-xs font-black text-white uppercase tracking-widest hover:bg-blue-500 transition-colors">Contact Support</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Chat;
