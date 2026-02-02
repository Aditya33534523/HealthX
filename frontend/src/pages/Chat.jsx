import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, Bot, Clock, MapPin } from 'lucide-react';
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
        <div className="flex h-full gap-6">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] p-4 rounded-2xl flex gap-3
                                ${msg.isUser
                                    ? 'bg-blue-600/80 text-white rounded-br-none backdrop-blur-sm'
                                    : msg.isMapRedirect
                                        ? 'bg-emerald-500/40 text-white rounded-bl-none backdrop-blur-sm border border-emerald-400/40 shadow-sm'
                                        : 'bg-white/40 text-gray-800 rounded-bl-none backdrop-blur-sm border border-white/40 shadow-sm'}
                            `}>
                                <div className="mt-1 shrink-0">
                                    {msg.isUser ? <User size={18} /> : msg.isMapRedirect ? <MapPin size={18} /> : <Bot size={18} />}
                                </div>
                                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/40 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="mt-4 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about medicines or find hospitals near you..."
                        className="w-full glass-input px-6 py-4 rounded-full pr-14 shadow-lg"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input}
                        className="absolute right-2 top-2 p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>

            {/* Sidebar History (Hidden on mobile) */}
            <div className={`w-80 glass-panel rounded-xl p-4 hidden lg:block ${showHistory ? 'block' : ''}`}>
                <div className="flex items-center justify-between mb-4 text-white/80 border-b border-white/20 pb-2">
                    <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <h3 className="font-semibold">Recent Consultations</h3>
                    </div>
                    <button
                        onClick={clearSession}
                        className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"
                        title="Clear current session"
                    >
                        Clear
                    </button>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-200px)] space-y-2">
                    {history.length === 0 ? (
                        <p className="text-white/50 text-sm italic">No history yet</p>
                    ) : (
                        history.map((h, i) => (
                            <div
                                key={i}
                                className="p-3 hover:bg-white/10 rounded-lg cursor-pointer transition text-sm"
                                onClick={() => handleHistoryClick(h)}
                            >
                                <p className="text-white font-medium truncate">{h.message}</p>
                                <p className="text-white/60 text-xs truncate">{new Date(h.timestamp).toLocaleString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
